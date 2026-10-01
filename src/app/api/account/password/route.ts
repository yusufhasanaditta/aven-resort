import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { logActivity, readJson } from "@/lib/admin";
import { passwordChangeSchema, zodErrors } from "@/lib/validation";

/** Changes the signed-in user's password (shareholders and admins alike) after checking the current one. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const parsed = passwordChangeSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ errors: { currentPassword: "That is not your current password." } }, { status: 422 });
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json({ errors: { newPassword: "Choose a password different from the current one." } }, { status: 422 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword), mustChangePassword: false } });
  await logActivity(user.name, "Changed password", user.name);
  return NextResponse.json({ ok: true });
}
