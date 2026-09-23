import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildInstallmentSchedule } from "@/lib/shares";
import { initiatePayment, isConfigured } from "@/lib/sslcommerz";

/**
 * Starts the next payment due on a holding — the next instalment if it's on
 * a schedule, or a retry of the single payment if it's a full-payment holding
 * whose first attempt never completed.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ holdingId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  }

  const { holdingId } = await params;

  const holding = await prisma.shareHolding.findUnique({
    where: { id: holdingId },
    include: { payments: true, plan: true, user: true },
  });

  if (!holding || holding.userId !== session.sub) {
    return NextResponse.json({ error: "Holding not found." }, { status: 404 });
  }

  const pendingExists = holding.payments.some((p) => p.status === "PENDING");
  if (pendingExists) {
    return NextResponse.json(
      { error: "A payment is already in progress for this holding." },
      { status: 409 },
    );
  }

  const successfulCount = holding.payments.filter((p) => p.status === "SUCCESS").length;

  let amountBDT: number;
  let installmentNo: number;
  let label: string;

  if (holding.paymentPlan === "INSTALLMENT" && holding.installmentMonths) {
    if (successfulCount >= holding.installmentMonths) {
      return NextResponse.json({ error: "This holding is fully paid." }, { status: 400 });
    }
    const schedule = buildInstallmentSchedule(holding.totalAmountBDT, holding.installmentMonths);
    amountBDT = schedule[successfulCount].amountBDT;
    installmentNo = successfulCount + 1;
    label = `instalment ${installmentNo}/${holding.installmentMonths}`;
  } else {
    if (successfulCount >= 1) {
      return NextResponse.json({ error: "This holding is fully paid." }, { status: 400 });
    }
    amountBDT = holding.totalAmountBDT;
    installmentNo = 1;
    label = "full payment";
  }

  const tranId = `AVEN-${holding.id}-${installmentNo}-${randomUUID().slice(0, 8)}`;

  await prisma.payment.create({
    data: { holdingId: holding.id, amountBDT, tranId, installmentNo, status: "PENDING" },
  });

  if (!isConfigured()) {
    return NextResponse.json({
      ok: true,
      gatewayUrl: null,
      notice:
        "This payment has been recorded as due. Online payment via SSLCommerz isn't connected yet — the AVEN team will contact you to complete it.",
    });
  }

  const gateway = await initiatePayment({
    tranId,
    amountBDT,
    customerName: holding.user.name,
    customerEmail: holding.user.email,
    customerPhone: holding.user.phone,
    customerAddress: holding.user.location,
    productName: `${holding.plan.name} — ${label}, Aven Tea Empire`,
  });

  if (!gateway.ok) {
    return NextResponse.json({ error: gateway.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, gatewayUrl: gateway.gatewayUrl });
}
