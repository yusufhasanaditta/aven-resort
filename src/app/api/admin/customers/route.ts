import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminCustomer, toAdminHolding } from "@/lib/admin-serialize";
import { openAccount, sendWelcome } from "@/lib/member";
import { kycSchema, registerSchema, zodErrors } from "@/lib/validation";

const createSchema = registerSchema.extend({ password: registerSchema.shape.password.optional().or(z.literal("")) }).merge(kycSchema);

/**
 * Opens a shareholder account (only the Aven team can). It gets the next
 * membership number; with no password given, a one-time password is created
 * and shown to the admin to pass on — the shareholder picks their own at
 * first sign-in. The welcome email carries both when email is set up.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = createSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { password, ...details } = parsed.data;

  if (await prisma.user.findUnique({ where: { email: details.email } })) {
    return NextResponse.json({ errors: { email: "An account with this email already exists." } }, { status: 409 });
  }
  const account = await openAccount(details, password || undefined);
  await sendWelcome({ ...details, memberNo: account.memberNo }, account.oneTimePassword);
  await logActivity(guard.name, "Created shareholder account", details.name, `${account.memberNo} · ${details.email}`);
  return NextResponse.json({ ok: true, id: account.id, memberNo: account.memberNo, oneTimePassword: account.oneTimePassword });
}

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const [users, holdings] = await Promise.all([
    prisma.user.findMany({
      where: { role: "SHAREHOLDER" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, phone: true, location: true, createdAt: true, memberNo: true, photoUrl: true, nid: true, nomineeName: true, nomineeRelation: true, referredBy: true },
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
