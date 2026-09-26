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
import { businessModel, ownershipTiers, shareOwnership } from "@/data/ownership";
import { projectFacts } from "@/data/site";
import { about } from "@/data/about";
import { getAsset, getContent } from "@/lib/cms";
import { InterestForm } from "@/components/sections/InterestForm";

export const metadata: Metadata = {
  title: "Ownership & Membership",
  description:
    "Six membership plans — Executive, Silver, Gold, Platinum, Diamond and Royal — of fractional share ownership in Aven Eco Luxury Resort & Wellness, with Saf-Kabla registered land, annual halal profits, free stays and an interactive share calculator.",
};

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
        lede="Fractional ownership of the entire hotel and resort, backed by Saf-Kabla registered land — six membership plans from Executive to Royal, and a calculator that shows exactly what you'd pay."
        image={heroImage}
        imageAlt="An eco-luxury villa with infinity pool at sunrise, surrounded by tea hills"
        height="tall"
        facts={[
          { value: "6", label: "Membership plans" },
          { value: projectFacts.totalShares.toLocaleString("en-US"), label: "Unit shares issued" },
          { value: "Up to 28%", label: "Plan discount" },
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
            <Eyebrow>Compare plans</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Your plan is set by the shares you hold.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Every step up the ladder adds a larger discount on the share
              price and more free days at the resort each year.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="mt-10 overflow-x-auto">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <caption className="sr-only">Comparison of the six membership plans</caption>
                <thead>
                  <tr className="border-b border-forest-600/15">
                    {["Plan", "Shares", "Discount", "Free stay / year"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="pb-4 pr-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45"
                      >
                        {h}
                      </th>
                    ))}
                    <th scope="col" className="pb-4">
                      <span className="sr-only">Calculate</span>
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
                        <span className="flex items-center gap-3">
                          <TierIcon tierId={tier.id} color={tier.accent} size="sm" />
                          <span>
                            <span className="block font-display text-xl text-forest-900">
                              {tier.name}
                            </span>
                            <span className="block text-[0.6875rem] font-normal text-forest-900/45">
                              {tier.perk ?? tier.subtitle}
                            </span>
                          </span>
                        </span>
                      </th>
                      <td className="py-5 pr-6 font-numeral text-sm text-forest-900/75">
                        {unitsLabel(tier.minUnits, tier.maxUnits)}
                      </td>
                      <td className="py-5 pr-6 text-sm font-semibold text-forest-700">
                        {tier.discountPercent > 0 ? `${tier.discountPercent}%` : "Regular price"}
                      </td>
                      <td className="py-5 pr-6 font-numeral text-sm text-forest-900/75">
                        {tier.freeStayDays} days
                      </td>
                      <td className="py-5 text-right">
                        <Button href={`/ownership?plan=${tier.id}#calculator`} variant="secondary" size="sm">
                          Calculate
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
              Plan discounts apply to the share price. On top of your plan&rsquo;s
              free stay, every shareholder receives 40% to 50% off
              accommodation all year round.
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
                will walk you through pricing, instalments and a site visit — no
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
              The project, in four numbers.
            </h2>
          </Reveal>

          <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { bn: "জমির পরিমাণ", en: "Land", value: `${projectFacts.landAcres} acres`, sub: `${projectFacts.landSqft} sq ft`, bnValue: "৫ একর" },
              { bn: "শেয়ার পরিমাণ", en: "Shares", value: projectFacts.totalShares.toLocaleString("en-US"), sub: "Unit shares in total", bnValue: "২৭০০" },
              { bn: "প্রকল্প সময়সীমা", en: "Timeline", value: `${projectFacts.timelineMonths} months`, sub: "Project delivery", bnValue: "৩০ মাস" },
              { bn: "সুবিধা", en: "Amenities", value: String(projectFacts.amenities), sub: "Features, all shareholder-owned", bnValue: "২০" },
            ].map((f) => (
              <RevealItem key={f.en}>
                <div className="h-full rounded-2xl border border-forest-600/10 bg-cream-50/80 p-6 backdrop-blur-sm">
                  <p className="font-bangla text-sm text-forest-900/55">{f.bn}</p>
                  <p className="mt-3 inline-block rounded-xl bg-[#E9E3C4] px-3.5 py-1.5 font-bangla text-2xl font-medium text-forest-700">
                    {f.bnValue}
                  </p>
                  <p className="mt-4 font-numeral text-2xl text-forest-900">{f.value}</p>
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
