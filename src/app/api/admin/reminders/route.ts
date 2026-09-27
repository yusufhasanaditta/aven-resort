import { NextResponse } from "next/server";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { emailConfigured } from "@/lib/mailer";
import { runInstallmentReminders, sendManualReminder } from "@/lib/notify";
import { prisma } from "@/lib/db";

/** Reminder log for the admin panel: the latest reminders and receipts sent. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const rows = await prisma.notification.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: { user: { select: { name: true, phone: true } } },
  });
  return NextResponse.json({
    emailConfigured: emailConfigured(),
    notifications: rows.map((n) => ({
      id: n.id,
      kind: n.kind,
      title: n.title,
      customer: n.user.name,
      phone: n.user.phone,
      emailStatus: n.emailStatus,
      read: !!n.readAt,
      createdAt: n.createdAt.toISOString(),
    })),
  });
}

/** `{}` runs the automatic reminder job now; `{ holdingId }` nudges one shareholder about their next installment. */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const body = (await readJson<{ holdingId?: string }>(request)) ?? {};

  if (body.holdingId) {
    const n = await sendManualReminder(body.holdingId);
    if (!n) return NextResponse.json({ error: "Nothing is due on that holding." }, { status: 409 });
    await logActivity(guard.name, "Sent installment reminder", n.title);
    return NextResponse.json({ ok: true, emailStatus: n.emailStatus });
  }

  const result = await runInstallmentReminders();
  await logActivity(guard.name, "Ran installment reminders", undefined, `${result.sent} sent · ${result.emailed} emailed`);
  return NextResponse.json({ ok: true, ...result });
}
