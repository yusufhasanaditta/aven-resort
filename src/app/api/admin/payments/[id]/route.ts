import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { notifyPaymentReceived } from "@/lib/notify";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { formatBDT } from "@/lib/shares";

const schema = z.object({
  status: z.enum(["SUCCESS", "FAILED", "CANCELLED"]),
  note: z.string().trim().max(500).optional(),
});

/**
 * Settles a payment that's still PENDING — e.g. an online reservation made
 * while the gateway isn't connected, once the money has actually arrived.
 * Only pending payments can change; settled history is never rewritten.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 422 });

  const payment = await prisma.payment.findUnique({ where: { id }, include: { holding: { include: { user: true } } } });
  if (!payment) return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (payment.status !== "PENDING") {
    return NextResponse.json({ error: "Only pending payments can be confirmed or voided." }, { status: 409 });
  }

  if (parsed.data.status === "SUCCESS") {
    const alreadyPaid = await prisma.payment.count({
      where: { holdingId: payment.holdingId, installmentNo: payment.installmentNo, status: "SUCCESS" },
    });
    if (alreadyPaid) return NextResponse.json({ error: "That installment is already paid." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id },
      data: {
        status: parsed.data.status,
        note: parsed.data.note ?? payment.note,
        recordedBy: guard.name,
        ...(parsed.data.status === "SUCCESS" ? { paidAt: new Date() } : {}),
      },
    }),
    ...(parsed.data.status === "SUCCESS" && payment.holding.status === "PENDING_PAYMENT"
      ? [prisma.shareHolding.update({ where: { id: payment.holdingId }, data: { status: "ACTIVE" } })]
      : []),
  ]);

  if (parsed.data.status === "SUCCESS") await notifyPaymentReceived(id);
  await logActivity(
    guard.name,
    parsed.data.status === "SUCCESS" ? "Confirmed payment" : "Voided payment",
    payment.holding.user.name,
    formatBDT(payment.amountBDT),
  );
  return NextResponse.json({ ok: true });
}
