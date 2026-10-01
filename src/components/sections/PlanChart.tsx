import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { TierIcon } from "@/components/ui/TierIcon";
import { Depth, TiltCard } from "@/components/ui/TiltCard";
import { planBreakdown } from "@/components/sections/PlanDetails";
import { PriceMedallion } from "@/components/sections/PriceMedallion";
import type { FallbackPlan } from "@/data/planFallback";
import { bnDigits, type Lang } from "@/lib/i18n";
import { ordinal, stayDays } from "@/lib/shares";
import { cn } from "@/lib/utils";

/** The chart's own notation, 25,00,000 (South Asian grouping), in the reader's digits. */
function grouped(n: number, lang: Lang) {
  const s = n.toLocaleString("en-IN");
  return lang === "bn" ? bnDigits(s) : s;
}
const tk = (n: number, lang: Lang) => `৳${grouped(n, lang)}`;

/** "৳25 Lakh", "৳1.5 Crore" — the big headline figure on each card. */
function words(n: number, lang: Lang) {
  const crore = n >= 1_00_00_000;
  const v = String(Number((n / (crore ? 1_00_00_000 : 1_00_000)).toFixed(2)));
  if (lang === "bn") return `৳${bnDigits(v)} ${crore ? "কোটি" : "লক্ষ"}`;
  return `৳${v} ${crore ? "Crore" : "Lakh"}`;
}

const bnPlan: Record<string, string> = { executive: "এক্সিকিউটিভ", gold: "গোল্ড", platinum: "প্লাটিনাম", diamond: "ডায়মন্ড", royal: "রয়্যাল" };

const copy = {
  en: {
    eyebrow: "Share price & membership chart",
    title: "One share price.",
    titleAccent: "Five ways to own.",
    lede: "Choose your package, pay the down payment, then the balance in equal monthly installments — or pay the whole amount at once. Each step up the ladder brings more free days in the hills every year.",
    medalLabel: "Price per share",
    medalNote: "The same on every plan · valid until 30 September 2026",
    shares: (n: number, plus: boolean) => `${n}${plus ? "+" : ""} share${n > 1 || plus ? "s" : ""}`,
    stay: (d: number) => `${d} days free stay`,
    mostChosen: "Most chosen",
    villa: "Villa ownership",
    packagePrice: "Package price",
    installmentPlan: "Installment plan",
    down: "Down payment",
    monthly: (m: number) => `${m} monthly`,
    ribbon: (m: number) => `Down payment, then 1st – ${ordinal(m)} installment`,
    payFull: "Or pay in full",
    villaPerk: "+ 100% Villa Ownership",
    apply: "Apply",
    calculate: "Calculate",
    chartEyebrow: "The full chart",
    chartTitle: "Share Price & Membership Chart",
    validUntil: "This chart is valid until 30 September 2026",
    heads: ["S/L", "Membership", "Unit", "Price (BDT)", "Down payment", "Installment (monthly)", "Free stay (yearly)"],
    fullPayment: "Full payment",
    days: (d: number) => `${d} Days`,
    villaOwnership: "100% Villa Ownership",
    footnote: "Installments are due on the 1st of each month after the down payment; any rounding is settled in the last installment. A share count between packages uses the same ৳5,00,000 per share, with the down payment prorated per share.",
  },
  bn: {
    eyebrow: "শেয়ার মূল্য ও মেম্বারশিপ চার্ট",
    title: "এক শেয়ার মূল্য।",
    titleAccent: "মালিকানার পাঁচটি পথ।",
    lede: "আপনার প্যাকেজ বেছে নিন, ডাউন পেমেন্ট দিন, তারপর বাকি টাকা সমান মাসিক কিস্তিতে — অথবা পুরো টাকা একবারে পরিশোধ করুন। প্রতিটি ধাপে বাড়ে পাহাড়ে প্রতি বছরের ফ্রি অবকাশ।",
    medalLabel: "প্রতি শেয়ার মূল্য",
    medalNote: "সব প্ল্যানে একই · ৩০ সেপ্টেম্বর ২০২৬ পর্যন্ত প্রযোজ্য",
    shares: (n: number, plus: boolean) => `${bnDigits(n)}${plus ? "+" : ""}টি শেয়ার`,
    stay: (d: number) => `বছরে ${bnDigits(d)} দিন ফ্রি অবকাশ`,
    mostChosen: "সর্বাধিক পছন্দের",
    villa: "ভিলা মালিকানা",
    packagePrice: "প্যাকেজ মূল্য",
    installmentPlan: "কিস্তি পরিকল্পনা",
    down: "ডাউন পেমেন্ট",
    monthly: (m: number) => `${bnDigits(m)}টি মাসিক কিস্তি`,
    ribbon: (m: number) => `ডাউন পেমেন্ট, তারপর ১ম – ${bnDigits(m)}তম কিস্তি`,
    payFull: "অথবা এককালীন পরিশোধ",
    villaPerk: "+ ১০০% ভিলা মালিকানা",
    apply: "আবেদন করুন",
    calculate: "হিসাব করুন",
    chartEyebrow: "পূর্ণাঙ্গ চার্ট",
    chartTitle: "শেয়ার মূল্য ও মেম্বারশিপ চার্ট",
    validUntil: "এই চার্ট ৩০ সেপ্টেম্বর ২০২৬ পর্যন্ত প্রযোজ্য",
    heads: ["ক্রমিক", "মেম্বারশিপ", "ইউনিট", "মূল্য (টাকা)", "ডাউন পেমেন্ট", "কিস্তি (মাসিক)", "ফ্রি অবকাশ (বাৎসরিক)"],
    fullPayment: "এককালীন পরিশোধ",
    days: (d: number) => `${bnDigits(d)} দিন`,
    villaOwnership: "১০০% ভিলা মালিকানা",
    footnote: "ডাউন পেমেন্টের পর প্রতি মাসের ১ তারিখে কিস্তি পরিশোধযোগ্য; ভগ্নাংশের সমন্বয় শেষ কিস্তিতে হবে। প্যাকেজের মাঝামাঝি শেয়ার সংখ্যাতেও প্রতি শেয়ার ৫,০০,০০০ টাকা, এবং ডাউন পেমেন্ট শেয়ার অনুপাতে নির্ধারিত হবে।",
  },
};

/** Card colours per plan, matching the membership cards. */
const skins: Record<string, { band: string; ink: string; chip: string; glow: string }> = {
  executive: { band: "from-[#3a7050] via-[#2E5A3F] to-[#17331f]", ink: "#D6E6BF", chip: "bg-[#2E5A3F]/10 text-[#2E5A3F]", glow: "rgba(46,90,63,0.45)" },
  gold: { band: "from-[#d0a06a] via-[#A57A4B] to-[#6f4c27]", ink: "#FBEFC0", chip: "bg-[#A57A4B]/12 text-[#7d5a33]", glow: "rgba(165,122,75,0.5)" },
  platinum: { band: "from-[#5a5a5a] via-[#2B2B2B] to-[#0f0f0f]", ink: "#F5F5F5", chip: "bg-[#2B2B2B]/10 text-[#2B2B2B]", glow: "rgba(43,43,43,0.45)" },
  diamond: { band: "from-[#cf5a55] via-[#A33D3A] to-[#6a2220]", ink: "#F6E3B0", chip: "bg-[#A33D3A]/10 text-[#A33D3A]", glow: "rgba(163,61,58,0.45)" },
  royal: { band: "from-[#3b3674] via-[#1F1C3D] to-[#0d0b1f]", ink: "#E8CF87", chip: "bg-[#1F1C3D]/10 text-[#1F1C3D]", glow: "rgba(31,28,61,0.55)" },
};

/** Each plan stands a step higher than the last — the membership ladder, drawn. */
const steps = ["xl:mt-24", "xl:mt-[4.5rem]", "xl:mt-12", "xl:mt-6", "xl:mt-0"];

/**
 * The ownership page's price section, from the Share Price & Membership
 * Chart: a 3D price medallion, one tilting card per plan set on a rising
 * ladder, then the chart itself as a table. One share is ৳5,00,000 on
 * every plan. Hand-written in both languages, so it opts out of the
 * automatic translator.
 */
export function PlanChart({ plans, lang = "en" }: { plans: FallbackPlan[]; lang?: Lang }) {
  // Prices come from admin → Packages; the medallion shows the lowest per-share price.
  const sharePrice = Math.min(...plans.map((p) => p.unitPriceBDT));
  const t = copy[lang];
  const bn = lang === "bn";
  const name = (slug: string, en: string) => (bn ? bnPlan[slug] ?? en : en);

  return (
    <section id="compare" translate="no" className={cn("relative scroll-mt-16 overflow-hidden bg-cream-50 py-20 sm:py-28", bn && "font-bangla")}>
      <div className="bg-leaf-swirl pointer-events-none absolute inset-0 opacity-50" aria-hidden="true" />
      {/* A perspective floor the cards stand on */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[34rem] h-[46rem] [perspective:1100px]">
        <div className="absolute inset-x-[-20%] top-0 h-full origin-top bg-[linear-gradient(rgba(14,77,56,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(14,77,56,0.09)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_60%,transparent)] [transform:rotateX(64deg)]" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-40 h-80 w-80 rounded-full bg-gold-300/20 blur-[90px]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-[28rem] h-96 w-96 rounded-full bg-forest-500/15 blur-[100px]" />

      <Container className="relative">
        {/* Header */}
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
          <Reveal>
            <p className={cn(bn ? "text-sm font-medium" : "text-eyebrow", "text-forest-600/70")}>{t.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", bn ? "text-4xl font-semibold leading-snug sm:text-5xl" : "font-display text-display-md")}>
              {t.title} <span className={cn("text-forest-600", !bn && "italic")}>{t.titleAccent}</span>
            </h2>
            <p className="mt-5 max-w-xl text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">{t.lede}</p>
            <div className="mt-7 flex flex-wrap gap-2">
              {plans.map((p) => (
                <a
                  key={p.slug}
                  href={`#plan-${p.slug}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-forest-800 shadow-lift ring-1 ring-forest-600/8 transition-transform hover:-translate-y-0.5"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: p.accentColor }} />
                  {name(p.slug, p.name)}
                </a>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <PriceMedallion price={tk(sharePrice, lang)} label={t.medalLabel} note={t.medalNote} />
          </Reveal>
        </div>

        {/* Plan cards on a rising ladder */}
        <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 xl:grid-cols-5 xl:items-start xl:gap-5">
          {plans.map((p, i) => {
            const b = planBreakdown(p);
            const skin = skins[p.slug] ?? skins.executive;
            const royal = p.slug === "royal";
            return (
              <RevealItem key={p.slug} id={`plan-${p.slug}`} className={cn("scroll-mt-28", steps[i])}>
                <TiltCard intensity={7} innerClassName="group rounded-[1.75rem]">
                  <article
                    className={cn(
                      "preserve-3d relative flex flex-col rounded-[1.75rem] bg-white ring-1 ring-forest-600/8 transition-shadow duration-500",
                      royal && "ring-2 ring-gold-400/70",
                    )}
                    style={{ boxShadow: `0 30px 60px -28px ${skin.glow}, 0 12px 24px -16px rgba(4,30,22,0.25)` }}
                  >
                    {/* Band */}
                    <div className={cn("preserve-3d relative rounded-t-[1.75rem] bg-gradient-to-br px-6 pb-7 pt-5", skin.band)} style={{ color: skin.ink }}>
                      <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-t-[1.75rem]">
                        <span className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />
                        <span className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-black/10" />
                      </span>
                      <Depth z={30} className="relative">
                        <div className="flex items-start justify-between">
                          <TierIcon tierId={p.slug} color={skin.ink} size="sm" />
                          {(p.featured || royal) && (
                            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[0.5625rem] font-semibold uppercase tracking-[0.14em] backdrop-blur">
                              {royal ? t.villa : t.mostChosen}
                            </span>
                          )}
                        </div>
                        <p className={cn("mt-4 leading-none", bn ? "text-3xl font-semibold" : "font-display text-3xl uppercase tracking-[0.02em]")}>{name(p.slug, p.name)}</p>
                        <p className="mt-1.5 text-xs opacity-85">
                          {t.shares(b.units, p.maxUnits === null)} · {t.stay(stayDays(p.freeStayNights))}
                        </p>
                      </Depth>
                    </div>

                    {/* Price */}
                    <Depth z={18} className="flex flex-1 flex-col px-6 pb-6 pt-5">
                      <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-forest-900/45">{t.packagePrice}</p>
                      <p className={cn("mt-1 leading-none text-forest-900", bn ? "text-[1.8rem] font-semibold" : "font-display text-[2rem]")}>{words(b.installmentTotal, lang)}</p>
                      <p className="mt-1.5 font-numeral text-xs text-forest-900/55">
                        {tk(p.unitPriceBDT, lang)} × {grouped(b.units, lang)} = {tk(b.installmentTotal, lang)}
                      </p>

                      <div className="mt-5 rounded-2xl bg-cream-100/80 p-4 ring-1 ring-forest-600/5">
                        <p className="text-xs font-semibold text-forest-900">{t.installmentPlan}</p>
                        <dl className="mt-3 space-y-2 text-[0.8125rem]">
                          <div className="flex items-baseline justify-between gap-2">
                            <dt className="whitespace-nowrap text-forest-900/55">{t.down}</dt>
                            <dd className="whitespace-nowrap font-numeral font-medium text-forest-900">{tk(b.down, lang)}</dd>
                          </div>
                          <div className="flex items-baseline justify-between gap-2">
                            <dt className="whitespace-nowrap text-forest-900/55">{t.monthly(b.months)}</dt>
                            <dd className="whitespace-nowrap font-numeral font-medium text-forest-900">{tk(b.monthly, lang)}</dd>
                          </div>
                        </dl>
                        <div className="mt-3 flex h-2 gap-[2px] overflow-hidden rounded-full" aria-hidden="true">
                          {b.parts.map((amt, k) => (
                            <span key={k} className={k === 0 ? "bg-gold-400" : "bg-forest-600/35"} style={{ flexGrow: amt }} />
                          ))}
                        </div>
                        <p className="mt-2 text-[0.6875rem] text-forest-900/45">{t.ribbon(b.months)}</p>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 rounded-2xl border border-dashed border-forest-600/20 px-4 py-3 text-[0.8125rem]">
                        <span className="whitespace-nowrap text-forest-900/60">{t.payFull}</span>
                        <span className="whitespace-nowrap font-numeral font-medium text-forest-900">{tk(b.fullTotal, lang)}</span>
                      </div>

                      {royal && <p className={cn("mt-3 rounded-xl px-3 py-2 text-center text-xs font-semibold", skin.chip)}>{t.villaPerk}</p>}

                      <div className="mt-6 flex gap-2">
                        <Link
                          href={`/apply?plan=${p.slug}`}
                          className="inline-flex h-10 flex-1 items-center justify-center rounded-full bg-forest-600 text-[0.8125rem] font-semibold text-cream-50 transition-colors hover:bg-forest-700"
                        >
                          {t.apply}
                        </Link>
                        <Link
                          href={`/ownership?plan=${p.slug}#calculator`}
                          className="inline-flex h-10 flex-1 items-center justify-center rounded-full text-[0.8125rem] font-medium text-forest-700 ring-1 ring-forest-600/20 transition-colors hover:bg-forest-600/5"
                        >
                          {t.calculate}
                        </Link>
                      </div>
                    </Depth>
                  </article>
                </TiltCard>
                {/* Ground shadow under each card */}
                <span aria-hidden="true" className="mx-auto mt-4 hidden h-4 w-3/4 rounded-[50%] blur-md xl:block" style={{ background: skin.glow }} />
              </RevealItem>
            );
          })}
        </RevealGroup>

        {/* The chart, as printed */}
        <Reveal delay={0.05} className="mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className={cn(bn ? "text-sm font-medium" : "text-eyebrow", "text-forest-600/70")}>{t.chartEyebrow}</p>
              <h3 className={cn("mt-3 text-3xl text-forest-900 sm:text-4xl", bn ? "font-semibold" : "font-display")}>{t.chartTitle}</h3>
            </div>
            <p className="text-xs text-forest-900/50">{t.validUntil}</p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl bg-white shadow-lift-lg ring-1 ring-forest-600/8">
            <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
              <caption className="sr-only">{t.chartTitle}</caption>
              <thead>
                <tr className="bg-gradient-to-r from-forest-900 to-forest-700 text-cream-50">
                  {t.heads.map((h, k) => (
                    <th key={h} scope="col" className={cn("px-5 py-4 text-[0.6875rem] font-semibold tracking-[0.1em]", !bn && "uppercase", k === 6 && "text-right")}>
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
                      <td rowSpan={2} className="px-5 py-4 align-top font-numeral font-semibold text-forest-900">{grouped(idx + 1, lang).padStart(2, bn ? "০" : "0")}</td>
                      <th rowSpan={2} scope="rowgroup" className="px-5 py-4 align-top">
                        <span className="flex items-center gap-2.5">
                          <TierIcon tierId={p.slug} color={p.accentColor} size="sm" />
                          <span className={cn("text-lg text-forest-900", bn ? "font-semibold" : "font-display")}>{name(p.slug, p.name)}</span>
                        </span>
                      </th>
                      <td rowSpan={2} className="px-5 py-4 align-top font-numeral text-forest-900">
                        {grouped(b.units, lang).padStart(2, bn ? "০" : "0")}
                        {p.maxUnits === null && "+"}
                      </td>
                      <td className="px-5 py-4 font-numeral text-forest-900">
                        {grouped(p.unitPriceBDT, lang)} × {grouped(b.units, lang)} = <span className="font-semibold">{grouped(b.installmentTotal, lang)}</span>
                      </td>
                      <td className="px-5 py-4 font-numeral text-forest-900">{grouped(b.down, lang)}</td>
                      <td className="px-5 py-4 text-forest-900">
                        <span className="font-numeral font-semibold">{grouped(b.months, lang)}</span>
                        <span className="ml-1.5 font-numeral text-xs text-forest-900/50">× {grouped(b.monthly, lang)}</span>
                      </td>
                      <td rowSpan={2} className="px-5 py-4 text-right align-top">
                        <span className="font-numeral text-forest-900">{t.days(stayDays(p.freeStayNights))}</span>
                        {p.slug === "royal" && <span className="mt-1 block text-xs font-semibold text-forest-700">{t.villaOwnership}</span>}
                      </td>
                    </tr>,
                    <tr key={`${p.slug}-f`} className={shade}>
                      <td className="px-5 pb-4 font-numeral text-forest-900/70">
                        {grouped(b.fullPrice, lang)} × {grouped(b.units, lang)} = {grouped(b.fullTotal, lang)}
                      </td>
                      <td className="px-5 pb-4 text-forest-900/70">{t.fullPayment}</td>
                      <td className="px-5 pb-4 font-numeral text-forest-900/70">{grouped(0, lang)}</td>
                    </tr>,
                  ];
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-forest-900/45">{t.footnote}</p>
        </Reveal>
      </Container>
    </section>
  );
}
