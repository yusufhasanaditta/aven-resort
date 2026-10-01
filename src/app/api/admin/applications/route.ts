import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const rows = await prisma.application.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { id: true, name: true, email: true } } },
    take: 500,
  });
  // The hash never leaves the server — the admin only needs to know one was chosen.
  const applications = rows.map(({ passwordHash, ...a }) => ({ ...a, hasPassword: !!passwordHash }));
  return NextResponse.json({ applications });
}
