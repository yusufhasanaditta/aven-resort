import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { daysUntil, formatDate, holdingLedger, paymentLabels, type DashHolding } from "@/lib/account";
import { emailHtml, sendEmail, siteUrl } from "@/lib/mailer";
import { formatBDT } from "@/lib/shares";

type NotificationInput = {
  kind: "DUE_SOON" | "DUE_TODAY" | "OVERDUE" | "PAYMENT_RECEIVED" | "REMINDER" | "MESSAGE";
  title: string;
  body: string;
  href?: string;
  holdingId?: string;
  installmentNo?: number;
  /** Same key → same notification: a second call is a no-op. */
  dedupeKey: string;
};

/**
 * Records a notification for the shareholder's inbox and emails it. Returns
 * null when a notification with the same `dedupeKey` already exists, which is
 * what keeps the daily reminder job from ever sending the same reminder twice.
 */
export async function notify(user: { id: string; email: string; name: string }, n: NotificationInput) {
  let created;
  try {
    created = await prisma.notification.create({ data: { ...n, userId: user.id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") return null;
    throw err;
  }

  const link = `${siteUrl()}${n.href ?? "/account?tab=holdings"}`;
  const body = `Dear ${user.name},\n${n.body}`;
  const emailStatus = await sendEmail({
    to: user.email,
    subject: n.title,
    text: `${body}\n\n${link}`,
    html: emailHtml({ title: n.title, body, cta: { label: n.kind === "PAYMENT_RECEIVED" ? "View money receipt" : "Open my dashboard", href: link } }),
  });
  if (emailStatus !== "SKIPPED") {
    await prisma.notification.update({ where: { id: created.id }, data: { emailStatus } });
  }
  return { ...created, emailStatus };
}

/** "Paid 3 of 16 · 13 installments left · ৳12,00,000 remaining." */
function progressLine(l: DashHolding) {
  if (l.customSchedule) return `Paid so far: ${formatBDT(l.paidBDT)} of ${formatBDT(l.totalAmountBDT)} · ${formatBDT(l.remainingBDT)} remaining.`;
  const left = l.leftCount;
  return `Paid ${l.paidCount} of ${l.steps.length} · ${left} ${left === 1 ? "installment" : "installments"} left · ${formatBDT(l.remainingBDT)} remaining.`;
}

const ledgerInclude = { plan: true, payments: true, user: { select: { id: true, name: true, email: true } } } as const;

/** Sends the "payment received" notification with the updated balance. Never throws. */
export async function notifyPaymentReceived(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { holding: { include: ledgerInclude } } });
    if (!payment || payment.status !== "SUCCESS") return;
    const h = payment.holding;
    const l = holdingLedger(h);
    const what = paymentLabels(h)[payment.id] ?? "installment";
    const next = l.nextDue ? l.steps.find((s) => s.n === l.nextDue!.n) : undefined;
    await notify(h.user, {
      kind: "PAYMENT_RECEIVED",
      title: `Payment received — ${what}`,
      body: [
        `We received ${formatBDT(payment.amountBDT)} for your ${l.plan.name} membership (${l.units} shares). Transaction ${payment.reference ?? payment.tranId}.`,
        progressLine(l),
        next && l.nextDue
          ? next.paidBDT > 0
            ? `Next: ${formatBDT(l.nextDue.amountBDT)} still to pay on your ${next.part}, due ${formatDate(l.nextDue.dueDate)}.`
            : `Next: ${next.part} of ${formatBDT(l.nextDue.amountBDT)}, due ${formatDate(l.nextDue.dueDate)}.`
          : l.remainingBDT > 0
            ? "You can pay the rest in any amounts, whenever it suits you."
            : "Your holding is now fully paid — thank you.",
      ].join("\n"),
      href: `/account/invoices/${payment.id}`,
      holdingId: h.id,
      installmentNo: payment.installmentNo,
      dedupeKey: `paid:${payment.id}`,
    });
  } catch (err) {
    console.error("notifyPaymentReceived failed", err);
  }
}

/**
 * Which reminder a due date calls for today, if any. Each bucket is sent at
 * most once per installment: a week before, three days before, on the day,
 * then once a week while it stays overdue.
 */
export function reminderBucket(days: number): { key: string; kind: NotificationInput["kind"] } | null {
  if (days > 7) return null;
  if (days >= 4) return { key: "D7", kind: "DUE_SOON" };
  if (days >= 1) return { key: "D3", kind: "DUE_SOON" };
  if (days === 0) return { key: "D0", kind: "DUE_TODAY" };
  return { key: `OD${Math.floor((-days - 1) / 7)}`, kind: "OVERDUE" };
}

function reminderText(l: DashHolding, days: number) {
  const next = l.steps.find((s) => s.n === l.nextDue!.n)!;
  const amount = formatBDT(l.nextDue!.amountBDT);
  const due = formatDate(l.nextDue!.dueDate);
  const title =
    days > 0
      ? `Your ${next.part} is due in ${days} ${days === 1 ? "day" : "days"}`
      : days === 0
        ? `Your ${next.part} is due today`
        : `Your ${next.part} is ${-days} ${days === -1 ? "day" : "days"} overdue`;
  const body = [
    next.paidBDT > 0
      ? `${amount} is still to pay on your ${next.part} for your ${l.plan.name} membership (${l.units} shares) — ${formatBDT(next.paidBDT)} of ${formatBDT(next.amountBDT)} is paid. It ${days < 0 ? "was" : "is"} due on ${due}.`
      : `${next.part} of ${amount} for your ${l.plan.name} membership (${l.units} shares) ${days < 0 ? "was" : "is"} due on ${due}.`,
    progressLine(l),
    "Pay online from your dashboard, or by bank or mobile banking using the details there.",
  ].join("\n");
  return { title, body };
}

/**
 * The installment reminder job. Looks at every open holding's next unpaid
 * installment and sends whichever reminder its due date calls for. Safe to
 * run as often as you like — reminders are de-duplicated per installment and
 * bucket. Pass `userId` to limit it to one shareholder.
 */
export async function runInstallmentReminders({ userId, now = new Date() }: { userId?: string; now?: Date } = {}) {
  const holdings = await prisma.shareHolding.findMany({
    where: { status: { not: "CANCELLED" }, ...(userId ? { userId } : {}) },
    include: ledgerInclude,
  });
  const today = now.toISOString();
  let sent = 0;
  let emailed = 0;
  for (const h of holdings) {
    const l = holdingLedger(h);
    if (!l.nextDue || l.hasPending) continue;
    const days = daysUntil(l.nextDue.dueDate, today);
    const bucket = reminderBucket(days);
    if (!bucket) continue;
    const { title, body } = reminderText(l, days);
    const n = await notify(h.user, {
      kind: bucket.kind,
      title,
      body,
      href: "/account?tab=holdings",
      holdingId: h.id,
      installmentNo: l.nextDue.n,
      dedupeKey: `due:${h.id}:${l.nextDue.n}:${bucket.key}`,
    });
    if (n) {
      sent++;
      if (n.emailStatus === "SENT") emailed++;
    }
  }
  return { checked: holdings.length, sent, emailed };
}

/** A manual nudge from the admin panel for one holding's next installment. */
export async function sendManualReminder(holdingId: string) {
  const h = await prisma.shareHolding.findUnique({ where: { id: holdingId }, include: ledgerInclude });
  if (!h) return null;
  const l = holdingLedger(h);
  if (!l.nextDue) return null;
  const { title, body } = reminderText(l, daysUntil(l.nextDue.dueDate, new Date().toISOString()));
  return notify(h.user, {
    kind: "REMINDER",
    title,
    body,
    href: "/account?tab=holdings",
    holdingId: h.id,
    installmentNo: l.nextDue.n,
    dedupeKey: `manual:${h.id}:${l.nextDue.n}:${Date.now()}`,
  });
}
