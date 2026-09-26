import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";
import { holdingInclude, toAdminCustomer, toAdminHolding } from "@/lib/admin-serialize";

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const [users, holdings] = await Promise.all([
    prisma.user.findMany({
      where: { role: "SHAREHOLDER" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true, location: true, createdAt: true },
    }),
    prisma.shareHolding.findMany({ include: holdingInclude }),
  ]);

  const byUser = new Map<string, ReturnType<typeof toAdminHolding>[]>();
  for (const h of holdings) {
    const list = byUser.get(h.userId) ?? [];
    list.push(toAdminHolding(h));
    byUser.set(h.userId, list);
  }

  return NextResponse.json({ customers: users.map((u) => toAdminCustomer(u, byUser.get(u.id) ?? [])) });
}
