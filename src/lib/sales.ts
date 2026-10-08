import "server-only";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { holdingInclude } from "@/lib/admin-serialize";
import { holdingLedger, paymentLabels } from "@/lib/account";
import { NO_INSTALLMENTS, calculate, discountProblem, flexibleQuote, formatBDT, withDiscount, type CalculatorResult, type PlanLike } from "@/lib/shares";
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
 * discount, with the next share numbers. No automatic schedule: the holding
 * is its price and balance, paid in any amount; installments are added by
 * the team by hand if they agree any.
 */
export async function allocateHolding(userId: string, units: number, paymentPlan: "FULL" | "INSTALLMENT", discount?: SaleDiscount) {
  const [user, plans] = await Promise.all([prisma.user.findUnique({ where: { id: userId } }), prisma.membershipPlan.findMany()]);
  if (!user) throw new SaleError("Shareholder not found.", 404);
  if (!plans.length) throw new SaleError("No membership plans are set up.");

  const quote = flexibleQuote(calculate(plans, units, paymentPlan));
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
        installmentMonths: null,
        downPaymentBDT: null,
        scheduleJson: NO_INSTALLMENTS,
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
    }. You can pay it in any amounts that suit you — every payment gets a money receipt. Your balance${paidNow ? " and receipt are" : " is"} in your dashboard.`,
    href: "/account?tab=holdings",
    holdingId,
    dedupeKey: `allocated-${holdingId}-${randomUUID().slice(0, 6)}`,
  }).catch(() => null);
}

export type OfflinePayment = {
  /** Any amount from 1 taka up to what's still owed on the holding. */
  amountBDT: number;
  /** What it's for — "December", "Down payment" — shown on the receipt. */
  label?: string;
  method: (typeof PAYMENT_METHODS)[number];
  reference?: string;
  note?: string;
  /** YYYY-MM-DD, the day the money arrived (Bangladesh time). */
  paidAt?: string;
};

/**
 * Records money received offline — any amount, not just whole installments.
 * It is one payment with one money receipt, applied to the schedule in order
 * (see `holdingLedger`): it may finish one installment, part-pay the next,
 * or clear several at once. Any gateway attempt still pending on the holding
 * is voided so the same money can't arrive twice, and the holding becomes
 * active.
 */
export async function recordOfflinePayment(holdingId: string, p: OfflinePayment, recordedBy: string) {
  const holding = await prisma.shareHolding.findUnique({ where: { id: holdingId }, include: holdingInclude });
  if (!holding) throw new SaleError("Holding not found.", 404);
  if (holding.status === "CANCELLED") throw new SaleError("This holding is cancelled.");

  const before = holdingLedger(holding);
  if (before.fullyPaid) throw new SaleError("This holding is already fully paid.");
  if (!Number.isInteger(p.amountBDT) || p.amountBDT < 1) throw new SaleError("Enter the amount received.", 422, "amountBDT");
  if (p.amountBDT > before.remainingBDT) {
    throw new SaleError(`Only ${formatBDT(before.remainingBDT)} is left to pay on this holding.`, 422, "amountBDT");
  }

  const paidAt = p.paidAt ? new Date(`${p.paidAt}T12:00:00+06:00`) : new Date();
  const payment = await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { holdingId, status: "PENDING" },
      data: { status: "CANCELLED", note: "Superseded by a payment recorded by the Aven team" },
    });
    const created = await tx.payment.create({
      data: {
        holdingId,
        amountBDT: p.amountBDT,
        method: p.method,
        tranId: `MAN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
        installmentNo: before.nextDue?.n ?? before.steps.length + 1,
        label: p.label || null,
        status: "SUCCESS",
        reference: p.reference,
        note: p.note,
        recordedBy,
        paidAt,
      },
    });
    if (holding.status === "PENDING_PAYMENT") await tx.shareHolding.update({ where: { id: holdingId }, data: { status: "ACTIVE" } });
    return created;
  });

  await convertLeadsFor(holding.user.email, "payment received");
  await notifyPaymentReceived(payment.id);

  const fresh = await prisma.shareHolding.findUniqueOrThrow({ where: { id: holdingId }, include: holdingInclude });
  const after = holdingLedger(fresh);
  const next = after.nextDue ? after.steps.find((s) => s.n === after.nextDue!.n)! : null;
  return {
    holding,
    payment,
    covered: paymentLabels(fresh)[payment.id] ?? "Payment",
    totalBDT: p.amountBDT,
    remainingBDT: after.remainingBDT,
    next: next ? { label: next.paidBDT ? `Rest of ${next.part}` : next.part, amountBDT: next.dueBDT } : null,
  };
}
