import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { shareSaleSchema, zodErrors } from "@/lib/validation";
import { SaleError, allocateHolding, notifyAllocated, recordOfflinePayment } from "@/lib/sales";
import { calculate, discountProblem, flexibleQuote, formatBDT, withDiscount } from "@/lib/shares";

/**
 * A share sale closed at the office, in one step: the shares go into the
 * shareholder's account at the chart price (less any discount), and the money
 * they paid (cash, bank, bKash… — any amount) is recorded with a money receipt.
 * Their dashboard then shows the holding, the receipt and the next
 * installment due. If recording the money fails, the new holding is removed
 * again so nothing is left half-done.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = shareSaleSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { userId, units, paymentPlan, payment, discountBDT, discountNote } = parsed.data;
  const discount = { amountBDT: discountBDT, note: discountNote };

  // Check the money against the schedule first, so a typo never uses up share numbers.
  const chart = flexibleQuote(calculate(await prisma.membershipPlan.findMany(), units, paymentPlan));
  const problem = discountProblem(chart, discountBDT);
  if (problem) return NextResponse.json({ errors: { discountBDT: problem } }, { status: 422 });
  // Any amount can be paid now — part of the down payment, or several installments at once — but not more than the price.
  if (payment) {
    const totalBDT = withDiscount(chart, discountBDT).totalBDT;
    if (payment.amountBDT > totalBDT) {
      return NextResponse.json({ errors: { amountBDT: `The whole sale comes to ${formatBDT(totalBDT)} — that's the most they can pay.` } }, { status: 422 });
    }
  }

  let sale;
  try {
    sale = await allocateHolding(userId, units, paymentPlan, discount);
  } catch (err) {
    if (err instanceof SaleError) {
      return NextResponse.json(err.field ? { errors: { [err.field]: err.message } } : { error: err.message }, { status: err.status });
    }
    throw err;
  }
  const { user, holding, result } = sale;

  let settled: Awaited<ReturnType<typeof recordOfflinePayment>> | null = null;
  if (payment) {
    try {
      settled = await recordOfflinePayment(holding.id, payment, guard.name);
    } catch (err) {
      await prisma.shareHolding.delete({ where: { id: holding.id } }).catch(() => null);
      if (err instanceof SaleError) {
        const body = err.field ? { errors: { [err.field]: err.message } } : { error: err.message };
        return NextResponse.json(body, { status: err.status });
      }
      throw err;
    }
  }

  await notifyAllocated(user, holding.id, result, !!settled, discountBDT);
  await logActivity(
    guard.name,
    "Share sale",
    user.name,
    `${result.units} × ${result.plan.name} · ${formatBDT(result.totalBDT)}${
      discountBDT ? ` (${formatBDT(discountBDT)} discount${discountNote ? `: ${discountNote}` : ""})` : ""
    }${
      settled ? ` · received ${formatBDT(settled.totalBDT)} (${payment!.method.replace("_", " ").toLowerCase()})` : " · no payment yet"
    }`,
  );

  return NextResponse.json({
    ok: true,
    holdingId: holding.id,
    shareNo: { from: holding.shareFrom, to: holding.shareTo },
    paymentIds: settled ? [settled.payment.id] : [],
    receivedBDT: settled?.totalBDT ?? 0,
    covered: settled ? [settled.covered] : [],
    next: settled ? settled.next : null,
    remainingBDT: settled ? settled.remainingBDT : result.totalBDT,
  });
}
