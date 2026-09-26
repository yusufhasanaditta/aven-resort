import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";
import { holdingInclude, toAdminCustomer, toAdminHolding, toAdminPayments } from "@/lib/admin-serialize";

/** Everything about one shareholder: profile, holdings with schedules, full payment history, applications. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, location: true, createdAt: true },
  });
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const [holdings, applications] = await Promise.all([
    prisma.shareHolding.findMany({ where: { userId: id }, include: holdingInclude, orderBy: { createdAt: "desc" } }),
    prisma.application.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
  ]);

  const adminHoldings = holdings.map(toAdminHolding);
  const payments = holdings.flatMap(toAdminPayments).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return NextResponse.json({
    customer: { ...toAdminCustomer(user, adminHoldings), holdings: adminHoldings, payments, applications },
  });
}
