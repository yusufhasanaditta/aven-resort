import "server-only";

/**
 * SSLCommerz REST integration — the Bangladeshi payment gateway named in the
 * brief. Implemented against their real v4 API contract (documented at
 * https://developer.sslcommerz.com) so it becomes live the moment real
 * credentials are set; nothing here is mocked.
 *
 * Until SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD are set, `isConfigured()`
 * returns false and the order route refuses to fabricate a payment — it tells
 * the shareholder plainly that the gateway isn't connected yet, rather than
 * pretending a transaction succeeded.
 */

const SANDBOX_API = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const LIVE_API = "https://securepay.sslcommerz.com/gwprocess/v4/api.php";
const SANDBOX_VALIDATION = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php";
const LIVE_VALIDATION = "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php";

function credentials() {
  const storeId = process.env.SSLCOMMERZ_STORE_ID?.trim();
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD?.trim();
  const isLive = process.env.SSLCOMMERZ_IS_LIVE === "true";
  return { storeId, storePassword, isLive };
}

export function isConfigured() {
  const { storeId, storePassword } = credentials();
  return Boolean(storeId && storePassword);
}

export type InitiatePaymentInput = {
  tranId: string;
  amountBDT: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
};

export type InitiatePaymentResult =
  | { ok: true; gatewayUrl: string }
  | { ok: false; error: string };

export async function initiatePayment(
  input: InitiatePaymentInput,
): Promise<InitiatePaymentResult> {
  const { storeId, storePassword, isLive } = credentials();
  if (!storeId || !storePassword) {
    return {
      ok: false,
      error:
        "The payment gateway isn't connected yet. AVEN's SSLCommerz Store ID and Password need to be added to the server environment before shares can be purchased online.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const body = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: String(input.amountBDT),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: `${siteUrl}/api/payments/success`,
    fail_url: `${siteUrl}/api/payments/fail`,
    cancel_url: `${siteUrl}/api/payments/cancel`,
    ipn_url: `${siteUrl}/api/payments/ipn`,
    cus_name: input.customerName,
    cus_email: input.customerEmail,
    cus_phone: input.customerPhone,
    cus_add1: input.customerAddress,
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: input.productName,
    product_category: "Real Estate Share",
    product_profile: "general",
  });

  try {
    const res = await fetch(isLive ? LIVE_API : SANDBOX_API, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = await res.json();

    if (json.status === "SUCCESS" && json.GatewayPageURL) {
      return { ok: true, gatewayUrl: json.GatewayPageURL as string };
    }
    return {
      ok: false,
      error: json.failedreason || "SSLCommerz rejected the payment request.",
    };
  } catch (err) {
    console.error("[aven] SSLCommerz initiate failed", err);
    return { ok: false, error: "Could not reach the payment gateway. Please try again." };
  }
}

/** Server-side validation of a val_id SSLCommerz hands back — never trust the client-side redirect alone. */
export async function validateTransaction(valId: string): Promise<{
  valid: boolean;
  amount?: number;
  tranId?: string;
  raw?: unknown;
}> {
  const { storeId, storePassword, isLive } = credentials();
  if (!storeId || !storePassword) return { valid: false };

  const url = new URL(isLive ? LIVE_VALIDATION : SANDBOX_VALIDATION);
  url.searchParams.set("val_id", valId);
  url.searchParams.set("store_id", storeId);
  url.searchParams.set("store_passwd", storePassword);
  url.searchParams.set("format", "json");

  try {
    const res = await fetch(url.toString());
    const json = await res.json();
    const valid = json.status === "VALID" || json.status === "VALIDATED";
    return {
      valid,
      amount: json.amount ? Number(json.amount) : undefined,
      tranId: json.tran_id,
      raw: json,
    };
  } catch (err) {
    console.error("[aven] SSLCommerz validation failed", err);
    return { valid: false };
  }
}
