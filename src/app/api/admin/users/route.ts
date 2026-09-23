import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const users = await prisma.user.findMany({
    where: { role: "SHAREHOLDER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      createdAt: true,
      holdings: {
        select: {
          id: true,
          units: true,
          totalAmountBDT: true,
          status: true,
          paymentPlan: true,
          plan: { select: { name: true } },
        },
      },
    },
  });

  return NextResponse.json({ users });
}
