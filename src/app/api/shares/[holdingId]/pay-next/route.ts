import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { installmentLabelFor, scheduleAmounts } from "@/lib/shares";
import { startPayment } from "@/lib/payments";

/**
 * Starts the next payment due on a holding — the next installment if it's on
 * a schedule, or the single payment of a full-payment holding. An earlier
 * attempt left pending (tab closed, back button) is replaced, never a dead end.
 */
export async function POST(
  _request: Request,
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
  if (holding.status === "CANCELLED") {
    return NextResponse.json({ error: "This reservation was cancelled." }, { status: 409 });
  }

  const paidSteps = new Set(holding.payments.filter((p) => p.status === "SUCCESS").map((p) => p.installmentNo));
  const steps = holding.paymentPlan === "INSTALLMENT" && holding.installmentMonths ? holding.installmentMonths : 1;
  const schedule = steps > 1 ? scheduleAmounts(holding.totalAmountBDT, steps, holding.downPaymentBDT) : [holding.totalAmountBDT];
  const index = schedule.findIndex((_, i) => !paidSteps.has(i + 1));
  if (index === -1) {
    return NextResponse.json({ error: "This holding is fully paid." }, { status: 400 });
  }

  const installmentNo = index + 1;
  const label = steps > 1 ? installmentLabelFor(installmentNo, steps, !!holding.downPaymentBDT).toLowerCase() : "full payment";

  const started = await startPayment({
    holdingId: holding.id,
    installmentNo,
    amountBDT: schedule[index],
    tranId: `AVEN-${holding.id}-${installmentNo}-${randomUUID().slice(0, 8)}`,
    customer: holding.user,
    productName: `${holding.plan.name} — ${label}, Aven Eco Luxury Resort`,
  });

  if (!started.ok) return NextResponse.json({ error: started.error }, { status: started.status });
  return NextResponse.json({ ok: true, gatewayUrl: started.gatewayUrl, notice: started.notice });
}
