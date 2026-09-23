import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { registerSchema, zodErrors } from "@/lib/validation";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  }

  const { name, email, phone, location, password } = parsed.data;

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        location,
        passwordHash: await hashPassword(password),
      },
    });

    await createSession({
      sub: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
    });

    return NextResponse.json({ ok: true, name: user.name });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { errors: { email: "An account with this email already exists." } },
        { status: 409 },
      );
    }
    console.error("[aven] registration failed", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
