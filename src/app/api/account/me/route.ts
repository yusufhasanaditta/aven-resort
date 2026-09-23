import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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
