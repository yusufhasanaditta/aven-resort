import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

/** The signed-in shareholder's notifications, newest first. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const notifications = await prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 });
  return NextResponse.json({ notifications, unread: notifications.filter((n) => !n.readAt).length });
}

/** `{ action: "read-all" }` or `{ id }` — marks notifications read. */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { action?: string; id?: string };
  await prisma.notification.updateMany({
    where: { userId: user.id, readAt: null, ...(body.action === "read-all" ? {} : { id: String(body.id ?? "") }) },
    data: { readAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
