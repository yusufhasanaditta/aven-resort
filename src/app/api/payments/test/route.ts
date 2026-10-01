import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { paymentMode, settlePayment } from "@/lib/payments";
import { returnTo } from "../return";

const METHODS = new Set(["VISA", "MASTERCARD", "AMEX", "BKASH", "NAGAD", "ROCKET", "UPAY", "INTERNET BANKING"]);

/**
 * The test checkout's "gateway": records the outcome the tester picked, the
 * same way a real SSLCommerz result is recorded. Refused outside test mode, and
 * only the shareholder who owns the payment can complete it.
 */
export async function POST(request: Request) {
  if (paymentMode() !== "test") return NextResponse.json({ error: "Test payments are disabled." }, { status: 403 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });

  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString() ?? "";
  const outcome = form.get("outcome")?.toString();
  const method = form.get("method")?.toString().toUpperCase() ?? "";

  const payment = await prisma.payment.findUnique({ where: { tranId }, include: { holding: true } });
  if (!payment || payment.holding.userId !== session.sub) return NextResponse.json({ error: "Payment not found." }, { status: 404 });

  if (outcome === "success") {
    const r = await settlePayment(tranId, "SUCCESS", {
      valId: `TEST-${Date.now()}`,
      raw: { test: true, method },
      method: METHODS.has(method) ? `TEST · ${method}` : "TEST",
    });
    return returnTo(request, r.status === "SUCCESS" ? "success" : "failed", tranId);
  }
  const status = outcome === "fail" ? "FAILED" : "CANCELLED";
  await settlePayment(tranId, status, { raw: { test: true } });
  return returnTo(request, status === "FAILED" ? "failed" : "cancelled", tranId);
}
