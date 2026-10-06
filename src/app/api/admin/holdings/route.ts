import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { holdingInclude, toAdminHolding } from "@/lib/admin-serialize";
import { formatBDT } from "@/lib/shares";
import { SaleError, allocateHolding, notifyAllocated } from "@/lib/sales";
import { discountFields, zodErrors } from "@/lib/validation";

/** Every holding with its full installment ledger — the source for the Installments & Dues tab. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const holdings = await prisma.shareHolding.findMany({ include: holdingInclude, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ holdings: holdings.map(toAdminHolding) });
}

const allocateSchema = z.object({
  userId: z.string().min(1),
  units: z.coerce.number().int().min(1, "At least one share.").max(2700),
  paymentPlan: z.enum(["FULL", "INSTALLMENT"]),
  ...discountFields,
});

/**
 * Allocates shares to a shareholder with no money taken yet — priced exactly
 * as the website prices it. To take the first payment at the same time, use
 * POST /api/admin/sales.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = allocateSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { userId, units, paymentPlan, discountBDT, discountNote } = parsed.data;

  try {
    const { user, holding, result } = await allocateHolding(userId, units, paymentPlan, { amountBDT: discountBDT, note: discountNote });
    await notifyAllocated(user, holding.id, result, false, discountBDT);
    await logActivity(guard.name, "Allocated shares", user.name, `${result.units} × ${result.plan.name} · ${formatBDT(result.totalBDT)}`);
    return NextResponse.json({ ok: true, holdingId: holding.id });
  } catch (err) {
    if (err instanceof SaleError) {
      return NextResponse.json(err.field ? { errors: { [err.field]: err.message } } : { error: err.message }, { status: err.status });
    }
    throw err;
  }
}
