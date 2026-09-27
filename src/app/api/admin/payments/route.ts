import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { notifyPaymentReceived } from "@/lib/notify";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminPayments } from "@/lib/admin-serialize";
import { holdingLedger } from "@/lib/account";
import { convertLeadsFor } from "@/lib/crm";
import { manualPaymentSchema, zodErrors } from "@/lib/validation";
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
 * Records a payment received outside the gateway — cash at the office, a bank
 * transfer, bKash, a cheque. It settles one installment in full (the next
 * unpaid one unless specified), voids any gateway attempt still pending for
 * that installment, activates the holding, and returns the new payment so the
 * team can open its money receipt straight away.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = manualPaymentSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;

  const holding = await prisma.shareHolding.findUnique({ where: { id: d.holdingId }, include: holdingInclude });
  if (!holding) return NextResponse.json({ error: "Holding not found." }, { status: 404 });
  if (holding.status === "CANCELLED") return NextResponse.json({ error: "This holding is cancelled." }, { status: 409 });

  const ledger = holdingLedger(holding);
  const n = d.installmentNo ?? ledger.steps.find((s) => s.status !== "SUCCESS")?.n;
  const step = ledger.steps.find((s) => s.n === n);
  if (!step) return NextResponse.json({ error: "This holding is already fully paid." }, { status: 409 });
  if (step.status === "SUCCESS") return NextResponse.json({ error: `${step.label} is already paid.` }, { status: 409 });
  if (d.amountBDT !== step.amountBDT) {
    return NextResponse.json(
      { errors: { amountBDT: `${step.label} is ${formatBDT(step.amountBDT)} — record the full installment.` } },
      { status: 422 },
    );
  }

  const paidAt = d.paidAt ? new Date(`${d.paidAt}T12:00:00+06:00`) : new Date();
  const payment = await prisma.$transaction(async (tx) => {
    await tx.payment.updateMany({
      where: { holdingId: holding.id, installmentNo: step.n, status: "PENDING" },
      data: { status: "CANCELLED", note: "Superseded by a manually recorded payment" },
    });
    const p = await tx.payment.create({
      data: {
        holdingId: holding.id,
        amountBDT: step.amountBDT,
        method: d.method,
        tranId: `MAN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
        installmentNo: step.n,
        status: "SUCCESS",
        reference: d.reference,
        note: d.note,
        recordedBy: guard.name,
        paidAt,
      },
    });
    if (holding.status === "PENDING_PAYMENT") {
      await tx.shareHolding.update({ where: { id: holding.id }, data: { status: "ACTIVE" } });
    }
    return p;
  });

  await convertLeadsFor(holding.user.email, "first payment received");
  await notifyPaymentReceived(payment.id);
  await logActivity(
    guard.name,
    "Recorded payment",
    holding.user.name,
    `${formatBDT(step.amountBDT)} · ${step.label} · ${d.method.replace("_", " ").toLowerCase()}`,
  );
  return NextResponse.json({ ok: true, paymentId: payment.id });
}
