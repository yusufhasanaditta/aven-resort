import { Suspense } from "react";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { MembershipCarousel } from "@/components/sections/MembershipCarousel";
import { ShareCalculator } from "@/components/sections/ShareCalculator";
import { InquiryForm } from "@/components/sections/InquiryForm";
import { MasterplanTeaser } from "@/components/sections/MasterplanTeaser";
import { LandUsage } from "@/components/sections/LandUsage";
import { CardRail } from "@/components/sections/CardRail";
import { OwnershipTeaser } from "@/components/sections/OwnershipTeaser";
import { VisionStatement } from "@/components/sections/VisionStatement";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Num } from "@/components/ui/Number";
import { Button, ArrowRight } from "@/components/ui/Button";
import { accommodations } from "@/data/accommodations";
import { experiences } from "@/data/experiences";
import { wellnessServices } from "@/data/wellness";
import { zoneCategories, zones } from "@/data/zones";
import { about, positioning } from "@/data/about";
import { investmentCase } from "@/data/ownership";

export default function HomePage() {
  return (
    <>
      <Hero
        eyebrow="Srimangal, Moulvibazar · Bangladesh"
        title="An Eco-Luxury Empire"
        titleAccent="Built Across Five Tea Hills"
        lede="Aven Tea Empire is a 5-star eco-tourism resort on 10.80 acres above Bangladesh's tea capital — offered to investors as fractional ownership, with registered land title and a share of the hotel itself."
        image="/renders/hanging-bridge-dusk.jpg"
        imageAlt="The illuminated hanging bridge crossing the tea valley at dusk, with the main hotel on the hill beyond"
        actions={[
          { label: "Explore the masterplan", href: "/masterplan" },
          {
            label: "Ownership categories",
            href: "/ownership",
            variant: "outline-light",
          },
        ]}
        facts={[
          { value: "10.80", label: "Acres" },
          { value: "5", label: "Tea hills" },
          { value: "17", label: "Zones" },
          { value: "60", label: "Keys & villas" },
        ]}
      />

      {/* 1. Membership plan — the rotating 3D deck */}
      <MembershipCarousel />

      {/* 2. Wellness */}
      <CardRail
        eyebrow="Wellness"
        title={
          <>
            Eleven services,{" "}
            <span className="italic text-forest-600">one hillside sanctuary.</span>
          </>
        }
        lede="Turkish hammam, Thai spa, Ayurveda, sauna & steam, yoga and more — the wellness circuit that occupies Hill 2 alongside the hotel."
        items={wellnessServices.slice(0, 8).map((w) => ({
          id: w.id,
          image: w.image,
          title: w.name,
          eyebrow: w.hill,
          description: w.tagline,
        }))}
        cta={{ label: "All 11 wellness services", href: "/wellness" }}
        ratio="landscape"
      />

      {/* 3. Ownership / Share calculator + booking form */}
      <Section tone="cream" id="calculator">
        <Suspense
          fallback={
            <Container>
              <p className="text-sm text-forest-900/50">Loading calculator…</p>
            </Container>
          }
        >
          <ShareCalculator />
        </Suspense>
      </Section>

      <Section tone="white" className="py-16 sm:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <Eyebrow>Speak to the team</Eyebrow>
              <h2 className="mt-4 font-display text-display-sm text-balance text-forest-900">
                Prefer to talk it through first?
              </h2>
              <p className="mt-4 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                Send a message and the AVEN team will call you back with
                current pricing, availability and a site-visit date.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <InquiryForm />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Positioning band */}
      <Section tone="cream" className="py-16 sm:py-20">
        <Container>
          <RevealGroup className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {positioning.map((p) => (
              <RevealItem key={p.label}>
                <Num as="p" size="2xl" className="text-forest-700">
                  {p.stat}
                </Num>
                <p className="mt-2 text-sm font-semibold text-forest-900">
                  {p.label}
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-forest-900/55">
                  {p.detail}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* The project, in prose */}
      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal>
              <Eyebrow>About the project</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                More than a resort — a{" "}
                <span className="italic text-forest-600">
                  lasting asset
                </span>{" "}
                in the hills.
              </h2>
            </Reveal>

            <div>
              <Reveal>
                <p className="text-pretty text-lg leading-relaxed text-forest-900/75">
                  {about.intro}
                </p>
                <p className="mt-6 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                  {about.designIntent.body}
                </p>
              </Reveal>

              <RevealGroup className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                {about.pillars.map((p) => (
                  <RevealItem key={p.title}>
                    <h3 className="text-sm font-semibold text-forest-700">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/60">
                      {p.body}
                    </p>
                  </RevealItem>
                ))}
              </RevealGroup>

              <Reveal delay={0.1}>
                <div className="mt-9">
                  <Button href="/about" variant="secondary">
                    About AVEN
                    <ArrowRight />
                  </Button>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <MasterplanTeaser />

      {/* Zone categories */}
      <Section tone="cream">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>Zoning</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Every acre classified.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              The masterplan divides the estate into four zone families, with
              26 named functions across them. Each is allocated, costed and
              mapped — investment grade throughout.
            </p>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {(
              Object.entries(zoneCategories) as [
                keyof typeof zoneCategories,
                (typeof zoneCategories)[keyof typeof zoneCategories],
              ][]
            ).map(([key, cat]) => {
              const count = zones.filter((z) => z.category === key).length;
              return (
                <RevealItem key={key}>
                  <div className="group h-full rounded-2xl border border-forest-600/10 bg-cream-50 p-6 transition-colors duration-500 hover:border-forest-600/25">
                    <span
                      className="block h-1 w-10 rounded-full"
                      style={{ background: cat.color }}
                    />
                    <h3 className="mt-5 font-display text-2xl text-forest-900">
                      {cat.label}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/60">
                      {cat.description}
                    </p>
                    <p className="mt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/60">
                      {count} {count === 1 ? "zone" : "zones"}
                    </p>
                  </div>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </Container>
      </Section>

      <VisionStatement
        quote="Connect without cutting hills. Preserve topography, create drama."
        attribution="Design intent, Aven Tea Empire masterplan"
        image="/renders/kayaking-lake-aerial.jpg"
        imageAlt="The eco-lake in the misted valley between three tea hills"
      />

      <CardRail
        eyebrow="Accommodations"
        title={
          <>
            Forty suites, twelve villas,{" "}
            <span className="italic text-forest-600">
              and the canopy above.
            </span>
          </>
        }
        lede="The hotel crowns Hill 2. The villas step down Hill 3. The nature stays sit lightest of all, raised into the trees on Hill 4."
        items={accommodations.map((a) => ({
          id: a.id,
          image: a.image,
          title: a.name,
          eyebrow: a.collection,
          description: a.tagline,
          meta: [a.hill],
        }))}
        cta={{ label: "All accommodations", href: "/accommodations" }}
      />

      <LandUsage />

      <CardRail
        eyebrow="Experiences"
        title={
          <>
            The reason guests return —{" "}
            <span className="italic text-gold-300">every season.</span>
          </>
        }
        lede="Rooms are one revenue stream of five. Water, culture, dining and events carry the asset through the year."
        tone="forest"
        ratio="landscape"
        items={experiences.slice(0, 9).map((e) => ({
          id: e.id,
          image: e.image,
          title: e.name,
          eyebrow: e.hill,
          description: e.summary,
        }))}
        cta={{ label: "All experiences", href: "/experiences" }}
      />

      {/* Why invest */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <Reveal>
              <Eyebrow>Investment opportunity</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                {investmentCase.headline}
              </h2>
              <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                {investmentCase.body}
              </p>

              <div className="relative mt-10 aspect-16/10 overflow-hidden rounded-2xl shadow-lift-lg">
                <Image
                  src="/renders/location-map.jpg"
                  alt="Satellite map showing the project location near Sreemangal, Moulvibazar"
                  fill
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent p-5">
                  <p className="text-[0.8125rem] font-medium text-cream-50">
                    Srimangal, Moulvibazar
                  </p>
                  <p className="mt-0.5 text-xs text-cream-200/65">
                    Bangladesh&rsquo;s tea capital — dual road access
                  </p>
                </div>
              </div>
            </Reveal>

            <RevealGroup className="space-y-8 lg:pt-12">
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
              <Reveal delay={0.1}>
                <Button href="/ownership" size="lg">
                  See the ownership structure
                  <ArrowRight />
                </Button>
              </Reveal>
            </RevealGroup>
          </div>
        </Container>
      </Section>

      <OwnershipTeaser />
    </>
  );
}
