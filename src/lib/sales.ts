import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { holdingInclude } from "@/lib/admin-serialize";
import { holdingLedger } from "@/lib/account";
import { calculate, discountProblem, formatBDT, withDiscount, type CalculatorResult, type PlanLike } from "@/lib/shares";
import { nextShareNumbers } from "@/lib/member";
import { notify, notifyPaymentReceived } from "@/lib/notify";
import { convertLeadsFor } from "@/lib/crm";
import type { PAYMENT_METHODS } from "@/lib/validation";

/**
 * Sales closed at the office: shares put in a shareholder's name, and money
 * received outside the gateway (cash, bank, bKash…). Shared by admin →
 * New share sale, Allocate shares and Record payment, so every route prices
 * and settles exactly the same way.
 */

export class SaleError extends Error {
  constructor(
    message: string,
    readonly status = 409,
    readonly field?: string,
  ) {
    super(message);
  }
}

export type SaleDiscount = { amountBDT: number; note?: string };

/**
 * Puts shares in a shareholder's name at the chart price less any office
 * discount, with the next share numbers.
 */
export async function allocateHolding(userId: string, units: number, paymentPlan: "FULL" | "INSTALLMENT", discount?: SaleDiscount) {
  const [user, plans] = await Promise.all([prisma.user.findUnique({ where: { id: userId } }), prisma.membershipPlan.findMany()]);
  if (!user) throw new SaleError("Shareholder not found.", 404);
  if (!plans.length) throw new SaleError("No membership plans are set up.");

  const quote = calculate(plans, units, paymentPlan);
  const discountBDT = discount?.amountBDT ?? 0;
  const problem = discountProblem(quote, discountBDT);
  if (problem) throw new SaleError(problem, 422, "discountBDT");
  const result = withDiscount(quote, discountBDT);
  const holding = await prisma.$transaction(async (tx) =>
    tx.shareHolding.create({
      data: {
        ...(await nextShareNumbers(tx, result.units)),
        userId,
        planId: result.plan.id,
        units: result.units,
        totalAmountBDT: result.totalBDT,
        paymentPlan,
        installmentMonths: result.installments ? result.installments.length : null,
        downPaymentBDT: result.downPaymentBDT,
        discountBDT,
        discountNote: discountBDT ? discount?.note || null : null,
      },
    }),
  );
  return { user, holding, result, discountBDT };
}

/** Tells the shareholder their new shares are on their dashboard. */
export async function notifyAllocated(
  user: { id: string; name: string; email: string },
  holdingId: string,
  result: CalculatorResult<PlanLike & { name: string }>,
  paidNow: boolean,
  discountBDT = 0,
) {
  const shares = `${result.units} unit share${result.units > 1 ? "s" : ""}`;
  await notify(user, {
    kind: "MESSAGE",
    title: `${result.units} ${result.plan.name} share${result.units > 1 ? "s" : ""} added to your account`,
    body: `The Aven team has added ${shares} (${result.plan.name}) in your name — ${formatBDT(result.totalBDT)}${
      discountBDT ? ` after a ${formatBDT(discountBDT)} discount` : ""
    }${
      !paidNow && result.installments ? `, starting with a ${formatBDT(result.installments[0].amountBDT)} down payment` : ""
    }. Your payment schedule${paidNow ? " and money receipt are" : " is"} in your dashboard.`,
    href: "/account?tab=holdings",
    holdingId,
    dedupeKey: `allocated-${holdingId}-${randomUUID().slice(0, 6)}`,
  }).catch(() => null);
}

export type OfflinePayment = {
  /** How many installments the money covers, in order from the next unpaid one (or from `installmentNo`). */
  count?: number;
  installmentNo?: number;
  amountBDT: number;
  method: (typeof PAYMENT_METHODS)[number];
  reference?: string;
  note?: string;
  /** YYYY-MM-DD, the day the money arrived (Bangladesh time). */
  paidAt?: string;
};

/**
 * Settles one or more installments in full with money received offline. Each
 * installment gets its own payment and money receipt; any gateway attempt
 * still pending for them is voided, and the holding becomes active. The next
 * unpaid installment is then what the shareholder's dashboard shows as due.
 */
export async function settleInstallments(holdingId: string, p: OfflinePayment, recordedBy: string) {
  const holding = await prisma.shareHolding.findUnique({ where: { id: holdingId }, include: holdingInclude });
  if (!holding) throw new SaleError("Holding not found.", 404);
  if (holding.status === "CANCELLED") throw new SaleError("This holding is cancelled.");

  const ledger = holdingLedger(holding);
  const unpaid = ledger.steps.filter((s) => s.status !== "SUCCESS");
  if (!unpaid.length) throw new SaleError("This holding is already fully paid.");

  const from = p.installmentNo ?? unpaid[0].n;
  const first = ledger.steps.find((s) => s.n === from);
  if (!first) throw new SaleError("That installment doesn't exist.", 422);
  if (first.status === "SUCCESS") throw new SaleError(`${first.label} is already paid.`);

  const count = Math.max(1, p.count ?? 1);
  const steps = unpaid.filter((s) => s.n >= from).slice(0, count);
  if (steps.length < count) throw new SaleError(`Only ${steps.length} payment${steps.length > 1 ? "s are" : " is"} left to pay.`, 422, "count");

  const due = steps.reduce((s, x) => s + x.amountBDT, 0);
  if (p.amountBDT !== due) {
    throw new SaleError(
      `${steps.length > 1 ? `These ${steps.length} payments come` : `${steps[0].label} comes`} to ${formatBDT(due)} — record that amount.`,
      422,
      "amountBDT",
    );
  }

  const paidAt = p.paidAt ? new Date(`${p.paidAt}T12:00:00+06:00`) : new Date();
  const batch = randomUUID().slice(0, 6).toUpperCase();
  const payments = await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { holdingId, installmentNo: { in: steps.map((s) => s.n) }, status: "PENDING" },
      data: { status: "CANCELLED", note: "Superseded by a manually recorded payment" },
    });
    const created = [];
    for (const s of steps) {
      created.push(
        await tx.payment.create({
          data: {
            holdingId,
            amountBDT: s.amountBDT,
            method: p.method,
            tranId: `MAN-${Date.now().toString(36).toUpperCase()}-${batch}-${s.n}`,
            installmentNo: s.n,
            status: "SUCCESS",
            reference: p.reference,
            note: p.note,
            recordedBy,
            paidAt,
          },
        }),
      );
    }
    if (holding.status === "PENDING_PAYMENT") await tx.shareHolding.update({ where: { id: holdingId }, data: { status: "ACTIVE" } });
    return created;
  });

  await convertLeadsFor(holding.user.email, "payment received");
  for (const pay of payments) await notifyPaymentReceived(pay.id);

  const after = ledger.steps.find((s) => s.status !== "SUCCESS" && !steps.some((x) => x.n === s.n));
  return {
    holding,
    payments,
    covered: steps.map((s) => s.label),
    totalBDT: due,
    next: after ? { label: after.label, amountBDT: after.amountBDT } : null,
  };
}
