"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { TiltCard } from "@/components/ui/TiltCard";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { PayNextButton } from "@/components/sections/AccountActions";
import { Glass, PanelTitle } from "./ui";
import { daysUntil, formatDate, type DashboardData } from "@/lib/account";
import { formatBDT, formatBDTCompact, stayDays } from "@/lib/shares";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export function OverviewPanel({
  data,
  onNavigate,
}: {
  data: DashboardData;
  onNavigate: (tab: "holdings" | "invoices" | "buy" | "profile") => void;
}) {
  const { user, summary, holdings, events, now } = data;
  const daysAsMember = Math.max(0, -daysUntil(user.memberSince, now));
  const firstName = user.name.split(" ")[0];
  const cardPlan = summary.currentPlan ?? data.plans[0];

  const kpis = [
    { icon: "layers", label: "Shares held", value: String(summary.activeUnits), sub: summary.reservedUnits ? `+${summary.reservedUnits} reserved` : "Active unit shares" },
    { icon: "pie", label: "Of the resort", value: `${summary.ownershipPct.toFixed(2)}%`, sub: "of 2,700 unit shares" },
    { icon: "wallet", label: "Paid to date", value: formatBDTCompact(summary.paidBDT), sub: `of ${formatBDTCompact(summary.committedBDT)} committed` },
    { icon: "bell", label: "Outstanding", value: formatBDTCompact(summary.outstandingBDT), sub: summary.outstandingBDT ? "Across open plans" : "Nothing owed" },
    { icon: "sun", label: "Free stay", value: `${summary.stayDaysPerYear} days`, sub: "Per year, at the resort" },
    { icon: "percent", label: "Plan share price", value: summary.currentPlan ? formatBDTCompact(summary.currentPlan.fullPriceBDT) : "—", sub: "Per share, paid in full" },
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {/* Identity */}
      <Glass className="overflow-hidden xl:col-span-2">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
          style={{ background: `${cardPlan?.accentColor ?? "#0E4D38"}55` }}
        />
        <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
          <div>
            <div className="flex items-center gap-4">
              {user.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- profile photo from /media
                <img src={user.photoUrl} alt={`${user.name}'s photo`} className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-2 ring-gold-400/50 sm:h-20 sm:w-20" />
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate("profile")}
                  className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border border-dashed border-gold-400/60 text-[0.625rem] font-semibold leading-tight text-gold-300 hover:bg-gold-400/10 sm:h-20 sm:w-20"
                >
                  <AdminIcon icon="user" className="mb-1 h-5 w-5" />
                  Add photo
                </button>
              )}
              <div className="min-w-0">
                <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">
                  Shareholder · ID {user.memberId}
                </p>
                <h2 className="mt-1 font-display text-4xl text-cream-50 sm:text-5xl">Welcome back, {firstName}.</h2>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate("buy")}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-gold-400 px-5 text-sm font-semibold text-forest-950 transition-colors hover:bg-gold-300"
              >
                <AdminIcon icon="cart" className="h-4 w-4" />
                Buy shares
              </button>
              <button
                type="button"
                onClick={() => onNavigate("invoices")}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-medium text-cream-100 transition-colors hover:bg-white/8"
              >
                <AdminIcon icon="invoice" className="h-4 w-4" />
                Invoices
              </button>
            </div>
          </div>

          {cardPlan && (
            <div className={cn("justify-self-center [perspective:1200px]", !summary.currentPlan && "opacity-60 grayscale")}>
              <TiltCard intensity={12} innerClassName="rounded-[1.6rem]">
                <MembershipCard
                  plan={cardPlan}
                  holder={{ name: user.name, memberId: user.memberId, photoUrl: user.photoUrl, shareNo: user.shareNumbers[0] }}
                  className="w-[17rem] sm:w-[21rem]"
                />
              </TiltCard>
              {!summary.currentPlan && (
                <p className="mt-3 text-center text-xs text-cream-200/60">Your card activates with your first paid share</p>
              )}
            </div>
          )}
        </div>
        <dl className="relative mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/8 pt-6 text-sm sm:grid-cols-3">
          {[
            { k: "Shareholder ID", v: user.memberId, mono: true },
            { k: user.shareNumbers.length > 1 ? "Share numbers" : "Share number", v: user.shareNumbers.join(", ") || "Issued with your first share", mono: user.shareNumbers.length > 0 },
            { k: "NID number", v: user.nid || "Not on file", mono: !!user.nid },
            { k: "Nominee", v: user.nomineeName ? `${user.nomineeName}${user.nomineeRelation ? ` (${user.nomineeRelation})` : ""}` : "Not on file" },
            { k: "Referred by", v: user.referredBy || "—" },
            { k: "Shareholder since", v: `${formatDate(user.memberSince)} · ${daysAsMember} day${daysAsMember === 1 ? "" : "s"}` },
          ].map((r) => (
            <div key={r.k} className="min-w-0">
              <dt className="text-[0.6875rem] text-cream-200/45">{r.k}</dt>
              <dd className={cn("mt-0.5 break-words font-medium text-cream-50", r.mono && "font-mono tracking-wide")}>{r.v}</dd>
            </div>
          ))}
        </dl>
        {!user.photoUrl && (
          <p className="relative mt-6 rounded-xl border border-gold-400/25 bg-gold-400/10 px-4 py-3 text-xs leading-relaxed text-gold-200">
            Please add your photo — it goes on your shareholder card and share certificate.{" "}
            <button type="button" onClick={() => onNavigate("profile")} className="font-semibold text-gold-300 underline underline-offset-2">
              Upload now
            </button>
          </p>
        )}
      </Glass>

      {/* Plan progress */}
      <PlanRing data={data} onBuy={() => onNavigate("buy")} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:col-span-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 * i, ease: easeOutExpo }}
          >
            <Glass className="h-full p-4 sm:p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/6 text-gold-300">
                <AdminIcon icon={k.icon} className="h-4 w-4" />
              </span>
              <p className="mt-4 truncate font-numeral text-xl text-cream-50 sm:text-2xl">{k.value}</p>
              <p className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-cream-200/55">
                {k.label}
              </p>
              <p className="mt-1 truncate text-[0.6875rem] text-cream-200/40">{k.sub}</p>
            </Glass>
          </motion.div>
        ))}
      </div>

      {/* Next payment */}
      <NextPayment data={data} />

      {/* Payment progress by holding */}
      <Glass>
        <PanelTitle
          eyebrow="Payments"
          title="Paid so far"
          action={
            <button type="button" onClick={() => onNavigate("holdings")} className="text-xs font-medium text-gold-300 hover:underline">
              All holdings
            </button>
          }
        />
        {holdings.length === 0 ? (
          <p className="mt-6 text-sm text-cream-200/55">No holdings yet — your payment progress will show here.</p>
        ) : (
          <ul className="mt-6 space-y-5">
            {holdings.filter((h) => h.status !== "CANCELLED").slice(0, 5).map((h, i) => {
              const pct = h.totalAmountBDT ? (h.paidBDT / h.totalAmountBDT) * 100 : 0;
              return (
                <li key={h.id}>
                  <div className="flex items-baseline justify-between gap-3 text-[0.8125rem]">
                    <span className="truncate font-medium text-cream-100">
                      {h.plan.name} · {h.units} share{h.units > 1 ? "s" : ""}
                    </span>
                    <span className="shrink-0 font-numeral text-cream-200/70">{Math.round(pct)}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.9, delay: 0.1 + i * 0.08, ease: easeOutExpo }}
                      style={{ width: `${Math.max(pct, 1.5)}%`, transformOrigin: "left" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                    />
                  </div>
                  <p className="mt-1.5 text-[0.6875rem] text-cream-200/45">
                    {formatBDT(h.paidBDT)} of {formatBDT(h.totalAmountBDT)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Glass>

      {/* Activity */}
      <Glass>
        <PanelTitle eyebrow="Timeline" title="Your activity" />
        <ol className="relative mt-6 space-y-5 before:absolute before:inset-y-1 before:left-[7px] before:w-px before:bg-white/10">
          {events.slice(0, 6).map((e) => (
            <li key={e.id} className="relative pl-7">
              <span
                className={cn(
                  "absolute left-0 top-1 h-[15px] w-[15px] rounded-full border-2 border-forest-950",
                  e.kind === "paid" && "bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.6)]",
                  e.kind === "pending" && "bg-gold-300",
                  e.kind === "failed" && "bg-red-300",
                  e.kind === "holding" && "bg-sky-300",
                  e.kind === "joined" && "bg-cream-100",
                )}
              />
              <p className="text-[0.8125rem] font-medium text-cream-50">{e.title}</p>
              <p className="truncate text-[0.6875rem] text-cream-200/50">{e.detail}</p>
              <p className="mt-0.5 text-[0.625rem] uppercase tracking-[0.12em] text-cream-200/35">{formatDate(e.at)}</p>
            </li>
          ))}
        </ol>
      </Glass>
    </div>
  );
}

function PlanRing({ data, onBuy }: { data: DashboardData; onBuy: () => void }) {
  const { summary } = data;
  const target = summary.nextPlan?.minUnits ?? summary.activeUnits;
  const progress = target ? Math.min(1, summary.activeUnits / target) : 1;
  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <Glass className="flex flex-col">
      <PanelTitle eyebrow="Membership" title={summary.currentPlan ? `${summary.currentPlan.name} member` : "Not yet a member"} />
      <div className="mt-5 flex flex-1 items-center gap-6">
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true">
            <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
            <motion.circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              stroke="url(#ring)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C * (1 - progress) }}
              transition={{ duration: 1.4, ease: easeOutExpo }}
            />
            <defs>
              <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#E8CF87" />
                <stop offset="100%" stopColor="#6EE7B7" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-numeral text-3xl text-cream-50">{summary.activeUnits}</p>
            <p className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/50">
              {summary.nextPlan ? `of ${target}` : "shares"}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          {summary.nextPlan ? (
            <>
              <p className="text-sm text-cream-100">
                <span className="font-semibold text-gold-300">
                  {summary.unitsToNextPlan} more share{summary.unitsToNextPlan === 1 ? "" : "s"}
                </span>{" "}
                to reach {summary.nextPlan.name}.
              </p>
              <p className="mt-2 text-xs leading-relaxed text-cream-200/55">
                {summary.nextPlan.name} brings {stayDays(summary.nextPlan.freeStayNights)} free days a year
                {` and ${formatBDT(summary.nextPlan.fullPriceBDT)} a share paid in full`}.
              </p>
            </>
          ) : (
            <p className="text-sm text-cream-100">
              You hold the highest plan — <span className="font-semibold text-gold-300">Royal</span>, with 100% villa ownership.
            </p>
          )}
          <button
            type="button"
            onClick={onBuy}
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-300 hover:underline"
          >
            Grow my holding →
          </button>
        </div>
      </div>
    </Glass>
  );
}

function NextPayment({ data }: { data: DashboardData }) {
  const next = data.summary.nextDue;
  if (!next) {
    const pending = data.holdings.some((h) => h.hasPending);
    return (
      <Glass className="flex flex-col justify-between">
        <PanelTitle eyebrow="Next payment" title={pending ? "Payment processing" : "You're all paid up"} />
        <p className="mt-4 text-sm leading-relaxed text-cream-200/60">
          {pending
            ? "A payment is being confirmed by SSLCommerz. It will appear on your invoices as soon as it clears."
            : data.holdings.length
              ? "No installments are due. Every open holding is settled."
              : "Once you reserve shares, your next due payment and its countdown appear here."}
        </p>
        {!data.holdings.length && (
          <Link href="/account?tab=buy" className="mt-5 text-xs font-semibold text-gold-300 hover:underline">
            Reserve your first shares →
          </Link>
        )}
      </Glass>
    );
  }

  const days = daysUntil(next.dueDate, data.now);
  const overdue = days < 0;

  return (
    <Glass className={cn("flex flex-col overflow-hidden", overdue && "border-red-300/25")}>
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full blur-3xl",
          overdue ? "bg-red-400/20" : "bg-gold-400/15",
        )}
      />
      <PanelTitle eyebrow="Next payment" title={formatBDT(next.amountBDT)} />
      <p className="mt-1 text-xs text-cream-200/55">
        {next.planName} · Installment {next.n} of {next.of}
      </p>
      <div className="relative mt-6 flex items-end gap-3">
        <p className={cn("font-numeral text-6xl leading-none", overdue ? "text-red-300" : "text-cream-50")}>
          {Math.abs(days)}
        </p>
        <p className="pb-1 text-sm text-cream-200/60">
          {overdue ? `day${Math.abs(days) === 1 ? "" : "s"} overdue` : days === 0 ? "due today" : `day${days === 1 ? "" : "s"} to go`}
        </p>
      </div>
      <p className="mt-2 flex items-center gap-2 text-xs text-cream-200/50">
        <AdminIcon icon="calendar" className="h-3.5 w-3.5" />
        Due {formatDate(next.dueDate)}
      </p>
      <UpNext data={data} holdingId={next.holdingId} after={next.n} />
      <div className="relative mt-auto pt-6">
        <PayNextButton holdingId={next.holdingId} label={`Pay ${formatBDT(next.amountBDT)} now`} tone="light" className="w-full" />
      </div>
    </Glass>
  );
}

/** The installments after the next one on the same holding, so the panel shows what's coming. */
function UpNext({ data, holdingId, after }: { data: DashboardData; holdingId: string; after: number }) {
  const holding = data.holdings.find((h) => h.id === holdingId);
  const later = holding?.steps.filter((s) => s.n > after && s.status !== "SUCCESS").slice(0, 3) ?? [];
  if (!later.length) return null;
  return (
    <div className="relative mt-6 border-t border-white/8 pt-4">
      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-cream-200/40">Up next</p>
      <ul className="mt-2.5 space-y-2 text-[0.8125rem]">
        {later.map((s) => (
          <li key={s.n} className="flex justify-between gap-3">
            <span className="text-cream-200/65">
              {s.label} · {s.n} of {holding!.steps.length}
            </span>
            <span className="font-numeral text-cream-100">{formatBDT(s.amountBDT)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
