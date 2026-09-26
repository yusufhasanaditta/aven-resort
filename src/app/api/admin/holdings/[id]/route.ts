import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";

const schema = z.object({ status: z.enum(["ACTIVE", "PENDING_PAYMENT", "CANCELLED"]) });

/** Cancel or reinstate a holding. Cancelling also voids any payment still in flight on it. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ error: "Invalid status." }, { status: 422 });

  const holding = await prisma.shareHolding.findUnique({ where: { id }, include: { user: true, plan: true } });
  if (!holding) return NextResponse.json({ error: "Holding not found." }, { status: 404 });

  await prisma.$transaction([
    prisma.shareHolding.update({ where: { id }, data: { status: parsed.data.status } }),
    ...(parsed.data.status === "CANCELLED"
      ? [prisma.payment.updateMany({ where: { holdingId: id, status: "PENDING" }, data: { status: "CANCELLED" } })]
      : []),
  ]);
  await logActivity(
    guard.name,
    parsed.data.status === "CANCELLED" ? "Cancelled holding" : "Updated holding",
    holding.user.name,
    `${holding.units} × ${holding.plan.name} → ${parsed.data.status}`,
  );
  return NextResponse.json({ ok: true });
}
