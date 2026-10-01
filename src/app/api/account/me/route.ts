import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, getSession } from "@/lib/auth";
import { logActivity, readJson } from "@/lib/admin";
import { profileSchema, zodErrors } from "@/lib/validation";

/** The signed-in shareholder's own profile, holdings and payment history. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      location: true,
      role: true,
      createdAt: true,
      holdings: {
        orderBy: { createdAt: "desc" },
        include: {
          plan: true,
          payments: { orderBy: { installmentNo: "asc" } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({ user });
}

/** Updates the signed-in user's name, phone and location. */
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const parsed = profileSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const user = await prisma.user.update({ where: { id: session.sub }, data: parsed.data });
  // The session carries the display name; re-issue it so the header greets the new one.
  await createSession({ sub: user.id, role: user.role, name: user.name, email: user.email });
  await logActivity(user.name, "Updated profile", user.name);
  return NextResponse.json({ ok: true });
}
