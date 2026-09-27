import Link from "next/link";
import type { MembershipCardData } from "@/components/ui/MembershipCard";
import { formatBDT, ordinal, scheduleAmounts, stayDays } from "@/lib/shares";
import { cn } from "@/lib/utils";

/** Everything the price chart says about one plan, worked out for its package size. */
export function planBreakdown(plan: MembershipCardData) {
  const units = plan.minUnits;
  const installmentTotal = plan.unitPriceBDT * units;
  const fullPrice = plan.fullPriceBDT || plan.unitPriceBDT;
  const fullTotal = fullPrice * units;
  const months = Math.max(1, plan.installmentCount);
  const down = Math.min(plan.downPaymentBDT, installmentTotal);
  const parts = scheduleAmounts(installmentTotal, months + 1, down || null);
  return {
    units,
    installmentTotal,
    fullPrice,
    fullTotal,
    months,
    down: down ? parts[0] : 0,
    monthly: down ? parts[1] : parts[0],
    parts,
  };
}

/**
 * The chart row for a plan, as a panel: both ways to pay, the down payment,
 * the monthly amount and a ribbon showing every part of the schedule —
 * down payment, 1st installment, 2nd installment… No savings or discounts.
 */
export function PlanDetails({
  plan,
  tone = "dark",
  className,
  actions = true,
}: {
  plan: MembershipCardData;
  tone?: "dark" | "light";
  className?: string;
  actions?: boolean;
}) {
  const b = planBreakdown(plan);
  const dark = tone === "dark";
  const muted = dark ? "text-cream-200/60" : "text-forest-900/55";
  const strong = dark ? "text-cream-50" : "text-forest-900";
  const panel = dark ? "bg-cream-50/[0.06] ring-1 ring-cream-50/12" : "bg-cream-50 ring-1 ring-forest-600/10 shadow-lift";
  const sharesText = plan.maxUnits === null ? `${b.units}+ shares` : `${b.units} share${b.units > 1 ? "s" : ""}`;
  const perk = plan.slug === "royal" ? "100% Villa Ownership" : null;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className={cn("text-[0.6875rem] font-semibold uppercase tracking-[0.18em]", dark ? "text-gold-400" : "text-forest-600/70")}>
            {plan.name} membership · {sharesText}
          </p>
          <p className={cn("mt-1 font-display text-3xl", strong)}>
            {stayDays(plan.freeStayNights)} days free stay <span className={cn("text-lg", muted)}>/ year</span>
          </p>
        </div>
        {perk && (
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", dark ? "bg-gold-400 text-forest-950" : "bg-forest-600 text-cream-50")}>
            {perk}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {/* Installment */}
        <div className={cn("rounded-2xl p-5", panel)}>
          <p className={cn("text-xs font-medium", muted)}>Installment plan</p>
          <p className={cn("mt-1 font-numeral text-2xl", strong)}>{formatBDT(b.installmentTotal)}</p>
          <p className={cn("text-xs", muted)}>
            {formatBDT(plan.unitPriceBDT)} × {b.units} share{b.units > 1 ? "s" : ""}
          </p>
          <dl className="mt-4 space-y-1.5 text-[0.8125rem]">
            <div className="flex justify-between gap-3">
              <dt className={muted}>Down payment</dt>
              <dd className={cn("font-numeral", strong)}>{formatBDT(b.down)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={muted}>Monthly installments</dt>
              <dd className={cn("font-numeral", strong)}>
                {b.months} × {formatBDT(b.monthly)}
              </dd>
            </div>
          </dl>
        </div>

        {/* Full payment */}
        <div className={cn("rounded-2xl p-5", panel)}>
          <p className={cn("text-xs font-medium", muted)}>Full payment</p>
          <p className={cn("mt-1 font-numeral text-2xl", strong)}>{formatBDT(b.fullTotal)}</p>
          <p className={cn("text-xs", muted)}>
            {formatBDT(b.fullPrice)} × {b.units} share{b.units > 1 ? "s" : ""}
          </p>
          <dl className="mt-4 space-y-1.5 text-[0.8125rem]">
            <div className="flex justify-between gap-3">
              <dt className={muted}>Payments</dt>
              <dd className={strong}>One payment</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className={muted}>Installments</dt>
              <dd className={strong}>None</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Schedule ribbon: one segment per payment, sized by amount */}
      <div className="mt-5">
        <div className="flex justify-between text-[0.6875rem]">
          <span className={muted}>Installment schedule · {b.months + 1} parts</span>
          <span className={muted}>Down payment, then 1st – {ordinal(b.months)} installment monthly</span>
        </div>
        <div className="mt-2 flex h-3 gap-[2px] overflow-hidden rounded-full" role="img" aria-label={`Down payment of ${formatBDT(b.down)}, then ${b.months} monthly installments of ${formatBDT(b.monthly)}`}>
          {b.parts.map((amt, i) => (
            <span
              key={i}
              title={i === 0 ? `Down payment · ${formatBDT(amt)}` : `${ordinal(i)} installment · ${formatBDT(amt)}`}
              className={cn(i === 0 ? "bg-gold-400" : dark ? "bg-cream-50/35" : "bg-forest-600/45")}
              style={{ flexGrow: amt }}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {b.parts.slice(0, 4).map((amt, i) => (
            <span key={i} className={cn("rounded-full px-2.5 py-1 text-[0.6875rem]", dark ? "bg-cream-50/8 text-cream-100/80" : "bg-forest-600/7 text-forest-800/80")}>
              {i === 0 ? "Down payment" : `${ordinal(i)}`} · <span className="font-numeral">{formatBDT(amt)}</span>
            </span>
          ))}
          {b.parts.length > 4 && (
            <span className={cn("rounded-full px-2.5 py-1 text-[0.6875rem]", muted)}>
              … {ordinal(b.months)} installment
            </span>
          )}
        </div>
      </div>

      {actions && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={`/ownership?plan=${plan.slug}#calculator`}
            className={cn("inline-flex h-10 items-center rounded-full px-5 text-[0.8125rem] font-semibold transition-colors", dark ? "bg-gold-400 text-forest-950 hover:bg-gold-300" : "bg-forest-600 text-cream-50 hover:bg-forest-700")}
          >
            Calculate {plan.name}
          </Link>
          <Link
            href={`/apply?plan=${plan.slug}`}
            className={cn("inline-flex h-10 items-center rounded-full px-5 text-[0.8125rem] font-medium ring-1 transition-colors", dark ? "text-cream-50 ring-cream-50/30 hover:bg-cream-50/10" : "text-forest-700 ring-forest-600/20 hover:bg-forest-600/5")}
          >
            Apply for {plan.name}
          </Link>
        </div>
      )}
    </div>
  );
}
