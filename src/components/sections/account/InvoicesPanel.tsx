"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { Glass, StatusChip } from "./ui";
import { formatDate, type DashboardData, type DashInvoice } from "@/lib/account";
import { formatBDT, formatBDTCompact } from "@/lib/shares";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "SUCCESS", label: "Paid" },
  { id: "PENDING", label: "Processing" },
  { id: "FAILED", label: "Failed" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

function matches(inv: DashInvoice, f: Filter) {
  if (f === "all") return true;
  if (f === "FAILED") return inv.status === "FAILED" || inv.status === "CANCELLED";
  return inv.status === f;
}

export function InvoicesPanel({ data }: { data: DashboardData }) {
  const [filter, setFilter] = useState<Filter>("all");
  const rows = useMemo(() => data.invoices.filter((i) => matches(i, filter)), [data.invoices, filter]);
  const paidTotal = data.invoices.filter((i) => i.status === "SUCCESS").reduce((s, i) => s + i.amountBDT, 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: "Invoices issued", value: String(data.invoices.length) },
          { label: "Total paid", value: formatBDTCompact(paidTotal) },
          { label: "Outstanding", value: formatBDTCompact(data.summary.outstandingBDT) },
        ].map((t) => (
          <Glass key={t.label} className="min-w-0 rounded-2xl p-3 sm:rounded-3xl sm:p-5">
            <p className="truncate font-numeral text-lg text-cream-50 sm:text-2xl">{t.value}</p>
            <p className="mt-1 text-[0.5625rem] font-semibold uppercase leading-snug tracking-[0.1em] text-cream-200/50 sm:text-[0.6875rem] sm:tracking-[0.12em]">{t.label}</p>
          </Glass>
        ))}
      </div>

      <Glass className="p-0 sm:p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/6 p-4 sm:px-6">
          <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]" role="group" aria-label="Filter invoices">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                  filter === f.id ? "bg-cream-50 text-forest-900" : "text-cream-200/70 hover:bg-white/8",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-cream-200/45">
            {rows.length} of {data.invoices.length}
          </p>
        </div>

        {rows.length === 0 ? (
          <p className="p-10 text-center text-sm text-cream-200/55">
            {data.invoices.length === 0
              ? "No invoices yet — one is issued for every payment you make."
              : "No invoices match this filter."}
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden w-full text-left text-[0.8125rem] md:table">
              <caption className="sr-only">Your invoices</caption>
              <thead>
                <tr className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                  <th scope="col" className="px-6 py-3 font-semibold">Receipt · Trx ID</th>
                  <th scope="col" className="py-3 font-semibold">Issued</th>
                  <th scope="col" className="py-3 font-semibold">Description</th>
                  <th scope="col" className="py-3 text-right font-semibold">Amount</th>
                  <th scope="col" className="py-3 pl-6 font-semibold">Status</th>
                  <th scope="col" className="px-6 py-3"><span className="sr-only">Open</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/6">
                {rows.map((inv) => (
                  <tr key={inv.id} className="group transition-colors hover:bg-white/[0.03]">
                    <td className="px-6 py-4">
                      <span className="block font-mono text-xs text-cream-100">{inv.invoiceNo}</span>
                      <span className="block max-w-[10rem] truncate font-mono text-[0.625rem] text-cream-200/40" title={inv.tranId}>{inv.tranId}</span>
                    </td>
                    <td className="py-4 text-cream-200/70">{formatDate(inv.issuedAt)}</td>
                    <td className="py-4">
                      <span className="flex items-center gap-2 text-cream-100">
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: inv.accentColor }} />
                        {inv.planName} · {inv.units} share{inv.units > 1 ? "s" : ""}
                      </span>
                      <span className="block pl-4 text-[0.6875rem] text-cream-200/45">{inv.label}</span>
                    </td>
                    <td className="py-4 text-right font-numeral text-cream-50">{formatBDT(inv.amountBDT)}</td>
                    <td className="py-4 pl-6"><StatusChip status={inv.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/account/invoices/${inv.id}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/12 px-3 py-1.5 text-xs font-medium text-cream-100 transition-colors hover:border-gold-300/50 hover:text-gold-300"
                      >
                        <AdminIcon icon="download" className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile cards */}
            <ul className="divide-y divide-white/6 md:hidden">
              {rows.map((inv) => (
                <li key={inv.id}>
                  <Link href={`/account/invoices/${inv.id}`} className="flex items-start justify-between gap-3 p-4">
                    <span className="min-w-0">
                      <span className="block font-mono text-xs text-cream-100">{inv.invoiceNo}</span>
                      <span className="mt-1 line-clamp-2 text-[0.8125rem] text-cream-100">
                        {inv.planName} · {inv.label}
                      </span>
                      <span className="block text-[0.6875rem] text-cream-200/45">{formatDate(inv.issuedAt)}</span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end gap-1.5">
                      <span className="font-numeral text-cream-50">{formatBDT(inv.amountBDT)}</span>
                      <StatusChip status={inv.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </Glass>
    </div>
  );
}
