import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getContent } from "@/lib/cms";
import { formatDate, holdingLedger, invoiceNumberFor, memberIdFor, paymentLabel } from "@/lib/account";
import { formatBDT, ownershipPercent, stayDays } from "@/lib/shares";
import { LogoMark } from "@/components/ui/Logo";
import { PrintButton } from "@/components/sections/account/PrintButton";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Receipt", robots: { index: false } };

const stamp = {
  SUCCESS: { label: "Paid", className: "border-emerald-600 text-emerald-700" },
  PENDING: { label: "Awaiting payment", className: "border-gold-600 text-gold-600" },
  FAILED: { label: "Void — payment failed", className: "border-red-600 text-red-600" },
  CANCELLED: { label: "Void", className: "border-forest-900/40 text-forest-900/50" },
} as const;

const METHOD: Record<string, string> = {
  SSLCOMMERZ: "SSLCommerz (online)",
  BANK_TRANSFER: "Bank transfer / deposit",
  CASH: "Cash",
  CHEQUE: "Cheque",
  BKASH: "bKash",
  NAGAD: "Nagad",
  CARD: "Card (POS)",
  OTHER: "Other",
};

/**
 * A money receipt (once paid) or invoice (while pending) for one payment:
 * customer, package and share details, the transaction, and where the
 * holding stands afterwards — paid to date and remaining balance. Readable
 * only by the owning shareholder or an admin; anyone else gets a 404.
 */
export default async function ReceiptPage({ params }: { params: Promise<{ paymentId: string }> }) {
  const session = await getSession();
  const { paymentId } = await params;
  if (!session) redirect(`/login?next=/account/invoices/${paymentId}`);

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { holding: { include: { plan: true, user: true, payments: true } } },
  });
  if (!payment || (payment.holding.userId !== session.sub && session.role !== "ADMIN")) notFound();

  const contact = await getContent("contact");
  const { holding } = payment;
  const { user, plan } = holding;
  const ledger = holdingLedger(holding);
  const paid = payment.status === "SUCCESS";
  const docNo = invoiceNumberFor(payment).replace(/^INV/, paid ? "RCPT" : "INV");
  const s = stamp[payment.status];
  const perUnit = holding.units ? Math.round(holding.totalAmountBDT / holding.units) : 0;
  const settledOn = (payment.paidAt ?? payment.updatedAt).toISOString();
  const isAdmin = session.role === "ADMIN";

  return (
    <div className="min-h-[100svh] bg-cream-200 pb-16 pt-[calc(var(--header-height)+2rem)] print:bg-white print:p-0">
      <div className="mx-auto max-w-3xl px-4 print:max-w-none print:px-0">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <Link href={isAdmin ? "/admin?tab=payments" : "/account?tab=invoices"} className="text-sm font-medium text-forest-700 hover:underline">
            ← {isAdmin ? "Back to admin payments" : "Back to payments"}
          </Link>
          <PrintButton />
        </div>

        <article className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-lift-lg sm:p-12 print:rounded-none print:shadow-none">
          <div className="bg-leaf-swirl pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />

          <div className="relative">
            {/* Letterhead */}
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="h-12 w-12"><LogoMark /></span>
                <div>
                  <p className="font-display text-2xl tracking-[0.28em] text-forest-900">AVEN</p>
                  <p className="text-[0.625rem] font-semibold tracking-[0.2em] text-forest-600/70">ECO LUXURY RESORT &amp; WELLNESS</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl text-forest-900">{paid ? "Money Receipt" : "Invoice"}</p>
                <p className="mt-1 font-mono text-sm text-forest-900/70">{docNo}</p>
              </div>
            </div>

            <div className="mt-10 grid gap-8 text-sm sm:grid-cols-3">
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-900/45">{paid ? "Received by" : "From"}</p>
                <p className="mt-2 font-semibold text-forest-900">{site.company}</p>
                <p className="mt-1 text-xs leading-relaxed text-forest-900/65">{contact.headOffice}</p>
                <p className="mt-1 text-xs text-forest-900/65">{contact.phone} · {contact.email}</p>
              </div>
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-900/45">{paid ? "Received from" : "Billed to"}</p>
                <p className="mt-2 font-semibold text-forest-900">{user.name}</p>
                <p className="mt-1 text-xs text-forest-900/65">{user.email}</p>
                <p className="text-xs text-forest-900/65">{user.phone}</p>
                <p className="text-xs text-forest-900/65">{user.location}</p>
                <p className="mt-1 font-mono text-[0.6875rem] text-forest-900/55">Member {memberIdFor(user)}</p>
              </div>
              <dl className="space-y-2 text-xs sm:text-right">
                <div>
                  <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Issued</dt>
                  <dd className="mt-0.5 text-forest-900">{formatDate(payment.createdAt.toISOString())}</dd>
                </div>
                {paid && (
                  <div>
                    <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Payment date</dt>
                    <dd className="mt-0.5 text-forest-900">{formatDate(settledOn)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-900/45">Installment</dt>
                  <dd className="mt-0.5 text-forest-900">
                    {paymentLabel(holding, payment.installmentNo)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Line */}
            <table className="mt-10 w-full text-left text-sm">
              <thead>
                <tr className="border-b-2 border-forest-900 text-[0.625rem] uppercase tracking-[0.16em] text-forest-900/55">
                  <th scope="col" className="pb-2.5 font-semibold">Description</th>
                  <th scope="col" className="pb-2.5 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-forest-900/10 align-top">
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-forest-900">
                      {plan.name} Membership — {holding.units} unit share{holding.units > 1 ? "s" : ""}
                    </p>
                    <p className="mt-1 text-xs text-forest-900/60">{paymentLabel(holding, payment.installmentNo)}</p>
                    <p className="mt-1 text-xs text-forest-900/60">
                      {formatBDT(perUnit)} per share ({holding.paymentPlan === "INSTALLMENT" ? "installment" : "full-payment"} price) · {ownershipPercent(holding.units).toFixed(2)}% of the resort ·{" "}
                      {stayDays(plan.freeStayNights)} days free stay a year
                    </p>
                  </td>
                  <td className="py-4 text-right font-numeral text-forest-900">{formatBDT(payment.amountBDT)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-5 text-right text-xs font-semibold uppercase tracking-[0.14em] text-forest-900/55">
                    {paid ? "Amount received" : "Amount due"}
                  </td>
                  <td className="pt-5 text-right font-numeral text-2xl text-forest-900">{formatBDT(payment.amountBDT)}</td>
                </tr>
              </tfoot>
            </table>

            {/* Holding position */}
            <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-forest-900/10 bg-forest-900/10 sm:grid-cols-4">
              {[
                ["Holding value", formatBDT(holding.totalAmountBDT)],
                ["Paid to date", formatBDT(ledger.paidBDT)],
                ["Remaining balance", formatBDT(ledger.remainingBDT)],
                ["Next due", ledger.nextDue ? `${formatBDT(ledger.nextDue.amountBDT)} · ${formatDate(ledger.nextDue.dueDate)}` : "Fully paid"],
              ].map(([k, v]) => (
                <div key={k} className="bg-cream-50 px-4 py-3">
                  <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-forest-900/45">{k}</p>
                  <p className="mt-1 text-sm font-semibold text-forest-900">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
                <dt className="text-forest-900/45">Method</dt>
                <dd className="text-forest-900">{METHOD[payment.method] ?? payment.method}</dd>
                <dt className="text-forest-900/45">Transaction ID</dt>
                <dd className="break-all font-mono text-forest-900">{payment.tranId}</dd>
                {payment.reference && (
                  <>
                    <dt className="text-forest-900/45">Reference</dt>
                    <dd className="break-all font-mono text-forest-900">{payment.reference}</dd>
                  </>
                )}
                {payment.valId && (
                  <>
                    <dt className="text-forest-900/45">Validation</dt>
                    <dd className="break-all font-mono text-forest-900">{payment.valId}</dd>
                  </>
                )}
                {payment.recordedBy && (
                  <>
                    <dt className="text-forest-900/45">Received by</dt>
                    <dd className="text-forest-900">{payment.recordedBy}</dd>
                  </>
                )}
              </dl>
              <span className={cn("-rotate-6 rounded-lg border-[3px] px-4 py-1.5 font-display text-2xl font-semibold uppercase tracking-[0.12em]", s.className)}>
                {s.label}
              </span>
            </div>

            <p className="mt-12 border-t border-forest-900/10 pt-5 text-[0.6875rem] leading-relaxed text-forest-900/50">
              {site.name} · {contact.resortAddress}. Fractional share ownership with Saf-Kabla land registration. Unit
              pricing is indicative until confirmed by {site.company}. This {paid ? "receipt" : "invoice"} was generated
              electronically and is valid without a signature.
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
