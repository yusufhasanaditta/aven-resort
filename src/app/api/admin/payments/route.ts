import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminPayments } from "@/lib/admin-serialize";
import { manualPaymentSchema, zodErrors } from "@/lib/validation";
import { SaleError, settleInstallments } from "@/lib/sales";
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
 * transfer, bKash, a cheque. It settles one or more installments in full
 * (from the next unpaid one unless specified), each with its own money
 * receipt; the next installment then shows as due on the shareholder's
 * dashboard. Returns the first new payment so its receipt can be opened.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = manualPaymentSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { holdingId, ...payment } = parsed.data;

  try {
    const s = await settleInstallments(holdingId, payment, guard.name);
    await logActivity(
      guard.name,
      "Recorded payment",
      s.holding.user.name,
      `${formatBDT(s.totalBDT)} · ${s.covered.join(", ")} · ${payment.method.replace("_", " ").toLowerCase()}`,
    );
    return NextResponse.json({ ok: true, paymentId: s.payments[0].id, paymentIds: s.payments.map((p) => p.id), next: s.next });
  } catch (err) {
    if (err instanceof SaleError) {
      const body = err.field ? { errors: { [err.field]: err.message } } : { error: err.message };
      return NextResponse.json(body, { status: err.status });
    }
    throw err;
  }
}
