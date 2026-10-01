import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminHolding } from "@/lib/admin-serialize";
import { calculate, formatBDT } from "@/lib/shares";
import { notify } from "@/lib/notify";
import { nextShareNumbers } from "@/lib/member";
import { zodErrors } from "@/lib/validation";

/** Every holding with its full installment ledger — the source for the Installments & Dues tab. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const holdings = await prisma.shareHolding.findMany({ include: holdingInclude, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ holdings: holdings.map(toAdminHolding) });
}

const allocateSchema = z.object({
  userId: z.string().min(1),
  units: z.coerce.number().int().min(1, "At least one share.").max(2700),
  paymentPlan: z.enum(["FULL", "INSTALLMENT"]),
});

/**
 * Allocates shares to a shareholder — for a sale closed in person. Priced
 * exactly as the website prices it (same plan chart, same schedule); the
 * holding then shows in the customer's dashboard with its payment schedule,
 * and payments are recorded against it as usual.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = allocateSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { userId, units, paymentPlan } = parsed.data;

  const [user, plans] = await Promise.all([prisma.user.findUnique({ where: { id: userId } }), prisma.membershipPlan.findMany()]);
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  if (!plans.length) return NextResponse.json({ error: "No membership plans are set up." }, { status: 409 });

  const result = calculate(plans, units, paymentPlan);
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
      },
    }),
  );

  await notify(user, {
    kind: "MESSAGE",
    title: `${result.units} ${result.plan.name} share${result.units > 1 ? "s" : ""} reserved for you`,
    body: `The Aven team has reserved ${result.units} unit share${result.units > 1 ? "s" : ""} (${result.plan.name}) in your name — ${formatBDT(result.totalBDT)}${
      result.installments ? `, starting with a ${formatBDT(result.installments[0].amountBDT)} down payment` : ""
    }. Your payment schedule is in your dashboard.`,
    href: "/account?tab=holdings",
    holdingId: holding.id,
    dedupeKey: `allocated-${holding.id}-${randomUUID().slice(0, 6)}`,
  }).catch(() => null);
  await logActivity(guard.name, "Allocated shares", user.name, `${result.units} × ${result.plan.name} · ${formatBDT(result.totalBDT)}`);
  return NextResponse.json({ ok: true, holdingId: holding.id });
}
