import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/sections/Hero";
import { MembershipCarousel } from "@/components/sections/MembershipCarousel";
import { OwnershipTeaser } from "@/components/sections/OwnershipTeaser";
import { ShareCalculator } from "@/components/sections/ShareCalculator";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { TierIcon } from "@/components/ui/TierIcon";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { PRICE_CHART_VALID_UNTIL, businessModel, ownershipTiers, shareOwnership } from "@/data/ownership";
import { formatBDT } from "@/lib/shares";
import { projectFacts } from "@/data/site";
import { about } from "@/data/about";
import { getAsset, getContent } from "@/lib/cms";
import { InterestForm } from "@/components/sections/InterestForm";

export const metadata: Metadata = {
  title: "Ownership & Membership",
  description:
    "Five membership plans — Executive, Gold, Platinum, Diamond and Royal — of fractional share ownership in Aven Eco Luxury Resort & Wellness, with Saf-Kabla registered land, annual halal profits, free stays, installment plans and an interactive share calculator.",
};

/** "৳2.8 Lac" — the chart's own notation. */
function lac(amount: number) {
  return `৳${Number((amount / 100_000).toFixed(2))} Lac`;
}

function unitsLabel(min: number, max: number | null) {
  if (max === null) return `${min} & above`;
  return min === max ? `${min}` : `${min} – ${max}`;
}

export default async function OwnershipPage() {
  const [heroImage, benefits] = await Promise.all([
    getAsset("ownership.hero", "/renders/eco-villa-sunrise.jpg"),
    getContent("benefits"),
  ]);

  return (
    <>
      <Hero
        eyebrow="Ownership & membership"
        title="Own a Piece"
        titleAccent="of the Hills"
        lede="Fractional ownership of the entire hotel and resort, backed by Saf-Kabla registered land — five membership plans from Executive to Royal, and a calculator that shows exactly what you'd pay."
        image={heroImage}
        imageAlt="An eco-luxury villa with infinity pool at sunrise, surrounded by tea hills"
        height="tall"
        facts={[
          { value: String(ownershipTiers.length), label: "Membership plans" },
          { value: projectFacts.totalShares.toLocaleString("en-US"), label: "Unit shares issued" },
          { value: lac(Math.min(...ownershipTiers.map((t) => t.fullPriceBDT))), label: "From, per share" },
          { value: "Halal", label: "Lifetime income" },
        ]}
        actions={[
          { label: "Calculate my share", href: "#calculator" },
          { label: "Register interest", href: "#interest", variant: "outline-light" },
        ]}
      />

      <MembershipCarousel />

      <Section tone="cream" id="calculator" className="scroll-mt-16">
        <Suspense fallback={<Container><p className="text-sm text-forest-900/50">Loading calculator…</p></Container>}>
          <ShareCalculator />
        </Suspense>
      </Section>

      {/* Plan comparison */}
      <Section tone="white" id="compare" className="scroll-mt-16">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>Share price &amp; membership chart</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Pay by installment, or pay in full.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Every plan has two prices per share. An installment plan starts with
              a down payment, followed by equal monthly installments — 1st, 2nd,
              3rd and on to the last. Paying in full is a single payment at the
              full-payment price.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 overflow-x-auto rounded-2xl border border-forest-600/10 bg-cream-50">
              <table className="w-full min-w-[58rem] border-collapse text-left">
                <caption className="sr-only">Share price and membership chart</caption>
                <thead>
                  <tr className="border-b border-forest-600/15 bg-forest-600/[0.04]">
                    {["Plan", "Package", "Installment plan", "Full payment", "Free stay / year"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-5 py-4 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45"
                      >
                        {h}
                      </th>
                    ))}
                    <th scope="col" className="px-5 py-4">
                      <span className="sr-only">Calculate</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ownershipTiers.map((tier) => {
                    const n = tier.minUnits;
                    const instTotal = tier.installmentPriceBDT * n;
                    const fullTotal = tier.fullPriceBDT * n;
                    return (
                      <tr key={tier.id} className="border-b border-forest-600/8 align-top transition-colors last:border-0 hover:bg-forest-600/4">
                        <th scope="row" className="px-5 py-5">
                          <span className="flex items-center gap-3">
                            <TierIcon tierId={tier.id} color={tier.accent} size="sm" />
                            <span>
                              <span className="block font-display text-xl text-forest-900">{tier.name}</span>
                              <span className="block text-[0.6875rem] font-normal text-forest-900/45">
                                {unitsLabel(tier.minUnits, tier.maxUnits)} shares
                              </span>
                            </span>
                          </span>
                        </th>
                        <td className="px-5 py-5 font-numeral text-sm text-forest-900/75">
                          {n} share{n > 1 ? "s" : ""}
                        </td>
                        <td className="px-5 py-5 text-sm text-forest-900/75">
                          <span className="block font-numeral text-forest-900">
                            {formatBDT(tier.installmentPriceBDT)} × {n} = {formatBDT(instTotal)}
                          </span>
                          <span className="mt-1 block text-xs text-forest-900/55">
                            {formatBDT(tier.downPaymentBDT)} down · {tier.installmentCount} monthly
                          </span>
                        </td>
                        <td className="px-5 py-5 text-sm text-forest-900/75">
                          <span className="block font-numeral text-forest-900">
                            {formatBDT(tier.fullPriceBDT)} × {n} = {formatBDT(fullTotal)}
                          </span>
                          <span className="mt-1 block text-xs text-forest-900/55">One payment</span>
                        </td>
                        <td className="px-5 py-5 font-numeral text-sm text-forest-900/75">
                          {tier.freeStayDays} days
                          {tier.perk && <span className="mt-1 block font-sans text-xs font-semibold text-forest-700">{tier.perk}</span>}
                        </td>
                        <td className="px-5 py-5 text-right">
                          <Button href={`/ownership?plan=${tier.id}#calculator`} variant="secondary" size="sm">
                            Calculate
                            <ArrowRight />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-xs leading-relaxed text-forest-900/45">
              This chart is valid until {PRICE_CHART_VALID_UNTIL}. A share count
              between packages uses that plan&rsquo;s per-share price, with the down
              payment prorated per share.
            </p>
          </Reveal>
        </Container>
      </Section>

      <OwnershipTeaser benefits={benefits} />

      {/* Lead capture — lands in the admin CRM */}
      <Section tone="cream" id="interest" className="scroll-mt-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Register your interest</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                Tell us what you&rsquo;re looking for.
                <span className="italic text-forest-600"> We&rsquo;ll call you.</span>
              </h2>
              <p className="mt-5 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                Share your preferred package and budget. A member of the Aven team
                will walk you through pricing, installments and a site visit — no
                obligation.
              </p>
              <ul className="mt-8 space-y-3 text-sm text-forest-900/70">
                {["A personal call within one working day", "Current pricing and share availability", "Site-visit booking in Sreemangal", "Help with the application and documents"].map((t) => (
                  <li key={t} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-600/10 text-xs text-forest-700">✓</span>
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 rounded-2xl border border-forest-600/12 bg-cream-50 p-5">
                <p className="text-sm font-semibold text-forest-900">Ready to apply now?</p>
                <p className="mt-1 text-xs text-forest-900/55">Submit a formal share-purchase application with your NID and nominee details.</p>
                <div className="mt-4">
                  <Button href="/apply" size="sm">
                    Start an application
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <InterestForm />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* The brochure's Bengali fact sheet, set bilingually */}
      <Section tone="cream" className="bg-leaf-swirl">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>At a glance · এক নজরে</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              The land and the shares.
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 md:grid-cols-[1.4fr_1fr]">
            {[
              { bn: "জমির পরিমাণ", en: "Land", value: `${projectFacts.landAcres} Acres · ${projectFacts.landBigha} Bigha`, sub: `${projectFacts.landSqft} sq ft`, bnValue: "৫ একর · ১৫.১৫ বিঘা" },
              { bn: "শেয়ার পরিমাণ", en: "Shares", value: projectFacts.totalShares.toLocaleString("en-US"), sub: "Unit shares in total", bnValue: "২৭০০" },
            ].map((f) => (
              <RevealItem key={f.en}>
                <div className="h-full rounded-2xl border border-forest-600/10 bg-cream-50/80 p-6 backdrop-blur-sm">
                  <p className="font-bangla text-sm text-forest-900/55">{f.bn}</p>
                  <p className="mt-3 inline-block whitespace-nowrap rounded-xl bg-[#E9E3C4] px-3.5 py-1.5 font-bangla text-2xl font-medium text-forest-700">
                    {f.bnValue}
                  </p>
                  <p className="mt-4 whitespace-nowrap font-numeral text-2xl text-forest-900">{f.value}</p>
                  <p className="mt-0.5 text-xs text-forest-900/50">
                    {f.en} · {f.sub}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <div className="mt-12 grid gap-10 lg:grid-cols-2">
            <Reveal>
              <h3 className="font-bangla text-2xl font-medium text-forest-900">শেয়ার মালিকানা</h3>
              <p className="text-sm text-forest-900/50">Share ownership</p>
              <ul className="mt-5 space-y-3">
                {shareOwnership.map((item) => (
                  <li key={item.en} className="flex items-start gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-sm bg-forest-600" />
                    <span>
                      <span className="block font-bangla text-[1.0625rem] text-forest-900">{item.bn}</span>
                      <span className="block text-xs text-forest-900/50">{item.en}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.08}>
              <h3 className="font-bangla text-2xl font-medium text-forest-900">ব্যবসায়িক মডেল</h3>
              <p className="text-sm text-forest-900/50">Business model — where the profits come from</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {businessModel.map((item) => (
                  <li
                    key={item.en}
                    className="flex items-center gap-3 rounded-xl border border-forest-600/10 bg-cream-50/80 p-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#B3A272] text-white">
                      <AmenityIcon icon={item.icon} className="h-7 w-7" />
                    </span>
                    <span>
                      <span className="block font-bangla text-[0.9375rem] text-forest-900">{item.bn}</span>
                      <span className="block text-xs text-forest-900/50">{item.en}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Stage disclosure */}
      <Section tone="white" className="py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl rounded-2xl border border-forest-600/12 bg-cream-100 p-8 sm:p-10">
            <Eyebrow>Project stage</Eyebrow>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/70">
              {about.timelineNote}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/register" size="lg">
                Open a shareholder account
                <ArrowRight />
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Request the investment pack
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
