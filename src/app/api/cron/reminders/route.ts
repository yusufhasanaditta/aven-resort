import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { runInstallmentReminders } from "@/lib/notify";

/**
 * Daily installment-reminder job (scheduled in vercel.json). Vercel Cron calls
 * it with `Authorization: Bearer $CRON_SECRET`; an admin can also open it
 * while signed in. Idempotent — reminders are de-duplicated per installment.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorised = (secret && request.headers.get("authorization") === `Bearer ${secret}`) || (await requireAdmin());
  if (!authorised) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const result = await runInstallmentReminders();
  return NextResponse.json({ ok: true, ...result });
}
