import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { shareSaleSchema, zodErrors } from "@/lib/validation";
import { SaleError, allocateHolding, notifyAllocated, settleInstallments } from "@/lib/sales";
import { calculate, formatBDT } from "@/lib/shares";

/**
 * A share sale closed at the office, in one step: the shares go into the
 * shareholder's account at the chart price, and the money they paid (cash,
 * bank, bKash…) settles the first payment(s) with a money receipt for each.
 * Their dashboard then shows the holding, the receipt and the next
 * installment due. If recording the money fails, the new holding is removed
 * again so nothing is left half-done.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = shareSaleSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { userId, units, paymentPlan, payment } = parsed.data;

  // Check the money against the schedule first, so a typo never uses up share numbers.
  if (payment) {
    const quote = calculate(await prisma.membershipPlan.findMany(), units, paymentPlan);
    const parts = quote.installments?.map((l) => l.amountBDT) ?? [quote.totalBDT];
    const count = payment.count ?? 1;
    if (count > parts.length) {
      return NextResponse.json({ errors: { count: `This sale has ${parts.length} payment${parts.length > 1 ? "s" : ""} in total.` } }, { status: 422 });
    }
    const due = parts.slice(0, count).reduce((s, a) => s + a, 0);
    if (payment.amountBDT !== due) {
      return NextResponse.json({ errors: { amountBDT: `That covers ${formatBDT(due)} — the amount must match.` } }, { status: 422 });
    }
  }

  let sale;
  try {
    sale = await allocateHolding(userId, units, paymentPlan);
  } catch (err) {
    if (err instanceof SaleError) return NextResponse.json({ error: err.message }, { status: err.status });
    throw err;
  }
  const { user, holding, result } = sale;

  let settled: Awaited<ReturnType<typeof settleInstallments>> | null = null;
  if (payment) {
    try {
      settled = await settleInstallments(holding.id, payment, guard.name);
    } catch (err) {
      await prisma.shareHolding.delete({ where: { id: holding.id } }).catch(() => null);
      if (err instanceof SaleError) {
        const body = err.field ? { errors: { [err.field]: err.message } } : { error: err.message };
        return NextResponse.json(body, { status: err.status });
      }
      throw err;
    }
  }

  await notifyAllocated(user, holding.id, result, !!settled);
  await logActivity(
    guard.name,
    "Share sale",
    user.name,
    `${result.units} × ${result.plan.name} · ${formatBDT(result.totalBDT)}${
      settled ? ` · received ${formatBDT(settled.totalBDT)} (${payment!.method.replace("_", " ").toLowerCase()})` : " · no payment yet"
    }`,
  );

  return NextResponse.json({
    ok: true,
    holdingId: holding.id,
    shareNo: { from: holding.shareFrom, to: holding.shareTo },
    paymentIds: settled?.payments.map((p) => p.id) ?? [],
    receivedBDT: settled?.totalBDT ?? 0,
    covered: settled?.covered ?? [],
    next: settled ? settled.next : result.installments ? { label: result.installments[0].label, amountBDT: result.installments[0].amountBDT } : { label: "Full payment", amountBDT: result.totalBDT },
    remainingBDT: result.totalBDT - (settled?.totalBDT ?? 0),
  });
}
