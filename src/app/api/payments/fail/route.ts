import { settlePayment } from "@/lib/payments";
import { returnTo } from "../return";

/** SSLCommerz sends the browser here when a payment fails. */
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString() ?? "";
  if (tranId) await settlePayment(tranId, "FAILED", { raw: { gateway: Object.fromEntries(form) } });
  return returnTo(request, "failed", tranId);
}

export const GET = (request: Request) => returnTo(request, "failed", "");
