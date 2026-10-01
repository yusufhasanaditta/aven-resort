import { settlePayment } from "@/lib/payments";
import { returnTo } from "../return";

/** SSLCommerz sends the browser here when the shareholder cancels checkout. */
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString() ?? "";
  if (tranId) await settlePayment(tranId, "CANCELLED", { raw: { gateway: Object.fromEntries(form) } });
  return returnTo(request, "cancelled", tranId);
}

export const GET = (request: Request) => returnTo(request, "cancelled", "");
