import { NextResponse } from "next/server";

/** Back to the dashboard's holdings with the payment's outcome, as a GET so the session cookie comes along. */
export function returnTo(request: Request, outcome: "success" | "failed" | "cancelled", tranId: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const url = new URL("/account", base);
  url.searchParams.set("tab", "holdings");
  url.searchParams.set("payment", outcome);
  if (tranId) url.searchParams.set("tran", tranId);
  return NextResponse.redirect(url, { status: 303 });
}
