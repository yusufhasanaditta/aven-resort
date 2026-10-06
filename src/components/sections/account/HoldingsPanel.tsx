"use client";

import { useState } from "react";
import { TierIcon } from "@/components/ui/TierIcon";
import { CancelReservationButton, PayNextButton } from "@/components/sections/AccountActions";
import { Glass, StatusChip, accentOnDark } from "./ui";
import { daysUntil, formatDate, paymentPlanLabel, type DashboardData, type DashHolding } from "@/lib/account";
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
  const paidCount = h.paidCount;
  const nextStep = h.nextDue ? h.steps.find((s) => s.n === h.nextDue!.n) : undefined;
  const nextDays = h.nextDue ? daysUntil(h.nextDue.dueDate, now) : 0;
  const pct = h.totalAmountBDT ? Math.round((h.paidBDT / h.totalAmountBDT) * 100) : 0;

  return (
    <Glass as="article" className="overflow-hidden p-0 sm:p-0">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px]" style={{ background: h.plan.accentColor }} />
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-6">
        <div className="flex min-w-0 items-center gap-4">
          <TierIcon tierId={h.plan.slug} color={accentOnDark(h.plan.accentColor)} />
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-cream-200/50">
              {h.plan.name} membership{h.shareNo && <> · Share {h.shareNo}</>}
            </p>
            <p className="mt-0.5 font-display text-2xl text-cream-50">
              {h.units} unit share{h.units > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusChip status={h.status === "CANCELLED" ? "CANCELLED" : h.status} />
          <p className="font-numeral text-xl text-cream-50">
            {h.discountBDT > 0 && (
              <span className="mr-2 align-middle text-sm text-cream-200/40 line-through">{formatBDT(h.listPriceBDT)}</span>
            )}
            {formatBDT(h.totalAmountBDT)}
          </p>
        </div>
        {h.discountBDT > 0 && (
          <p className="w-full rounded-xl bg-emerald-400/10 px-3.5 py-2 text-xs text-emerald-200">
            You received a <strong className="font-semibold">{formatBDT(h.discountBDT)}</strong> discount
            {h.discountNote ? <> · {h.discountNote}</> : null} — your installments are worked out on the discounted price.
          </p>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-px border-y border-white/6 bg-white/6 sm:grid-cols-4">
        {[
          { k: "Opened", v: formatDate(h.openedAt) },
          { k: "Plan", v: paymentPlanLabel(h) },
          { k: "Of the resort", v: `${ownershipPercent(h.units).toFixed(2)}%` },
          { k: "Free stay", v: `${stayDays(h.plan.freeStayNights)} days / yr` },
        ].map((d) => (
          <div key={d.k} className="bg-forest-950/60 px-4 py-3 sm:px-6 sm:py-3.5">
            <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">{d.k}</dt>
            <dd className="mt-1 text-sm font-medium text-cream-100">{d.v}</dd>
          </div>
        ))}
      </dl>

      {/* Installment tracker */}
      {h.status !== "CANCELLED" && h.steps.length > 1 && (
        <div className="grid grid-cols-2 gap-2.5 p-4 pb-0 sm:gap-3 sm:p-6 sm:pb-0 lg:grid-cols-4">
          <TrackerStat label="Paid" value={`${paidCount} of ${h.steps.length}`} sub={`${formatBDT(h.paidBDT)} · ${pct}%`} tone="emerald" />
          <TrackerStat
            label="Left to pay"
            value={String(h.leftCount)}
            sub={h.leftCount ? `${formatBDT(h.remainingBDT)} remaining` : "Nothing left to pay"}
            tone="gold"
          />
          <TrackerStat
            label="Next due"
            value={nextStep ? nextStep.part : "—"}
            sub={h.nextDue ? `${formatBDT(h.nextDue.amountBDT)} · ${formatDate(h.nextDue.dueDate)}` : "All paid"}
            tone="sky"
          />
          <TrackerStat
            label={h.overdueCount ? "Overdue" : "Countdown"}
            value={h.overdueCount ? `${h.overdueCount} overdue` : !h.nextDue ? "Done" : nextDays <= 0 ? "Due today" : `${nextDays} days`}
            sub={h.overdueCount ? "Please pay to stay on schedule" : h.nextDue ? "Until the next installment" : "Fully paid"}
            tone={h.overdueCount ? "red" : "slate"}
          />
        </div>
      )}

      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4 text-xs">
          <p className="text-cream-200/55">
            {paidCount} of {h.steps.length} paid · {h.leftCount} left · {formatBDT(h.paidBDT)} of {formatBDT(h.totalAmountBDT)}
          </p>
          {h.steps.length > 1 && (
            <button type="button" onClick={() => setOpen((o) => !o)} className="shrink-0 font-medium text-gold-300 hover:underline">
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
              const isNext = h.nextDue?.n === s.n;
              const d = daysUntil(s.dueDate, now);
              return (
                <li
                  key={s.n}
                  className={cn(
                    "grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 px-3.5 py-3 text-[0.8125rem] sm:gap-x-4 sm:px-4",
                    isNext && "bg-gold-400/[0.06]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full font-numeral text-[0.6875rem]",
                      s.status === "SUCCESS" ? "bg-emerald-300/15 text-emerald-200" : "bg-white/6 text-cream-200/60",
                    )}
                  >
                    {s.status === "SUCCESS" ? "✓" : s.n}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-cream-100">
                      {s.part}
                      {s.part !== s.label && <span className="hidden text-cream-200/40 sm:inline"> {s.label.replace(s.part, "").trim()}</span>}
                    </span>
                    <span className={cn("block text-[0.6875rem]", !s.paidAt && d < 0 ? "text-red-300/80" : "text-cream-200/45")}>
                      {s.paidAt
                        ? `Paid ${formatDate(s.paidAt)}`
                        : d < 0
                          ? `${-d} day${d === -1 ? "" : "s"} late · due ${formatDate(s.dueDate)}`
                          : d === 0
                            ? "Due today"
                            : `${isNext ? "Next · " : ""}Due ${formatDate(s.dueDate)}`}
                    </span>
                  </span>
                  <span className="flex flex-col items-end gap-1 sm:flex-row-reverse sm:items-center sm:gap-4">
                    <span className="whitespace-nowrap font-numeral text-cream-50">{formatBDT(s.amountBDT)}</span>
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
          ) : (
            <>
              <p className="text-xs text-cream-200/55">
                {h.hasPending
                  ? "A payment was started but not finished — you can pay again."
                  : `Next: ${formatBDT(h.nextDue?.amountBDT ?? 0)} · due ${h.nextDue ? formatDate(h.nextDue.dueDate) : "—"}`}
              </p>
              <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-start">
                {paidCount === 0 && <CancelReservationButton holdingId={h.id} />}
                <PayNextButton
                  holdingId={h.id}
                  tone="light"
                  className="w-full justify-center sm:w-auto"
                  label={`${h.paymentPlan === "INSTALLMENT" && nextStep ? `Pay ${nextStep.part.toLowerCase()}` : "Pay now"} · ${formatBDT(h.nextDue?.amountBDT ?? 0)}`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </Glass>
  );
}

const trackerTones = {
  emerald: "text-emerald-300",
  gold: "text-gold-300",
  sky: "text-sky-300",
  red: "text-red-300",
  slate: "text-cream-50",
};

function TrackerStat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone: keyof typeof trackerTones }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/6 sm:px-4 sm:py-3.5">
      <p className="truncate text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/45">{label}</p>
      <p className={cn("mt-1 font-display text-lg leading-tight sm:text-2xl", trackerTones[tone])}>{value}</p>
      <p className="mt-0.5 text-[0.6875rem] leading-snug text-cream-200/50">{sub}</p>
    </div>
  );
}
