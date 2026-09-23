import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const plans = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json();
  const { id, unitPriceBDT, freeStayNights, discountPercent, minUnits, maxUnits } = body ?? {};

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing plan id." }, { status: 400 });
  }

  const data: Record<string, number | null> = {};
  if (Number.isFinite(unitPriceBDT)) data.unitPriceBDT = Math.round(unitPriceBDT);
  if (Number.isFinite(freeStayNights)) data.freeStayNights = Math.round(freeStayNights);
  if (Number.isFinite(discountPercent)) data.discountPercent = Math.round(discountPercent);
  if (Number.isFinite(minUnits)) data.minUnits = Math.round(minUnits);
  if (maxUnits === null || Number.isFinite(maxUnits)) {
    data.maxUnits = maxUnits === null ? null : Math.round(maxUnits);
  }

  const plan = await prisma.membershipPlan.update({ where: { id }, data });
  return NextResponse.json({ ok: true, plan });
}
