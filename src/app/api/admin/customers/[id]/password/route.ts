import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { oneTimePassword } from "@/lib/member";
import { requestPasswordReset } from "@/lib/password-reset";
import { registerSchema, zodErrors } from "@/lib/validation";

const schema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("one-time") }),
  z.object({ mode: z.literal("email-code") }),
  z.object({ mode: z.literal("set"), password: registerSchema.shape.password }),
]);

/**
 * Helps a shareholder back in:
 * - one-time: a fresh one-time password, shown to the admin to pass on; the
 *   shareholder must choose their own right after signing in with it
 * - email-code: emails them a 6-digit reset code
 * - set: sets a password the admin chose
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  if (parsed.data.mode === "email-code") {
    await requestPasswordReset(user.email);
    await logActivity(guard.name, "Sent password reset code", user.name);
    return NextResponse.json({ ok: true });
  }

  const oneTime = parsed.data.mode === "one-time" ? oneTimePassword() : null;
  await prisma.user.update({
    where: { id },
    data: { passwordHash: await hashPassword(oneTime ?? (parsed.data as { password: string }).password), mustChangePassword: !!oneTime },
  });
  await logActivity(guard.name, oneTime ? "Issued one-time password" : "Set a new password", user.name);
  return NextResponse.json({ ok: true, oneTimePassword: oneTime });
}
