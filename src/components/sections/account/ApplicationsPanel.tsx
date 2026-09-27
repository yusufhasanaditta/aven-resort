"use client";

import Link from "next/link";
import { Glass, PanelTitle } from "./ui";
import { formatDate } from "@/lib/account";
import { formatBDT } from "@/lib/shares";
import type { PaymentInstructions } from "@/data/cms-defaults";
import { cn } from "@/lib/utils";

export type AccountApplication = {
  id: string;
  planSlug: string;
  units: number;
  paymentPlan: "FULL" | "INSTALLMENT";
  installmentMonths: number | null;
  quotedTotalBDT: number;
  status: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

const STAGES = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"] as const;
const STAGE_LABEL = { SUBMITTED: "Submitted", UNDER_REVIEW: "Under review", APPROVED: "Approved", REJECTED: "Not approved" };

/** The shareholder's applications, each with a three-stop progress track. */
export function ApplicationsPanel({ applications, onHoldings }: { applications: AccountApplication[]; onHoldings: () => void }) {
  if (applications.length === 0) {
    return (
      <Glass className="py-14 text-center">
        <p className="font-display text-3xl text-cream-50">No applications yet.</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-cream-200/60">
          Apply formally with your NID and nominee details — the team reviews it and your installment schedule appears here once approved.
        </p>
        <Link href="/apply" className="mt-6 inline-flex h-11 items-center rounded-full bg-gold-400 px-6 text-sm font-semibold text-forest-950 hover:bg-gold-300">
          Start an application
        </Link>
      </Glass>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Link href="/apply" className="inline-flex h-10 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-cream-100 hover:bg-white/8">
          + New application
        </Link>
      </div>
      {applications.map((a) => {
        const reached = a.status === "REJECTED" ? 1 : STAGES.indexOf(a.status as (typeof STAGES)[number]);
        return (
          <Glass key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">
                  Applied {formatDate(a.createdAt)}
                </p>
                <p className="mt-1 font-display text-2xl capitalize text-cream-50">
                  {a.planSlug} · {a.units} share{a.units > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-cream-200/55">
                  {formatBDT(a.quotedTotalBDT)} · {a.paymentPlan === "INSTALLMENT" ? `down payment + ${a.installmentMonths} monthly` : "full payment"}
                </p>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  a.status === "APPROVED" && "bg-emerald-400/15 text-emerald-300",
                  a.status === "REJECTED" && "bg-red-400/15 text-red-300",
                  (a.status === "SUBMITTED" || a.status === "UNDER_REVIEW") && "bg-gold-400/15 text-gold-300",
                )}
              >
                {STAGE_LABEL[a.status]}
              </span>
            </div>

            <ol className="mt-6 grid grid-cols-3 gap-2">
              {STAGES.map((s, i) => {
                const failed = a.status === "REJECTED" && i === 2;
                const on = i <= reached && !failed;
                return (
                  <li key={s}>
                    <span className={cn("block h-1.5 rounded-full", failed ? "bg-red-400/70" : on ? "bg-emerald-300" : "bg-white/10")} />
                    <span className={cn("mt-2 block text-[0.6875rem]", on ? "text-cream-100" : "text-cream-200/40")}>
                      {failed ? "Not approved" : STAGE_LABEL[s]}
                    </span>
                  </li>
                );
              })}
            </ol>

            {a.status === "APPROVED" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-400/8 px-4 py-3">
                <p className="text-sm text-emerald-200">Approved — your holding and payment schedule are ready.</p>
                <button type="button" onClick={onHoldings} className="text-sm font-semibold text-gold-300 hover:underline">
                  View & pay →
                </button>
              </div>
            )}
            {a.status === "REJECTED" && a.adminNote && (
              <p className="mt-5 rounded-2xl bg-red-400/8 px-4 py-3 text-sm text-red-200">{a.adminNote}</p>
            )}
          </Glass>
        );
      })}
    </div>
  );
}

/** Bank / mobile-banking details set in the admin CMS, for paying offline. */
export function PaymentInstructionsCard({ info }: { info: PaymentInstructions }) {
  const rows = [
    ["Bank", info.bankName],
    ["Account name", info.accountName],
    ["Account no.", info.accountNumber],
    ["Branch", info.branch],
    ["Routing no.", info.routingNumber],
    ["bKash / Nagad", info.mobileBanking],
  ].filter(([, v]) => v);
  return (
    <Glass>
      <PanelTitle eyebrow="Pay by bank or mobile banking" title="Transfer details" />
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-cream-200/55">{k}</dt>
            <dd className="text-right font-mono text-cream-50">{v}</dd>
          </div>
        ))}
      </dl>
      {info.note && <p className="mt-4 text-xs leading-relaxed text-cream-200/55">{info.note}</p>}
    </Glass>
  );
}
