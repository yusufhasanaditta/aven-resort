import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminCustomer, toAdminHolding, toAdminPayments } from "@/lib/admin-serialize";
import { kycSchema, registerSchema, zodErrors } from "@/lib/validation";

const editSchema = registerSchema.pick({ name: true, email: true, phone: true, location: true }).merge(kycSchema);

/** Corrects a shareholder's details — name, email (their sign-in), phone, location, NID, nominee, referrer. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = editSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const clash = await prisma.user.findFirst({ where: { email: parsed.data.email, NOT: { id } } });
  if (clash) return NextResponse.json({ errors: { email: "Another account already uses this email." } }, { status: 409 });

  const user = await prisma.user.update({ where: { id }, data: parsed.data }).catch(() => null);
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });
  await logActivity(guard.name, "Edited shareholder details", user.name);
  return NextResponse.json({ ok: true });
}

/** Everything about one shareholder: profile, holdings with schedules, full payment history, applications. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, phone: true, location: true, createdAt: true, memberNo: true, photoUrl: true, nid: true, nomineeName: true, nomineeRelation: true, referredBy: true },
  });
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const [holdings, applications] = await Promise.all([
    prisma.shareHolding.findMany({ where: { userId: id }, include: holdingInclude, orderBy: { createdAt: "desc" } }),
    prisma.application.findMany({
      where: { userId: id },
      omit: { passwordHash: true },
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
