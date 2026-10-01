import { NextResponse } from "next/server";
import { confirmWithGateway, settlePayment } from "@/lib/payments";

/**
 * SSLCommerz's server-to-server Instant Payment Notification — the
 * authoritative confirmation, since a closed tab can drop the browser
 * redirect. A success is only recorded after independently re-validating the
 * transaction with SSLCommerz and checking the amount matches.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const fields = Object.fromEntries(form);
  const tranId = form.get("tran_id")?.toString();
  const valId = form.get("val_id")?.toString();
  const status = form.get("status")?.toString();

  if (!tranId) return NextResponse.json({ error: "Missing tran_id." }, { status: 400 });

  if (status !== "VALID" && status !== "VALIDATED") {
    const r = await settlePayment(tranId, status === "CANCELLED" ? "CANCELLED" : "FAILED", { valId, raw: { ipn: fields } });
    return NextResponse.json({ ok: r.ok, recorded: r.status ?? "UNKNOWN" }, { status: r.ok ? 200 : 404 });
  }
  if (!valId) return NextResponse.json({ error: "Missing val_id." }, { status: 400 });

  const result = await confirmWithGateway(tranId, valId, fields);
  return NextResponse.json({ ok: result.ok, recorded: result.status ?? "UNKNOWN" }, { status: result.ok ? 200 : 404 });
}
