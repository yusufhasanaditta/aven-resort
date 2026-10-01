import { NextResponse } from "next/server";
import { z } from "zod";
import { readJson } from "@/lib/admin";
import { requestPasswordReset } from "@/lib/password-reset";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email address.") });

/** Emails a reset code. Answers the same whether or not the email has an account. */
export async function POST(request: Request) {
  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: { email: "Enter a valid email address." } }, { status: 422 });
  await requestPasswordReset(parsed.data.email);
  return NextResponse.json({ ok: true });
}
