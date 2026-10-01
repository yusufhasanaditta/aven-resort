import { confirmWithGateway } from "@/lib/payments";
import { returnTo } from "../return";

/**
 * SSLCommerz sends the shareholder's browser here after a successful
 * checkout. The payment is confirmed right away (re-validated with
 * SSLCommerz, exactly as the IPN does — whichever arrives first records it),
 * then the shareholder lands on their dashboard with the receipt.
 */
export async function POST(request: Request) {
  const form = await request.formData();
  const tranId = form.get("tran_id")?.toString() ?? "";
  const valId = form.get("val_id")?.toString();
  if (tranId && valId) {
    const r = await confirmWithGateway(tranId, valId, Object.fromEntries(form));
    if (r.ok && r.status !== "SUCCESS") return returnTo(request, "failed", tranId);
  }
  return returnTo(request, "success", tranId);
}

export const GET = (request: Request) => returnTo(request, "success", new URL(request.url).searchParams.get("tran_id") ?? "");
