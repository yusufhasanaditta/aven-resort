import type { Metadata } from "next";
import { Suspense } from "react";
import { Hero } from "@/components/sections/Hero";
import { PlanChart } from "@/components/sections/PlanChart";
import { OwnershipTeaser } from "@/components/sections/OwnershipTeaser";
import { ShareCalculator } from "@/components/sections/ShareCalculator";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { businessModel, ownershipTiers, shareOwnership } from "@/data/ownership";
import { projectFacts } from "@/data/site";
import { about } from "@/data/about";
import { getAsset, getContent } from "@/lib/cms";
import { getPlans } from "@/lib/plans";
import { getLang } from "@/lib/i18n-server";
import { InterestForm } from "@/components/sections/InterestForm";

export const metadata: Metadata = {
  title: "Ownership & Membership",
  description:
    "Five membership plans — Executive, Gold, Platinum, Diamond and Royal — of fractional share ownership in Aven Eco Luxury Resort & Wellness, with Saf-Kabla registered land, annual halal profits, free stays, installment plans and an interactive share calculator.",
};

export default async function OwnershipPage() {
  const [heroImage, benefits, plans, pg] = await Promise.all([
    getAsset("ownership.hero"),
    getContent("benefits"),
    getPlans(),
    getContent("pages"),
  ]);
  const lang = await getLang();
  const bn = lang === "bn";

  return (
    <>
      <Hero
        bangla={bn}
        eyebrow={bn ? "মালিকানা ও মেম্বারশিপ" : pg.ownershipEyebrow}
        title={bn ? "পাহাড়ের এক টুকরো" : pg.ownershipTitle}
        titleAccent={bn ? "আপনার হোক" : pg.ownershipAccent}
        lede={
          bn
            ? "সাফ কাবলা নিবন্ধিত জমির নিশ্চয়তায় পুরো হোটেল ও রিসোর্টের আংশিক মালিকানা — এক্সিকিউটিভ থেকে রয়্যাল পর্যন্ত পাঁচটি মেম্বারশিপ প্ল্যান, আর একটি ক্যালকুলেটর যা দেখায় আপনি ঠিক কত পরিশোধ করবেন।"
            : pg.ownershipLede
        }
        image={heroImage}
        imageAlt="An eco-luxury villa with infinity pool at sunrise, surrounded by tea hills"
        height="tall"
        facts={
          bn
            ? [
                { value: "৫", label: "মেম্বারশিপ প্ল্যান" },
                { value: "২,৭০০", label: "মোট শেয়ার" },
                { value: "৳৫ লক্ষ", label: "প্রতি শেয়ার" },
                { value: "হালাল", label: "আজীবন আয়" },
              ]
            : [
                { value: String(ownershipTiers.length), label: "Membership plans" },
                { value: projectFacts.totalShares.toLocaleString("en-US"), label: "Unit shares issued" },
                { value: "৳5 Lakh", label: "Per share" },
                { value: "Halal", label: "Lifetime income" },
              ]
        }
        actions={[
          { label: bn ? "প্ল্যানগুলো দেখুন" : "See the plans", href: "#compare" },
          { label: bn ? "আগ্রহ জানান" : "Register interest", href: "#interest", variant: "outline-light" },
        ]}
      />

      <PlanChart plans={plans} lang={lang} />

      <Section tone="cream" id="calculator" className="scroll-mt-16">
        <Suspense fallback={<Container><p className="text-sm text-forest-900/50">Loading calculator…</p></Container>}>
          <ShareCalculator />
        </Suspense>
      </Section>

      <OwnershipTeaser benefits={benefits} lang={lang} />

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
              { bn: "জমির পরিমাণ", en: "Land", value: `${projectFacts.landAcres} Acres · ${projectFacts.landBigha} Bigha · ${projectFacts.landDecimal} Decimal`, sub: `${projectFacts.landSqft} sq ft`, bnValue: "৫ একর · ১৫.১৫ বিঘা · ৫০০ শতাংশ" },
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
              <Button href="/apply" size="lg">
                Apply to become a shareholder
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
