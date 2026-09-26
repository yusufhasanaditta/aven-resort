import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const applications = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
    take: 500,
  });
  return NextResponse.json({ applications });
}
