import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notify";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { messageSchema, zodErrors } from "@/lib/validation";

/** Sends one shareholder a message — it lands in their dashboard bell and their email. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = messageSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "Customer not found." }, { status: 404 });

  const sent = await notify(user, { kind: "MESSAGE", ...parsed.data, href: parsed.data.href || "/account", dedupeKey: `msg-${randomUUID()}` });
  await logActivity(guard.name, "Sent message", user.name, parsed.data.title);
  return NextResponse.json({ ok: true, emailStatus: sent?.emailStatus ?? "SKIPPED" });
}
