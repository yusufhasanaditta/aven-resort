import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { shareOrderSchema, zodErrors } from "@/lib/validation";
import { calculate } from "@/lib/shares";
import { initiatePayment, isConfigured } from "@/lib/sslcommerz";
import { convertLeadsFor } from "@/lib/crm";

/**
 * Creates a share holding at the price the calculator showed, then either
 * hands back an SSLCommerz redirect URL (full payment or first installment)
 * or a clear "gateway not connected" message — never a fabricated success.
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
  const plan = plans.find((p) => p.slug === planSlug);
  if (!plan) {
    return NextResponse.json({ error: "Unknown membership plan." }, { status: 400 });
  }

  // Installment count and down payment come from the plan, not the client.
  const result = calculate(plans, units, paymentPlan);
  const firstDue = result.installments ? result.installments[0].amountBDT : result.totalBDT;

  const user = await prisma.user.findUnique({ where: { id: session.sub } });
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  const holding = await prisma.shareHolding.create({
    data: {
      userId: user.id,
      planId: result.plan.id,
      units: result.units,
      totalAmountBDT: result.totalBDT,
      paymentPlan,
      installmentMonths: result.installments ? result.installments.length : null,
      downPaymentBDT: result.downPaymentBDT,
    },
  });

  await convertLeadsFor(user.email, `reserved ${result.units} ${result.plan.name} share(s) online`);

  const tranId = `AVEN-${holding.id}-1-${randomUUID().slice(0, 8)}`;

  await prisma.payment.create({
    data: {
      holdingId: holding.id,
      amountBDT: firstDue,
      tranId,
      installmentNo: 1,
      status: "PENDING",
    },
  });

  if (!isConfigured()) {
    return NextResponse.json({
      ok: true,
      holdingId: holding.id,
      gatewayUrl: null,
      notice:
        "Your share reservation has been recorded. Online payment via SSLCommerz isn't connected yet — the AVEN team will contact you to complete payment.",
    });
  }

  const gateway = await initiatePayment({
    tranId,
    amountBDT: firstDue,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: user.phone,
    customerAddress: user.location,
    productName: `${result.plan.name} — ${result.units} unit share(s), Aven Eco Luxury Resort`,
  });

  if (!gateway.ok) {
    return NextResponse.json({ error: gateway.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, holdingId: holding.id, gatewayUrl: gateway.gatewayUrl });
}
