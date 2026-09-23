import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Public: the four membership plans, as currently priced in the database. */
export async function GET() {
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ plans });
}
