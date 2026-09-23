import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString() ?? "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return NextResponse.redirect(
    `${siteUrl}/account?payment=cancelled&tran=${encodeURIComponent(tranId)}`,
    { status: 303 },
  );
}
