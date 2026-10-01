import { NextResponse, after } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { notify } from "@/lib/notify";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { messageSchema, zodErrors } from "@/lib/validation";

/**
 * Sends a message to every shareholder (or only those holding shares). Each
 * gets it in their dashboard bell and by email; emails go out after the
 * response so a long list never keeps the admin waiting.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const body = (await readJson<Record<string, unknown>>(request)) ?? {};
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const onlyHolders = body.audience === "holders";

  const users = await prisma.user.findMany({
    where: { role: "SHAREHOLDER", ...(onlyHolders ? { holdings: { some: { status: { not: "CANCELLED" } } } } : {}) },
    select: { id: true, email: true, name: true },
  });
  const batch = randomUUID();
  after(async () => {
    for (const u of users) {
      await notify(u, { kind: "MESSAGE", ...parsed.data, href: parsed.data.href || "/account", dedupeKey: `msg-${batch}-${u.id}` }).catch((err) =>
        console.error("Broadcast to", u.email, "failed", err),
      );
    }
  });
  await logActivity(guard.name, "Sent message to all", `${users.length} shareholders`, parsed.data.title);
  return NextResponse.json({ ok: true, recipients: users.length });
}
