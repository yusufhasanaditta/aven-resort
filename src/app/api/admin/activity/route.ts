import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const activity = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 300 });
  return NextResponse.json({ activity });
}
