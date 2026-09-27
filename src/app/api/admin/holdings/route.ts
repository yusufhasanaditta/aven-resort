import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";
import { holdingInclude, toAdminHolding } from "@/lib/admin-serialize";

/** Every holding with its full installment ledger — the source for the Installments & Dues tab. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const holdings = await prisma.shareHolding.findMany({ include: holdingInclude, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ holdings: holdings.map(toAdminHolding) });
}
