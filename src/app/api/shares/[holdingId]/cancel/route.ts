import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { logActivity } from "@/lib/admin";

/**
 * Lets a shareholder withdraw a reservation they haven't paid anything on
 * yet. Once any payment has succeeded, cancelling is a conversation with the
 * Aven team, not a button.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ holdingId: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const { holdingId } = await params;
  const holding = await prisma.shareHolding.findUnique({ where: { id: holdingId }, include: { payments: true, plan: true } });
  if (!holding || holding.userId !== session.sub) return NextResponse.json({ error: "Holding not found." }, { status: 404 });
  if (holding.status === "CANCELLED") return NextResponse.json({ ok: true });
  if (holding.payments.some((p) => p.status === "SUCCESS")) {
    return NextResponse.json({ error: "Payments have already been made on this holding — please contact the Aven team to cancel it." }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.payment.updateMany({ where: { holdingId, status: "PENDING" }, data: { status: "CANCELLED", note: "Reservation cancelled by the shareholder" } }),
    prisma.shareHolding.update({ where: { id: holdingId }, data: { status: "CANCELLED" } }),
  ]);
  await logActivity(session.name, "Cancelled reservation", session.name, `${holding.units} ${holding.plan.name} share(s)`);
  return NextResponse.json({ ok: true });
}
