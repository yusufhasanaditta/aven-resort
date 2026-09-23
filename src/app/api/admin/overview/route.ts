import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const [userCount, holdings, inquiryCount, successfulPayments, plans] = await Promise.all([
    prisma.user.count({ where: { role: "SHAREHOLDER" } }),
    prisma.shareHolding.findMany({ include: { plan: true } }),
    prisma.inquiry.count(),
    prisma.payment.findMany({ where: { status: "SUCCESS" } }),
    prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const totalUnits = holdings.reduce((sum, h) => sum + h.units, 0);
  const totalCommittedBDT = holdings.reduce((sum, h) => sum + h.totalAmountBDT, 0);
  const totalCollectedBDT = successfulPayments.reduce((sum, p) => sum + p.amountBDT, 0);
  const activeHoldings = holdings.filter((h) => h.status === "ACTIVE").length;
  const pendingHoldings = holdings.filter((h) => h.status === "PENDING_PAYMENT").length;

  const byPlan = plans.map((plan) => {
    const planHoldings = holdings.filter((h) => h.planId === plan.id);
    return {
      slug: plan.slug,
      name: plan.name,
      holdings: planHoldings.length,
      units: planHoldings.reduce((sum, h) => sum + h.units, 0),
      committedBDT: planHoldings.reduce((sum, h) => sum + h.totalAmountBDT, 0),
    };
  });

  return NextResponse.json({
    userCount,
    holdingCount: holdings.length,
    activeHoldings,
    pendingHoldings,
    totalUnits,
    totalCommittedBDT,
    totalCollectedBDT,
    inquiryCount,
    byPlan,
  });
}
