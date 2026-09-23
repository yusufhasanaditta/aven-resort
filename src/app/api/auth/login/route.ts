import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";
import { loginSchema, zodErrors } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  }

  const { email, password } = parsed.data;

  // Deliberately generic on failure — never reveal whether the email exists.
  const invalid = () =>
    NextResponse.json(
      { errors: { form: "Incorrect email or password." } },
      { status: 401 },
    );

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return invalid();

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return invalid();

  await createSession({
    sub: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
  });

  return NextResponse.json({ ok: true, role: user.role });
}
