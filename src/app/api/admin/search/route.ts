import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";

/** Command-palette search across leads, shareholders, applications and payments. */
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });

  const [leads, users, applications, payments] = await Promise.all([
    prisma.lead.findMany({
      where: { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] },
      take: 5,
    }),
    prisma.user.findMany({
      where: { role: "SHAREHOLDER", OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }] },
      take: 5,
    }),
    prisma.application.findMany({
      where: { OR: [{ fullName: { contains: q } }, { nid: { contains: q } }, { email: { contains: q } }] },
      take: 5,
    }),
    prisma.payment.findMany({
      where: { OR: [{ tranId: { contains: q } }, { reference: { contains: q } }] },
      include: { holding: { include: { user: { select: { id: true, name: true } } } } },
      take: 5,
    }),
  ]);

  const words = (s: string) => s.replace("_", " ").toLowerCase();

  return NextResponse.json({
    results: [
      ...leads.map((l) => ({ type: "lead", id: l.id, title: l.name, subtitle: `Lead · ${words(l.status)} · ${l.phone}` })),
      ...users.map((u) => ({ type: "customer", id: u.id, title: u.name, subtitle: `Shareholder · ${u.email}` })),
      ...applications.map((a) => ({ type: "application", id: a.id, title: a.fullName, subtitle: `Application · ${words(a.status)}` })),
      ...payments.map((p) => ({
        type: "payment",
        id: p.id,
        title: p.tranId,
        subtitle: `Payment · ${p.holding.user.name} · ৳${p.amountBDT.toLocaleString("en-US")}`,
        customerId: p.holding.user.id,
      })),
    ],
  });
}
