import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { OwnershipTeaser } from "@/components/sections/OwnershipTeaser";
import { ShareCalculator } from "@/components/sections/ShareCalculator";
import { LandUsage } from "@/components/sections/LandUsage";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { Num } from "@/components/ui/Number";
import {
  demandDrivers,
  investmentCase,
  ownershipTiers,
} from "@/data/ownership";
import { about } from "@/data/about";

export const metadata: Metadata = {
  title: "Ownership & Investment",
  description:
    "Four categories of fractional ownership in Aven Tea Empire — Saf-Kabla registered land title, direct ownership in the hotel establishment, annual dividends and flexible resale.",
};

export default function OwnershipPage() {
  return (
    <>
      <Hero
        eyebrow="Investment opportunity"
        title="Own a Share of"
        titleAccent="the Whole Establishment"
        lede="Aven Tea Empire is structured for fractional ownership and unit sales — high-yield hospitality returns, capital appreciation and lifestyle privileges, backed by registered land title."
        image="/renders/eco-villa-sunrise.jpg"
        imageAlt="An eco-luxury villa with infinity pool at sunrise, surrounded by tea hills"
        height="tall"
        facts={[
          { value: "4", label: "Ownership categories" },
          { value: "Saf-Kabla", label: "Registered title" },
          { value: "40–50%", label: "Year-round discount" },
          { value: "Halal", label: "Lifetime income" },
        ]}
        actions={[{ label: "Request details", href: "/contact" }]}
      />

      <OwnershipTeaser />

      <Section tone="cream" id="calculator">
        <Suspense fallback={<Container><p className="text-sm text-forest-900/50">Loading calculator…</p></Container>}>
          <ShareCalculator />
        </Suspense>
      </Section>

      {/* Category comparison table */}
      <Section tone="white">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>Compare categories</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Category is set by the number of shares held.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Stay allowance and accommodation discount both scale with the size
              of the holding. Unit share pricing is confirmed directly with the
              AVEN team.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <caption className="sr-only">
                  Comparison of the four ownership categories
                </caption>
                <thead>
                  <tr className="border-b border-forest-600/15">
                    <th
                      scope="col"
                      className="pb-4 pr-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45"
                    >
                      Category
                    </th>
                    <th
                      scope="col"
                      className="pb-4 pr-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45"
                    >
                      Unit share
                    </th>
                    <th
                      scope="col"
                      className="pb-4 pr-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45"
                    >
                      Free stay
                    </th>
                    <th
                      scope="col"
                      className="pb-4 pr-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45"
                    >
                      Discount
                    </th>
                    <th scope="col" className="pb-4">
                      <span className="sr-only">Enquire</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ownershipTiers.map((tier) => (
                    <tr
                      key={tier.id}
                      className="border-b border-forest-600/8 transition-colors hover:bg-forest-600/4"
                    >
                      <th scope="row" className="py-5 pr-6">
                        <span className="flex items-center gap-2.5">
                          <span
                            className="h-6 w-1 rounded-full"
                            style={{ background: tier.accent }}
                          />
                          <span>
                            <span className="block font-display text-xl text-forest-900">
                              {tier.name}
                            </span>
                            <span className="block text-[0.6875rem] font-normal text-forest-900/45">
                              {tier.subtitle}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td className="py-5 pr-6 text-sm text-forest-900/75">
                        {tier.unitShare}
                      </td>
                      <td className="py-5 pr-6 text-sm text-forest-900/75">
                        {tier.freeStay}
                      </td>
                      <td className="py-5 pr-6 text-sm font-semibold text-forest-700">
                        {tier.discount}
                      </td>
                      <td className="py-5 text-right">
                        <Button href="/contact" variant="secondary" size="sm">
                          Contact
                          <ArrowRight />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-6 text-xs leading-relaxed text-forest-900/45">
              Free stay is stated per the project masterplan document as a yearly
              allowance of two days per unit, scaling by category. Accommodation
              discount of 40% to 50% applies across the year in addition to the
              category discount shown.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Why invest now */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <Eyebrow>Why invest now</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                {investmentCase.headline}
              </h2>
              <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                {investmentCase.body}
              </p>

              <div className="relative mt-10 aspect-16/10 overflow-hidden rounded-2xl shadow-lift-lg">
                <Image
                  src="/renders/location-map.jpg"
                  alt="Satellite map of the Sreemangal area showing the project's setting among the tea gardens"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent p-5">
                  <p className="text-[0.8125rem] font-medium text-cream-50">
                    Competitive landscape, Srimangal
                  </p>
                  <p className="mt-0.5 text-xs text-cream-200/65">
                    Existing resorts cluster the valley — none positioned as
                    5-star eco-luxury
                  </p>
                </div>
              </div>
            </Reveal>

            <div className="lg:pt-12">
              <RevealGroup className="space-y-8">
                {investmentCase.reasons.map((r, i) => (
                  <RevealItem key={r.title}>
                    <div className="flex gap-5 border-b border-forest-600/10 pb-8">
                      <Num
                        as="span"
                        size="lg"
                        className="leading-none text-forest-600/30"
                      >
                        0{i + 1}
                      </Num>
                      <div>
                        <h3 className="font-display text-2xl text-forest-900">
                          {r.title}
                        </h3>
                        <p className="mt-2 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                          {r.detail}
                        </p>
                      </div>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>

              <Reveal delay={0.1}>
                <h3 className="mt-10 text-sm font-semibold text-forest-900">
                  Demand drivers
                </h3>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {demandDrivers.map((d) => (
                    <li
                      key={d.label}
                      className="rounded-xl border border-forest-600/10 bg-cream-50 p-4"
                    >
                      <p className="text-[0.8125rem] font-semibold text-forest-800">
                        {d.label}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-forest-900/55">
                        {d.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <LandUsage />

      {/* Stage disclosure */}
      <Section tone="white" className="py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl rounded-2xl border border-forest-600/12 bg-cream-100 p-8 sm:p-10">
            <Eyebrow>Project stage</Eyebrow>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/70">
              {about.timelineNote}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/contact" size="lg">
                Request the investment pack
                <ArrowRight />
              </Button>
              <Button href="/masterplan" variant="secondary" size="lg">
                Explore the masterplan
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
