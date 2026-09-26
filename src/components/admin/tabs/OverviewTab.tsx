"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, Badge, Card, CardHeader, Empty, ErrorNote, LeadBadge, PageHeader, Skeleton, Stat, leadStages, relTime } from "../kit";
import type { OverviewData } from "@/lib/admin-types";
import type { AdminNav } from "../AdminShell";
import { formatDate } from "@/lib/account";
import { formatBDT, formatBDTCompact } from "@/lib/shares";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function OverviewTab({ data, error, nav }: { data: OverviewData | null; error: string | null; nav: AdminNav }) {
  if (error) return <ErrorNote>{error}</ErrorNote>;
  if (!data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  const { leads, money, shares } = data;
  const soldPct = shares.total ? shares.sold / shares.total : 0;

  return (
    <>
      <PageHeader
        title="Overview"
        description="Sales pipeline, collections and what needs attention today."
      />

      {/* Attention strip */}
      {(money.overdueHoldings > 0 || leads.followUpsDue > 0 || data.pendingApplications > 0 || money.pendingPayments > 0) && (
        <div className="mb-5 flex flex-wrap gap-2">
          {money.overdueHoldings > 0 && (
            <AttentionChip tone="red" onClick={() => nav("installments", { filter: "overdue" })}>
              {money.overdueHoldings} holding{money.overdueHoldings > 1 ? "s" : ""} overdue · {formatBDT(money.overdueBDT)}
            </AttentionChip>
          )}
          {leads.followUpsDue > 0 && (
            <AttentionChip tone="amber" onClick={() => nav("leads", { filter: "due" })}>
              {leads.followUpsDue} follow-up{leads.followUpsDue > 1 ? "s" : ""} due today
            </AttentionChip>
          )}
          {data.pendingApplications > 0 && (
            <AttentionChip tone="violet" onClick={() => nav("applications")}>
              {data.pendingApplications} application{data.pendingApplications > 1 ? "s" : ""} to review
            </AttentionChip>
          )}
          {money.pendingPayments > 0 && (
            <AttentionChip tone="sky" onClick={() => nav("payments", { filter: "PENDING" })}>
              {money.pendingPayments} payment{money.pendingPayments > 1 ? "s" : ""} awaiting confirmation
            </AttentionChip>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Collected" value={formatBDTCompact(money.collectedBDT)} sub={`of ${formatBDTCompact(money.committedBDT)} committed`} icon="wallet" onClick={() => nav("payments")} />
        <Stat label="Outstanding" value={formatBDTCompact(money.outstandingBDT)} sub={money.overdueBDT ? `${formatBDTCompact(money.overdueBDT)} overdue` : "Nothing overdue"} icon="bell" tone={money.overdueBDT ? "red" : "gold"} onClick={() => nav("installments")} />
        <Stat label="Leads" value={leads.total} sub={`${leads.newThisMonth} new this month · ${Math.round(leads.conversionRate * 100)}% converted`} icon="users" tone="sky" onClick={() => nav("leads")} />
        <Stat label="Shareholders" value={data.shareholderCount} sub={`${shares.sold} shares sold`} icon="user" tone="violet" onClick={() => nav("customers")} />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Collections" subtitle="Confirmed payments received, last 12 months" />
          <CollectionsChart data={data.collectionsByMonth} />
        </Card>

        <Card>
          <CardHeader title="Shares sold" subtitle={`${shares.total.toLocaleString("en-US")} unit shares issued`} />
          <div className="flex items-center gap-6 p-5">
            <Gauge value={soldPct} />
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-[#6B756F]">Sold</dt>
                <dd className="text-lg font-semibold tabular-nums text-[#14201B]">{shares.sold.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B756F]">Active (paid in)</dt>
                <dd className="font-semibold tabular-nums text-[#14201B]">{shares.active.toLocaleString("en-US")}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6B756F]">Available</dt>
                <dd className="font-semibold tabular-nums text-[#14201B]">{(shares.total - shares.sold).toLocaleString("en-US")}</dd>
              </div>
            </dl>
          </div>
          <div className="border-t border-[#EEF0EC] px-5 py-4">
            <p className="mb-3 text-xs font-medium text-[#6B756F]">Shares by package</p>
            <ul className="space-y-2.5">
              {data.byPlan.map((p) => {
                const max = Math.max(1, ...data.byPlan.map((x) => x.units));
                return (
                  <li key={p.slug} className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3 text-xs">
                    <span className="truncate text-[#3D4A44]">{p.name}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-[#EEF1EC]">
                      <span className="block h-full rounded-full bg-forest-600" style={{ width: `${(p.units / max) * 100}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-[#14201B]">{p.units}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader
            title="Lead pipeline"
            subtitle={`${leads.total} leads · ${Math.round(leads.conversionRate * 100)}% conversion`}
            action={
              <button type="button" onClick={() => nav("leads")} className="text-xs font-medium text-forest-700 hover:underline">
                Open CRM
              </button>
            }
          />
          <ul className="space-y-3 p-5">
            {leads.byStatus.map((s) => {
              const stage = leadStages.find((x) => x.value === s.status)!;
              const max = Math.max(1, ...leads.byStatus.map((x) => x.count));
              return (
                <li key={s.status}>
                  <button
                    type="button"
                    onClick={() => nav("leads", { filter: s.status })}
                    className="grid w-full grid-cols-[6rem_1fr_2rem] items-center gap-3 text-left text-xs"
                  >
                    <span className="text-[#3D4A44]">{stage.label}</span>
                    <span className="h-6 overflow-hidden rounded-md bg-[#F2F4F1]">
                      <motion.span
                        initial={{ width: 0 }}
                        animate={{ width: `${(s.count / max) * 100}%` }}
                        transition={{ duration: 0.8, ease: easeOutExpo }}
                        className="block h-full rounded-md bg-gradient-to-r from-forest-600 to-forest-500"
                      />
                    </span>
                    <span className="text-right font-semibold tabular-nums text-[#14201B]">{s.count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader
            title="Dues — next 30 days"
            subtitle="Unpaid instalments, overdue first"
            action={
              <button type="button" onClick={() => nav("installments")} className="text-xs font-medium text-forest-700 hover:underline">
                All dues
              </button>
            }
          />
          {data.upcomingDues.length === 0 ? (
            <Empty icon="calendar" title="Nothing due">No instalments fall due in the next 30 days.</Empty>
          ) : (
            <ul className="divide-y divide-[#EEF0EC]">
              {data.upcomingDues.slice(0, 6).map((d) => (
                <li key={`${d.holdingId}-${d.n}`}>
                  <button
                    type="button"
                    onClick={() => nav("customers", { id: d.customerId })}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#FAFBF9]"
                  >
                    <Avatar name={d.customer} className="h-8 w-8" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-medium text-[#14201B]">{d.customer}</span>
                      <span className="block text-[0.6875rem] text-[#6B756F]">
                        {d.planName} · {d.n}/{d.of} · {formatDate(d.dueDate)}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block text-[0.8125rem] font-semibold tabular-nums text-[#14201B]">{formatBDTCompact(d.amountBDT)}</span>
                      {d.days < 0 ? (
                        <Badge tone="red">{-d.days}d overdue</Badge>
                      ) : (
                        <span className="text-[0.6875rem] text-[#6B756F]">{d.days === 0 ? "today" : `in ${d.days}d`}</span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Newest leads" action={
            <button type="button" onClick={() => nav("leads")} className="text-xs font-medium text-forest-700 hover:underline">View all</button>
          } />
          {leads.recent.length === 0 ? (
            <Empty icon="users" title="No leads yet">Interest-form and contact-form submissions appear here.</Empty>
          ) : (
            <ul className="divide-y divide-[#EEF0EC]">
              {leads.recent.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => nav("leads", { id: l.id })} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-[#FAFBF9]">
                    <Avatar name={l.name} className="h-8 w-8" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-medium text-[#14201B]">{l.name}</span>
                      <span className="block text-[0.6875rem] text-[#6B756F]">
                        {l.packageSlug ?? "No package yet"}
                        {l.investmentBDT ? ` · ${formatBDTCompact(l.investmentBDT)}` : ""} · {relTime(l.createdAt)}
                      </span>
                    </span>
                    <LeadBadge status={l.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-[#EEF0EC] px-5 py-3">
            <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">Recent activity</p>
            {data.activity.length === 0 ? (
              <p className="text-xs text-[#9AA39E]">Admin actions will be logged here.</p>
            ) : (
              <ul className="space-y-1.5">
                {data.activity.slice(0, 4).map((a) => (
                  <li key={a.id} className="truncate text-xs text-[#3D4A44]">
                    <span className="font-medium">{a.actor}</span> {a.action.toLowerCase()}
                    {a.target ? <> · {a.target}</> : null}{" "}
                    <span className="text-[#9AA39E]">{relTime(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

function AttentionChip({
  tone,
  onClick,
  children,
}: {
  tone: "red" | "amber" | "violet" | "sky";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const tones = {
    red: "border-red-200 bg-red-50 text-red-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  };
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-transform hover:-translate-y-px", tones[tone])}>
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      {children}
      <span aria-hidden="true">→</span>
    </button>
  );
}

/** Single series, one hue, value on hover; the current month is emphasised. */
function CollectionsChart({ data }: { data: OverviewData["collectionsByMonth"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.amountBDT));
  const total = data.reduce((s, d) => s + d.amountBDT, 0);
  const ticks = [1, 0.5, 0];

  return (
    <div className="p-5">
      <div className="mb-4 flex items-baseline gap-2">
        <p className="text-2xl font-semibold tabular-nums text-[#14201B]">{formatBDT(total)}</p>
        <p className="text-xs text-[#6B756F]">in 12 months</p>
      </div>
      <div className="relative h-56">
        {/* recessive grid */}
        {ticks.map((t) => (
          <div key={t} className="absolute inset-x-0 flex items-center gap-2" style={{ bottom: `calc(${t * 100}% * 0.88 + 1.5rem)` }}>
            <span className="w-12 shrink-0 text-right text-[0.625rem] tabular-nums text-[#9AA39E]">{t ? formatBDTCompact(max * t) : "0"}</span>
            <span className="h-px flex-1 bg-[#EEF0EC]" />
          </div>
        ))}
        <div className="absolute inset-y-0 left-14 right-0 flex items-end gap-2 pb-6">
          {data.map((d, i) => {
            const h = (d.amountBDT / max) * 88;
            const last = i === data.length - 1;
            return (
              <div
                key={d.key}
                className="relative flex h-full flex-1 flex-col items-center justify-end"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div className="absolute z-10 -translate-y-full whitespace-nowrap rounded-lg bg-[#14201B] px-2.5 py-1.5 text-[0.6875rem] text-white shadow-lg" style={{ bottom: `calc(${h}% + 0.5rem)` }}>
                    <span className="font-semibold">{formatBDT(d.amountBDT)}</span>
                    <span className="ml-1 text-white/60">{d.label}</span>
                  </div>
                )}
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(h, d.amountBDT ? 1.5 : 0.6)}%` }}
                  transition={{ duration: 0.9, delay: i * 0.03, ease: easeOutExpo }}
                  className={cn(
                    "w-full max-w-[2.25rem] rounded-t-[4px] transition-colors",
                    d.amountBDT === 0 ? "bg-[#EEF1EC]" : last || hover === i ? "bg-forest-600" : "bg-forest-400/70",
                  )}
                />
                <span className="absolute -bottom-0 translate-y-full pt-1.5 text-[0.625rem] text-[#8A948E]">{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Gauge({ value }: { value: number }) {
  const R = 46;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="56" cy="56" r={R} fill="none" stroke="#EEF1EC" strokeWidth="10" />
        <motion.circle
          cx="56"
          cy="56"
          r={R}
          fill="none"
          stroke="#0E4D38"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - Math.min(1, value)) }}
          transition={{ duration: 1.2, ease: easeOutExpo }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums text-[#14201B]">{(value * 100).toFixed(1)}%</span>
        <span className="text-[0.625rem] text-[#6B756F]">sold</span>
      </div>
    </div>
  );
}
