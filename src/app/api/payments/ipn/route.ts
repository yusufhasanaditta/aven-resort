import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { validateTransaction } from "@/lib/sslcommerz";

/**
 * SSLCommerz's server-to-server Instant Payment Notification. This is the
 * authoritative confirmation — the browser redirect to /api/payments/success
 * is only ever a hint to refresh the UI, since a closed tab or flaky network
 * can drop it. Every status change to a real Payment row happens here, after
 * independently re-validating with SSLCommerz's own validation API.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString();
  const valId = form.get("val_id")?.toString();
  const status = form.get("status")?.toString();

  if (!tranId || !valId) {
    return NextResponse.json({ error: "Missing tran_id or val_id." }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({
    where: { tranId },
    include: { holding: true },
  });
  if (!payment) {
    return NextResponse.json({ error: "Unknown transaction." }, { status: 404 });
  }

  if (status !== "VALID" && status !== "VALIDATED") {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", valId, gatewayResponse: JSON.stringify(Object.fromEntries(form)) },
    });
    return NextResponse.json({ ok: true, recorded: "FAILED" });
  }

  const check = await validateTransaction(valId);
  if (!check.valid || check.amount !== payment.amountBDT) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "FAILED",
        valId,
        gatewayResponse: JSON.stringify({ ipn: Object.fromEntries(form), validation: check.raw }),
      },
    });
    return NextResponse.json({ ok: true, recorded: "FAILED_VALIDATION_MISMATCH" });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        valId,
        gatewayResponse: JSON.stringify({ ipn: Object.fromEntries(form), validation: check.raw }),
      },
    }),
    prisma.shareHolding.update({
      where: { id: payment.holdingId },
      data: { status: "ACTIVE" },
    }),
  ]);

  return NextResponse.json({ ok: true, recorded: "SUCCESS" });
}
