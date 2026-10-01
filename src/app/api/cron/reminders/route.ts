import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { runInstallmentReminders } from "@/lib/notify";

/**
 * Daily installment-reminder job. A scheduler calls it with the CRON_SECRET,
 * either as `Authorization: Bearer <secret>` or as `?key=<secret>` (for
 * Hostinger's cron jobs, which run a plain URL); an admin can also open it
 * while signed in. Idempotent — reminders are de-duplicated per installment.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const key = new URL(request.url).searchParams.get("key");
  const authorised =
    (secret && (request.headers.get("authorization") === `Bearer ${secret}` || key === secret)) || (await requireAdmin());
  if (!authorised) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const result = await runInstallmentReminders();
  return NextResponse.json({ ok: true, ...result });
}
