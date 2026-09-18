import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { VisionStatement } from "@/components/sections/VisionStatement";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { TiltCard, Depth } from "@/components/ui/TiltCard";
import { about, positioning } from "@/data/about";
import { estateFacts } from "@/data/zones";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "About AVEN",
  description:
    "AVEN Ltd. is a real estate, hotel and resort development company building sustainable, design-led destinations. Aven Tea Empire is its flagship eco-luxury project in Srimangal.",
};

export default function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About AVEN"
        title="More Than a Resort —"
        titleAccent="An Avenue to Create Future"
        lede={site.description}
        image="/renders/main-hotel-aerial.jpg"
        imageAlt="The main hotel building crowning Hill 2, surrounded by tea-covered hills"
        height="tall"
      />

      {/* Company */}
      <Section tone="white">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <Reveal>
              <Eyebrow>The company</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                Land, resort, hotel &amp; tourism development.
              </h2>
            </Reveal>

            <Reveal>
              <p className="text-pretty text-lg leading-relaxed text-forest-900/75">
                {about.intro}
              </p>
              <h3 className="mt-10 font-display text-2xl text-forest-900">
                {about.vision.title}
              </h3>
              <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                {about.vision.body}
              </p>
            </Reveal>
          </div>

          <RevealGroup className="mt-16 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {positioning.map((p) => (
              <RevealItem key={p.label}>
                <p className="font-display text-5xl text-forest-700">{p.stat}</p>
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

      <VisionStatement
        quote="We blend investment-grade asset creation with ecological stewardship."
        attribution={`${site.company}, The Vision`}
        image="/renders/eco-villa-sunrise.jpg"
        imageAlt="An eco-luxury villa on a tea hill at sunrise"
      />

      {/* Design intent */}
      <Section tone="cream">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal preset="riseIn">
              <TiltCard
                className="group"
                innerClassName="rounded-3xl shadow-float"
              >
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl">
                  <Image
                    src="/renders/bridge-valley-restaurant.jpg"
                    alt="The hanging bridge spanning two tea hills above the valley restaurant"
                    fill
                    sizes="(min-width: 1024px) 45vw, 92vw"
                    className="object-cover"
                  />
                  <Depth z={40} className="absolute bottom-5 left-5 right-5">
                    <div className="rounded-2xl bg-cream-50/92 p-4 backdrop-blur">
                      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-600/60">
                        Design intent
                      </p>
                      <p className="mt-1.5 font-display text-xl text-forest-900">
                        Connect without cutting hills.
                      </p>
                    </div>
                  </Depth>
                </div>
              </TiltCard>
            </Reveal>

            <div>
              <Reveal>
                <Eyebrow>How we build</Eyebrow>
                <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                  {about.designIntent.title}
                </h2>
                <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/65">
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
            </div>
          </div>
        </Container>
      </Section>

      {/* Estate facts */}
      <Section tone="forest">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow tone="light">The land</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
              Ten and a half acres above the tea capital.
            </h2>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-cream-50/12 bg-cream-50/10 sm:grid-cols-2 lg:grid-cols-4">
            {estateFacts.map((f) => (
              <RevealItem key={f.label}>
                <div className="h-full bg-forest-950 p-7">
                  <p className="font-display text-5xl text-cream-50">
                    {f.value}
                    <span className="ml-2 text-lg text-cream-200/50">
                      {f.unit}
                    </span>
                  </p>
                  <p className="mt-3 text-[0.8125rem] font-medium text-cream-100/80">
                    {f.label}
                  </p>
                  <p className="mt-1 text-xs text-cream-200/45">{f.detail}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-wrap gap-3">
              <Button href="/masterplan" variant="light" size="lg">
                Explore the masterplan
                <ArrowRight />
              </Button>
              <Button href="/contact" variant="outline-light" size="lg">
                Contact AVEN
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Stage disclosure */}
      <Section tone="white" className="py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <Eyebrow>Project stage</Eyebrow>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/65">
              {about.timelineNote}
            </p>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
