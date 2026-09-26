"use client";

import { useState } from "react";
import { TierIcon } from "@/components/ui/TierIcon";
import { PayNextButton } from "@/components/sections/AccountActions";
import { Glass, StatusChip, accentOnDark } from "./ui";
import { daysUntil, formatDate, type DashboardData, type DashHolding } from "@/lib/account";
import { formatBDT, ownershipPercent, stayDays } from "@/lib/shares";
import { cn } from "@/lib/utils";

export function HoldingsPanel({ data, onBuy }: { data: DashboardData; onBuy: () => void }) {
  if (data.holdings.length === 0) {
    return (
      <Glass className="py-14 text-center">
        <p className="font-display text-3xl text-cream-50">No holdings yet.</p>
        <p className="mx-auto mt-3 max-w-sm text-sm text-cream-200/60">
          Reserve your first unit shares and each holding — with its full
          payment schedule and due dates — will appear here.
        </p>
        <button
          type="button"
          onClick={onBuy}
          className="mt-6 inline-flex h-11 items-center rounded-full bg-gold-400 px-6 text-sm font-semibold text-forest-950 hover:bg-gold-300"
        >
          Buy shares
        </button>
      </Glass>
    );
  }

  return (
    <div className="space-y-5">
      {data.holdings.map((h) => (
        <HoldingCard key={h.id} holding={h} now={data.now} />
      ))}
    </div>
  );
}

function HoldingCard({ holding: h, now }: { holding: DashHolding; now: string }) {
  const [open, setOpen] = useState(h.steps.length <= 6 || !h.fullyPaid);
  const paidCount = h.steps.filter((s) => s.status === "SUCCESS").length;

  return (
    <Glass as="article" className="overflow-hidden p-0 sm:p-0">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ background: h.plan.accentColor }} />
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <TierIcon tierId={h.plan.slug} color={accentOnDark(h.plan.accentColor)} />
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-cream-200/50">
              {h.plan.name} membership
            </p>
            <p className="mt-0.5 font-display text-2xl text-cream-50">
              {h.units} unit share{h.units > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={h.status === "CANCELLED" ? "CANCELLED" : h.status} />
          <p className="font-numeral text-xl text-cream-50">{formatBDT(h.totalAmountBDT)}</p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-white/6 bg-white/6 sm:grid-cols-4">
        {[
          { k: "Opened", v: formatDate(h.openedAt) },
          { k: "Plan", v: h.paymentPlan === "INSTALLMENT" ? `${h.installmentMonths} months` : "Full payment" },
          { k: "Of the resort", v: `${ownershipPercent(h.units).toFixed(2)}%` },
          { k: "Free stay", v: `${stayDays(h.plan.freeStayNights)} days / yr` },
        ].map((d) => (
          <div key={d.k} className="bg-forest-950/60 px-5 py-3.5 sm:px-6">
            <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">{d.k}</dt>
            <dd className="mt-1 text-sm font-medium text-cream-100">{d.v}</dd>
          </div>
        ))}
      </dl>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between text-xs">
          <p className="text-cream-200/55">
            {paidCount} of {h.steps.length} paid · {formatBDT(h.paidBDT)}
          </p>
          {h.steps.length > 1 && (
            <button type="button" onClick={() => setOpen((o) => !o)} className="font-medium text-gold-300 hover:underline">
              {open ? "Hide schedule" : "Show schedule"}
            </button>
          )}
        </div>

        {/* Segmented progress */}
        <div className="mt-3 flex gap-1" role="img" aria-label={`${paidCount} of ${h.steps.length} payments made`}>
          {h.steps.map((s) => (
            <span
              key={s.n}
              className={cn(
                "h-1.5 flex-1 rounded-full",
                s.status === "SUCCESS" && "bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.5)]",
                s.status === "PENDING" && "animate-pulse bg-gold-300",
                s.status === "FAILED" && "bg-red-300/80",
                (s.status === "UPCOMING" || s.status === "CANCELLED") && "bg-white/10",
              )}
            />
          ))}
        </div>

        {open && (
          <ol className="mt-5 divide-y divide-white/6 rounded-2xl border border-white/6">
            {h.steps.map((s) => {
              const isNext = h.nextDue?.n === s.n && !h.hasPending;
              const d = daysUntil(s.dueDate, now);
              return (
                <li
                  key={s.n}
                  className={cn(
                    "grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 text-[0.8125rem] sm:grid-cols-[auto_1fr_auto_auto]",
                    isNext && "bg-gold-400/[0.06]",
                  )}
                >
                  <span className="font-numeral text-cream-200/40">{String(s.n).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-cream-100">{s.label}</span>
                    <span className="block text-[0.6875rem] text-cream-200/45">
                      {s.paidAt
                        ? `Paid ${formatDate(s.paidAt)}`
                        : `Due ${formatDate(s.dueDate)}${isNext ? (d < 0 ? ` · ${-d} days overdue` : d === 0 ? " · today" : ` · in ${d} days`) : ""}`}
                    </span>
                  </span>
                  <span className="font-numeral text-cream-50">{formatBDT(s.amountBDT)}</span>
                  <span className="col-span-3 sm:col-span-1 sm:justify-self-end">
                    <StatusChip status={s.status === "UPCOMING" && d < 0 ? "OVERDUE" : s.status} />
                  </span>
                </li>
              );
            })}
          </ol>
        )}

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {h.status === "CANCELLED" ? (
            <p className="text-xs text-cream-200/50">This holding was cancelled.</p>
          ) : h.fullyPaid ? (
            <p className="text-xs font-medium text-emerald-300">Fully paid — thank you.</p>
          ) : h.hasPending ? (
            <p className="text-xs text-gold-300">A payment is in progress for this holding.</p>
          ) : (
            <>
              <p className="text-xs text-cream-200/55">
                Next: {formatBDT(h.nextDue?.amountBDT ?? 0)} · due {h.nextDue ? formatDate(h.nextDue.dueDate) : "—"}
              </p>
              <PayNextButton
                holdingId={h.id}
                tone="light"
                label={h.paymentPlan === "INSTALLMENT" ? `Pay instalment ${h.nextDue?.n}` : "Complete payment"}
              />
            </>
          )}
        </div>
      </div>
    </Glass>
  );
}
