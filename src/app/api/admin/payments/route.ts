import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminPayments } from "@/lib/admin-serialize";
import { manualPaymentSchema, zodErrors } from "@/lib/validation";
import { SaleError, recordOfflinePayment } from "@/lib/sales";
import { formatBDT } from "@/lib/shares";

/** The full payment ledger, newest first. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const holdings = await prisma.shareHolding.findMany({ include: holdingInclude });
  const payments = holdings.flatMap(toAdminPayments).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return NextResponse.json({ payments });
}

/**
 * Records money received outside the gateway — cash at the office, a bank
 * transfer, bKash, a cheque — of any amount up to what's still owed. It gets
 * one money receipt and is applied to the schedule in order, so it can part-
 * pay an installment or clear several. Returns the payment so its receipt
 * can be opened.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = manualPaymentSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { holdingId, ...payment } = parsed.data;

  try {
    const s = await recordOfflinePayment(holdingId, payment, guard.name);
    await logActivity(
      guard.name,
      "Recorded payment",
      s.holding.user.name,
      `${formatBDT(s.totalBDT)} · ${s.covered} · ${payment.method.replace("_", " ").toLowerCase()}`,
    );
    return NextResponse.json({ ok: true, paymentId: s.payment.id, covered: s.covered, next: s.next, remainingBDT: s.remainingBDT });
  } catch (err) {
    if (err instanceof SaleError) {
      const body = err.field ? { errors: { [err.field]: err.message } } : { error: err.message };
      return NextResponse.json(body, { status: err.status });
    }
    throw err;
  }
}
