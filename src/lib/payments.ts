import "server-only";
import { prisma } from "@/lib/db";
import { notifyPaymentReceived } from "@/lib/notify";
import { convertLeadsFor } from "@/lib/crm";
import { logActivity } from "@/lib/admin";
import { formatBDT } from "@/lib/shares";
import { initiatePayment, isConfigured, validateTransaction } from "@/lib/sslcommerz";

/**
 * How online payments run right now:
 * - "live"    — SSLCommerz credentials are set; shareholders go to the real gateway.
 * - "test"    — no credentials yet, but test checkout is allowed (always in
 *               development, or when PAYMENT_TEST_MODE=true): a built-in
 *               checkout page walks through the exact same flow, no money moves.
 * - "offline" — no credentials and test mode is off: the reservation is kept
 *               and the team collects payment by bank, bKash or cash.
 */
export type PaymentMode = "live" | "test" | "offline";

export function paymentMode(): PaymentMode {
  if (isConfigured()) return "live";
  const flag = process.env.PAYMENT_TEST_MODE?.trim();
  if (flag === "true") return "test";
  if (flag === "false") return "offline";
  return process.env.NODE_ENV === "production" ? "offline" : "test";
}

export const OFFLINE_NOTICE =
  "Your reservation is saved. Online card and mobile-banking payment is being connected — until then, pay by bank transfer or bKash using the details on this page, and the Aven team will confirm it.";

type StartInput = {
  holdingId: string;
  installmentNo: number;
  amountBDT: number;
  tranId: string;
  customer: { name: string; email: string; phone: string; location: string };
  productName: string;
};

export type StartResult = { ok: true; gatewayUrl: string | null; notice?: string } | { ok: false; error: string; status: number };

/**
 * Starts a gateway payment for one scheduled installment. Any earlier attempt
 * still pending for this holding is abandoned first, so a closed tab or a
 * back-button never locks the shareholder out of paying.
 */
export async function startPayment(input: StartInput): Promise<StartResult> {
  const mode = paymentMode();
  if (mode === "offline") return { ok: true, gatewayUrl: null, notice: OFFLINE_NOTICE };

  await prisma.payment.updateMany({
    where: { holdingId: input.holdingId, status: "PENDING", method: "SSLCOMMERZ" },
    data: { status: "CANCELLED", note: "Abandoned — replaced by a new payment attempt" },
  });
  await prisma.payment.create({
    data: {
      holdingId: input.holdingId,
      amountBDT: input.amountBDT,
      tranId: input.tranId,
      installmentNo: input.installmentNo,
      status: "PENDING",
    },
  });

  if (mode === "test") return { ok: true, gatewayUrl: `/pay/test/${encodeURIComponent(input.tranId)}` };

  const gateway = await initiatePayment({
    tranId: input.tranId,
    amountBDT: input.amountBDT,
    customerName: input.customer.name,
    customerEmail: input.customer.email,
    customerPhone: input.customer.phone,
    customerAddress: input.customer.location,
    productName: input.productName,
  });
  if (!gateway.ok) {
    await prisma.payment.update({
      where: { tranId: input.tranId },
      data: { status: "FAILED", note: `Gateway refused: ${gateway.error}`.slice(0, 500) },
    });
    return { ok: false, error: gateway.error, status: 502 };
  }
  return { ok: true, gatewayUrl: gateway.gatewayUrl };
}

export type Outcome = "SUCCESS" | "FAILED" | "CANCELLED";

/**
 * Applies a gateway result to a payment. Safe to call more than once for the
 * same transaction (IPN and browser redirect both report it): a payment that
 * already succeeded never changes again. A success that arrives for an
 * attempt already abandoned is still honoured — the money did arrive — unless
 * that installment was paid another way, in which case it is flagged for a
 * refund instead of being counted twice.
 */
export async function settlePayment(
  tranId: string,
  outcome: Outcome,
  details: { valId?: string; raw?: unknown; method?: string } = {},
): Promise<{ ok: boolean; paymentId?: string; status?: string }> {
  const payment = await prisma.payment.findUnique({ where: { tranId }, include: { holding: { include: { user: true } } } });
  if (!payment) return { ok: false };
  if (payment.status === "SUCCESS") return { ok: true, paymentId: payment.id, status: "SUCCESS" };

  const gatewayResponse = details.raw === undefined ? undefined : JSON.stringify(details.raw).slice(0, 20000);

  if (outcome !== "SUCCESS") {
    if (payment.status === "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: outcome, valId: details.valId, gatewayResponse },
      });
    }
    return { ok: true, paymentId: payment.id, status: outcome };
  }

  const alreadyPaid = await prisma.payment.count({
    where: { holdingId: payment.holdingId, installmentNo: payment.installmentNo, status: "SUCCESS" },
  });
  if (alreadyPaid) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "FAILED", valId: details.valId, gatewayResponse, note: "Duplicate payment received — refund required" },
    });
    await logActivity("Payment gateway", "Duplicate payment — refund due", payment.holding.user.name, formatBDT(payment.amountBDT));
    return { ok: true, paymentId: payment.id, status: "DUPLICATE" };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
        valId: details.valId,
        gatewayResponse,
        ...(details.method ? { reference: details.method } : {}),
      },
    }),
    ...(payment.holding.status === "PENDING_PAYMENT"
      ? [prisma.shareHolding.update({ where: { id: payment.holdingId }, data: { status: "ACTIVE" } })]
      : []),
  ]);

  await convertLeadsFor(payment.holding.user.email, "paid online").catch(() => {});
  await notifyPaymentReceived(payment.id).catch((err) => console.error("[aven] payment notice failed", err));
  await logActivity("Payment gateway", "Online payment received", payment.holding.user.name, formatBDT(payment.amountBDT)).catch(() => {});
  return { ok: true, paymentId: payment.id, status: "SUCCESS" };
}

/**
 * Re-validates a success SSLCommerz reported (by IPN or browser return) with
 * its validation API — matching transaction and amount — then records it.
 */
export async function confirmWithGateway(tranId: string, valId: string, fields: Record<string, unknown>) {
  const payment = await prisma.payment.findUnique({ where: { tranId } });
  if (!payment) return { ok: false as const };
  const check = await validateTransaction(valId);
  const raw = check.raw as { card_type?: unknown } | undefined;
  const valid = check.valid && check.tranId === tranId && check.amount !== undefined && Math.round(check.amount) === payment.amountBDT;
  const method = typeof raw?.card_type === "string" ? raw.card_type : undefined;
  return settlePayment(tranId, valid ? "SUCCESS" : "FAILED", { valId, raw: { gateway: fields, validation: check.raw }, method });
}
