import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { readJson } from "@/lib/admin";
import { resetPassword } from "@/lib/password-reset";
import { registerSchema, zodErrors } from "@/lib/validation";

const schema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from the email."),
  password: registerSchema.shape.password,
});

/** Checks the emailed code, sets the new password and signs the user in. */
export async function POST(request: Request) {
  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const result = await resetPassword(parsed.data.email, parsed.data.code, parsed.data.password);
  if (!result.ok) return NextResponse.json({ errors: { code: result.error } }, { status: 422 });

  const { user } = result;
  await createSession({ sub: user.id, role: user.role, name: user.name, email: user.email });
  return NextResponse.json({ ok: true, role: user.role });
}
