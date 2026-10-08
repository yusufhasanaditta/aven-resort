import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { paymentMode } from "@/lib/payments";
import { formatBDT } from "@/lib/shares";
import { paymentLabels } from "@/lib/account";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Secure checkout", robots: { index: false } };

const methods = [
  { group: "Cards", items: ["Visa", "Mastercard", "Amex"] },
  { group: "Mobile banking", items: ["bKash", "Nagad", "Rocket", "Upay"] },
  { group: "Net banking", items: ["Internet Banking"] },
];

/**
 * Test checkout — stands in for the SSLCommerz payment page until the store
 * credentials are added. It drives the same flow end to end (reservation,
 * receipt, installment tracker, notifications); no money moves.
 */
export default async function TestCheckout({ params }: { params: Promise<{ tranId: string }> }) {
  const { tranId: raw } = await params;
  const tranId = decodeURIComponent(raw);
  if (paymentMode() !== "test") notFound();
  const session = await getSession();
  if (!session) redirect(`/login?next=/pay/test/${encodeURIComponent(tranId)}`);

  const payment = await prisma.payment.findUnique({ where: { tranId }, include: { holding: { include: { plan: true, user: true, payments: true } } } });
  if (!payment || payment.holding.userId !== session.sub) notFound();
  if (payment.status !== "PENDING") redirect("/account?tab=holdings");

  const h = payment.holding;
  const what = paymentLabels(h)[payment.id] ?? "Payment";

  return (
    <div className="min-h-[100svh] bg-[#EEF2F0] px-4 py-8 text-[#14201B] sm:py-14">
      <div className="mx-auto max-w-xl">
        <p className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-900">
          TEST MODE — this checkout stands in for SSLCommerz until the store is connected. No money is charged.
        </p>

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-30px_rgba(10,40,30,0.35)]">
          <div className="flex items-center justify-between gap-4 bg-forest-900 px-6 py-5 text-cream-50">
            <div className="flex items-center gap-3">
              <span className="h-9 w-9"><LogoMark tone="light" /></span>
              <div>
                <p className="text-sm font-semibold">Aven Eco Luxury Resort</p>
                <p className="text-[0.6875rem] text-cream-200/70">{h.plan.name} · {h.units} share{h.units > 1 ? "s" : ""} · {what}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[0.625rem] uppercase tracking-[0.16em] text-cream-200/60">Amount</p>
              <p className="font-numeral text-2xl">{formatBDT(payment.amountBDT)}</p>
            </div>
          </div>

          <form action="/api/payments/test" method="post" className="p-6">
            <input type="hidden" name="tran_id" value={tranId} />
            <p className="text-sm font-semibold">Choose how to pay</p>
            <div className="mt-4 space-y-5">
              {methods.map((m, gi) => (
                <fieldset key={m.group}>
                  <legend className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[#6B756F]">{m.group}</legend>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {m.items.map((item, i) => (
                      <label key={item} className="cursor-pointer">
                        <input type="radio" name="method" value={item} defaultChecked={gi === 1 && i === 0} className="peer sr-only" />
                        <span className="flex h-12 items-center justify-center rounded-xl border border-[#DDE3DF] text-[0.8125rem] font-medium transition-colors peer-checked:border-forest-600 peer-checked:bg-forest-50 peer-checked:text-forest-800 peer-focus-visible:ring-2 peer-focus-visible:ring-forest-600 hover:border-forest-300">
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              ))}
            </div>

            <dl className="mt-6 space-y-1.5 rounded-2xl bg-[#F5F7F6] px-4 py-3 text-xs">
              <div className="flex justify-between gap-3"><dt className="text-[#6B756F]">Customer</dt><dd>{h.user.name}</dd></div>
              <div className="flex justify-between gap-3"><dt className="text-[#6B756F]">Transaction ID</dt><dd className="truncate font-mono">{tranId}</dd></div>
            </dl>

            <button name="outcome" value="success" className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-forest-700 text-sm font-semibold text-white transition-colors hover:bg-forest-800">
              Pay {formatBDT(payment.amountBDT)}
            </button>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button name="outcome" value="fail" className="h-10 rounded-full border border-red-200 text-xs font-medium text-red-700 hover:bg-red-50">
                Simulate a failed payment
              </button>
              <button name="outcome" value="cancel" className="h-10 rounded-full border border-[#DDE3DF] text-xs font-medium text-[#3D4A44] hover:bg-[#F5F7F6]">
                Cancel payment
              </button>
            </div>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-[#6B756F]">
          <Link href="/account?tab=holdings" className="hover:underline">Back to my account</Link>
        </p>
      </div>
    </div>
  );
}
