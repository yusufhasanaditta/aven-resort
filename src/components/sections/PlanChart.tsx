import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { TierIcon } from "@/components/ui/TierIcon";
import { planBreakdown } from "@/components/sections/PlanDetails";
import { PRICE_CHART_VALID_UNTIL, SHARE_PRICE_BDT } from "@/data/ownership";
import { fallbackPlans } from "@/data/planFallback";
import { ordinal, stayDays } from "@/lib/shares";
import { cn } from "@/lib/utils";

/** The chart's own notation: ৳25,00,000 (South Asian digit grouping). */
function tk(n: number) {
  return `৳${n.toLocaleString("en-IN")}`;
}

/** "৳25 Lakh", "৳1.5 Crore" — for the big headline figure on each card. */
function words(n: number) {
  if (n >= 1_00_00_000) return `৳${Number((n / 1_00_00_000).toFixed(2))} Crore`;
  return `${tk(n / 1_00_000).replace(/,/g, "")} Lakh`;
}

/** Card colours per plan, matching the membership cards. */
const skins: Record<string, { band: string; ink: string; chip: string }> = {
  executive: { band: "from-[#2E5A3F] to-[#1d3d2a]", ink: "#D6E6BF", chip: "bg-[#2E5A3F]/10 text-[#2E5A3F]" },
  gold: { band: "from-[#B8895A] to-[#8a6238]", ink: "#F6E7A8", chip: "bg-[#A57A4B]/12 text-[#7d5a33]" },
  platinum: { band: "from-[#3a3a3a] to-[#1c1c1c]", ink: "#F5F5F5", chip: "bg-[#2B2B2B]/10 text-[#2B2B2B]" },
  diamond: { band: "from-[#B24744] to-[#7f2a28]", ink: "#F6E3B0", chip: "bg-[#A33D3A]/10 text-[#A33D3A]" },
  royal: { band: "from-[#2b2754] to-[#15132b]", ink: "#E8CF87", chip: "bg-[#1F1C3D]/10 text-[#1F1C3D]" },
};

/**
 * The ownership page's price section, from the Share Price & Membership
 * Chart: one card per plan (what you pay, how, and what you get), then the
 * chart itself as a table. One share is ৳5,00,000 on every plan.
 */
export function PlanChart() {
  const plans = fallbackPlans;

  return (
    <section id="compare" className="relative scroll-mt-16 overflow-hidden bg-cream-50 py-20 sm:py-28">
      <div className="bg-leaf-swirl pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <Container className="relative">
        {/* Header */}
        <div className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
          <Reveal>
            <p className="text-eyebrow text-forest-600/70">Share price &amp; membership chart</p>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              One share price. <span className="italic text-forest-600">Five ways to own.</span>
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Choose your package, pay the down payment, then the balance in equal monthly
              installments — or pay the whole amount at once. Bigger packages bring more free days
              in the hills every year.
            </p>
          </Reveal>
          <Reveal delay={0.08} className="lg:justify-self-end">
            <div className="relative overflow-hidden rounded-3xl bg-forest-950 px-8 py-7 text-cream-50 shadow-lift-lg">
              <div className="bg-leaf-swirl-light absolute inset-0 opacity-70" aria-hidden="true" />
              <p className="relative text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-400">Price per share</p>
              <p className="relative mt-2 font-numeral text-5xl">{tk(SHARE_PRICE_BDT)}</p>
              <p className="relative mt-2 text-xs text-cream-200/60">Same on every plan · valid until {PRICE_CHART_VALID_UNTIL}</p>
            </div>
          </Reveal>
        </div>

        {/* Plan cards */}
        <RevealGroup className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
          {plans.map((p) => {
            const b = planBreakdown(p);
            const skin = skins[p.slug] ?? skins.executive;
            const royal = p.slug === "royal";
            return (
              <RevealItem key={p.slug}>
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-forest-600/8 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-lift-lg",
                    royal && "ring-2 ring-gold-400/70",
                  )}
                >
                  {/* Band */}
                  <div className={cn("relative bg-gradient-to-br px-6 pb-6 pt-5", skin.band)} style={{ color: skin.ink }}>
                    <div className="flex items-start justify-between">
                      <TierIcon tierId={p.slug} color={skin.ink} size="sm" />
                      {p.featured && (
                        <span className="rounded-full bg-black/25 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                          Most chosen
                        </span>
                      )}
                      {royal && (
                        <span className="rounded-full bg-black/25 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.16em] backdrop-blur">
                          Villa ownership
                        </span>
                      )}
                    </div>
                    <p className="mt-4 font-display text-3xl uppercase leading-none tracking-[0.02em]">{p.name}</p>
                    <p className="mt-1 text-xs opacity-80">
                      {p.maxUnits === null ? `${b.units}+ shares` : `${b.units} share${b.units > 1 ? "s" : ""}`} · {stayDays(p.freeStayNights)} days free stay
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                    <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-forest-900/45">Package price</p>
                    <p className="mt-1 font-display text-[2rem] leading-none text-forest-900">{words(b.installmentTotal)}</p>
                    <p className="mt-1.5 font-numeral text-xs text-forest-900/55">
                      {tk(SHARE_PRICE_BDT)} × {b.units} = {tk(b.installmentTotal)}
                    </p>

                    {/* Installment plan */}
                    <div className="mt-5 rounded-2xl bg-cream-100/80 p-4">
                      <p className="text-xs font-semibold text-forest-900">Installment plan</p>
                      <dl className="mt-3 space-y-2 text-[0.8125rem]">
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="whitespace-nowrap text-forest-900/55">Down payment</dt>
                          <dd className="whitespace-nowrap font-numeral font-medium text-forest-900">{tk(b.down)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="whitespace-nowrap text-forest-900/55">{b.months} monthly</dt>
                          <dd className="whitespace-nowrap font-numeral font-medium text-forest-900">{tk(b.monthly)}</dd>
                        </div>
                      </dl>
                      <div className="mt-3 flex h-2 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
                        {b.parts.map((amt, i) => (
                          <span key={i} className={i === 0 ? "bg-gold-400" : "bg-forest-600/35"} style={{ flexGrow: amt }} />
                        ))}
                      </div>
                      <p className="mt-2 text-[0.6875rem] text-forest-900/45">
                        Down payment, then 1st – {ordinal(b.months)} installment
                      </p>
                    </div>

                    {/* Full payment */}
                    <div className="mt-3 flex items-center justify-between rounded-2xl border border-dashed border-forest-600/20 px-4 py-3 text-[0.8125rem]">
                      <span className="text-forest-900/60">Or pay in full</span>
                      <span className="font-numeral font-medium text-forest-900">{tk(b.fullTotal)}</span>
                    </div>

                    {royal && (
                      <p className={cn("mt-3 rounded-xl px-3 py-2 text-center text-xs font-semibold", skin.chip)}>
                        + 100% Villa Ownership
                      </p>
                    )}

                    <div className="mt-auto flex gap-2 pt-6">
                      <Link
                        href={`/apply?plan=${p.slug}`}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-forest-600 text-[0.8125rem] font-semibold text-cream-50 transition-colors hover:bg-forest-700"
                      >
                        Apply
                      </Link>
                      <Link
                        href={`/ownership?plan=${p.slug}#calculator`}
                        className="inline-flex h-10 flex-1 items-center justify-center rounded-full text-[0.8125rem] font-medium text-forest-700 ring-1 ring-forest-600/20 transition-colors hover:bg-forest-600/5"
                      >
                        Calculate
                      </Link>
                    </div>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* The chart, as printed */}
        <Reveal delay={0.05} className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-eyebrow text-forest-600/70">The full chart</p>
              <h3 className="mt-3 font-display text-3xl text-forest-900 sm:text-4xl">Share Price &amp; Membership Chart</h3>
            </div>
            <p className="text-xs text-forest-900/50">This chart is valid until {PRICE_CHART_VALID_UNTIL}</p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-lift ring-1 ring-forest-600/8">
            <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
              <caption className="sr-only">Share price and membership chart</caption>
              <thead>
                <tr className="bg-forest-900 text-cream-50">
                  {["S/L", "Membership", "Unit", "Price (BDT)", "Down payment", "Installment (monthly)", "Free stay (yearly)"].map((h, i) => (
                    <th key={h} scope="col" className={cn("px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.12em]", i === 6 && "text-right")}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plans.map((p, idx) => {
                  const b = planBreakdown(p);
                  const shade = idx % 2 ? "bg-cream-50" : "bg-white";
                  return [
                    <tr key={`${p.slug}-i`} className={cn(shade, "border-t border-forest-600/10")}>
                      <td rowSpan={2} className="px-5 py-4 align-top font-numeral font-semibold text-forest-900">{String(idx + 1).padStart(2, "0")}</td>
                      <th rowSpan={2} scope="rowgroup" className="px-5 py-4 align-top">
                        <span className="flex items-center gap-2.5">
                          <TierIcon tierId={p.slug} color={p.accentColor} size="sm" />
                          <span className="font-display text-lg text-forest-900">{p.name}</span>
                        </span>
                      </th>
                      <td rowSpan={2} className="px-5 py-4 align-top font-numeral text-forest-900">
                        {String(b.units).padStart(2, "0")}
                        {p.maxUnits === null && "+"}
                      </td>
                      <td className="px-5 py-4 font-numeral text-forest-900">
                        {SHARE_PRICE_BDT.toLocaleString("en-IN")} × {b.units} = <span className="font-semibold">{b.installmentTotal.toLocaleString("en-IN")}</span>
                      </td>
                      <td className="px-5 py-4 font-numeral text-forest-900">{b.down.toLocaleString("en-IN")}</td>
                      <td className="px-5 py-4 text-forest-900">
                        <span className="font-numeral font-semibold">{b.months}</span>
                        <span className="ml-1.5 font-numeral text-xs text-forest-900/50">× {b.monthly.toLocaleString("en-IN")}</span>
                      </td>
                      <td rowSpan={2} className="px-5 py-4 text-right align-top">
                        <span className="font-numeral text-forest-900">{stayDays(p.freeStayNights)} Days</span>
                        {p.slug === "royal" && <span className="mt-1 block text-xs font-semibold text-forest-700">100% Villa Ownership</span>}
                      </td>
                    </tr>,
                    <tr key={`${p.slug}-f`} className={shade}>
                      <td className="px-5 pb-4 font-numeral text-forest-900/70">
                        {SHARE_PRICE_BDT.toLocaleString("en-IN")} × {b.units} = {b.fullTotal.toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 pb-4 text-forest-900/70">Full payment</td>
                      <td className="px-5 pb-4 font-numeral text-forest-900/70">0</td>
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-forest-900/45">
            Installments are due on the 1st of each month after the down payment; any rounding is settled in the last installment. A share count
            between packages uses the same ৳5,00,000 per share, with the down payment prorated per share.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
