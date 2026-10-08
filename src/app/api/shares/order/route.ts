import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { shareOrderSchema, zodErrors } from "@/lib/validation";
import { calculate, toDhakaDay } from "@/lib/shares";
import { startPayment } from "@/lib/payments";
import { convertLeadsFor } from "@/lib/crm";
import { nextShareNumbers } from "@/lib/member";

/**
 * Creates a share holding at the price the calculator showed, then starts
 * the payment the shareholder chose to make now (the full amount, or the
 * down payment) through the gateway — or, while online payment isn't
 * connected, keeps the reservation and says how to pay offline. That one
 * payment is the holding's only installment; the rest is an open balance,
 * paid in any amounts, with more installments added by the team if agreed.
 * Never a fabricated success.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Please sign in to purchase shares." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = shareOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  }

  const { planSlug, units, paymentPlan } = parsed.data;

  const plans = await prisma.membershipPlan.findMany();
  if (!plans.some((p) => p.slug === planSlug)) {
    return NextResponse.json({ error: "Unknown membership plan." }, { status: 400 });
  }

  // Installment count and down payment come from the plan, not the client.
  const result = calculate(plans, units, paymentPlan);
  const firstDue = result.installments ? result.installments[0].amountBDT : result.totalBDT;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const holding = await prisma.$transaction(async (tx) =>
    tx.shareHolding.create({
      data: {
        ...(await nextShareNumbers(tx, result.units)),
        userId: user.id,
        planId: result.plan.id,
        units: result.units,
        totalAmountBDT: result.totalBDT,
        paymentPlan,
        installmentMonths: null,
        downPaymentBDT: null,
        scheduleJson: JSON.stringify([
          { due: toDhakaDay(new Date()), amountBDT: firstDue, label: result.installments ? "Down payment" : "Full payment" },
        ]),
      },
    }),
  );

  await convertLeadsFor(user.email, `reserved ${result.units} ${result.plan.name} share(s) online`);

  const started = await startPayment({
    holdingId: holding.id,
    installmentNo: 1,
    amountBDT: firstDue,
    tranId: `AVEN-${holding.id}-1-${randomUUID().slice(0, 8)}`,
    customer: user,
    productName: `${result.plan.name} — ${result.units} unit share(s), Aven Eco Luxury Resort`,
  });

  if (!started.ok) {
    return NextResponse.json(
      { error: `${started.error} Your reservation is saved — you can retry the payment from My holdings.`, holdingId: holding.id },
      { status: started.status },
    );
  }
  return NextResponse.json({ ok: true, holdingId: holding.id, gatewayUrl: started.gatewayUrl, notice: started.notice });
}
