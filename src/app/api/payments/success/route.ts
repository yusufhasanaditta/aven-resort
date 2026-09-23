import { NextResponse } from "next/server";

/**
 * SSLCommerz redirects the shareholder's browser here with a POST after
 * checkout. The authoritative status update happens server-to-server via
 * /api/payments/ipn — this route only reads the tran_id to bounce the
 * browser to a friendly confirmation on the account page.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString() ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(
    `${siteUrl}/account?payment=success&tran=${encodeURIComponent(tranId)}`,
    { status: 303 },
  );
}
