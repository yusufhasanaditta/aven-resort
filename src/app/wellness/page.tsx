import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { VisionStatement } from "@/components/sections/VisionStatement";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { TiltCard, Depth } from "@/components/ui/TiltCard";
import { Num } from "@/components/ui/Number";
import { Button, ArrowRight } from "@/components/ui/Button";
import { wellnessIntro, wellnessServices } from "@/data/wellness";

export const metadata: Metadata = {
  title: "Wellness",
  description:
    "Eleven wellness services at Aven Tea Empire — Turkish hammam, Thai spa, Ayurveda, sauna & steam, yoga, fitness, nutrition and a barefoot earthing trail across the Spa & Wellness hill.",
};

export default function WellnessPage() {
  return (
    <>
      <Hero
        eyebrow={wellnessIntro.eyebrow}
        title="A Hillside Given Over"
        titleAccent="Entirely to Wellness"
        lede={wellnessIntro.lede}
        image="/renders/spa-wellness-courtyard.jpg"
        imageAlt="The spa courtyard with hammam, Thai pavilion, Ayurveda centre and meditation garden"
        height="tall"
        leaves={false}
        facts={[
          { value: "11", label: "Wellness services" },
          { value: "10", label: "Decimals dedicated" },
          { value: "4", label: "Treatment traditions" },
          { value: "180°", label: "Hill-view treatment rooms" },
        ]}
        actions={[{ label: "Speak to the wellness team", href: "/contact" }]}
      />

      <Section tone="white">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>The programme</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Eleven services, built into one hill.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Every service below sits within walking distance of the next —
              a working wellness circuit rather than a single spa building,
              overlooking the bird sanctuary on Hill 2.
            </p>
          </Reveal>

          <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {wellnessServices.map((service, i) => (
              <RevealItem key={service.id}>
                <TiltCard
                  className="group h-full"
                  innerClassName="h-full rounded-2xl bg-cream-100 shadow-lift ring-1 ring-forest-600/8 transition-shadow duration-500 group-hover:shadow-float"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        sizes="(min-width: 1024px) 28rem, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 to-transparent" />
                      <Depth z={30} className="absolute left-4 top-4">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cream-50/92 backdrop-blur">
                          <Num size="xs" className="text-forest-700">
                            {i + 1}
                          </Num>
                        </span>
                      </Depth>
                      <Depth z={20} className="absolute bottom-3 left-4">
                        <span className="text-[0.6875rem] font-medium text-cream-100/85">
                          {service.hill}
                        </span>
                      </Depth>
                    </div>

                    <Depth z={18} className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-2xl leading-tight text-forest-900">
                        {service.name}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] italic text-forest-600/70">
                        {service.tagline}
                      </p>
                      <p className="mt-3 text-[0.8125rem] leading-relaxed text-forest-900/60">
                        {service.description}
                      </p>
                      <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                        {service.includes.map((inc) => (
                          <li
                            key={inc}
                            className="rounded-full bg-forest-600/7 px-2.5 py-1 text-[0.6875rem] text-forest-800/75"
                          >
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </Depth>
                  </div>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <VisionStatement
        quote="Holistic wellness sanctuary — a place for the body and the hills to meet."
        attribution="Spa & Wellness, Hill 2"
        image="/renders/yoga-tea-garden.jpg"
        imageAlt="A guest in sunrise yoga practice overlooking the tea terraces"
      />

      <Section tone="cream">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Part of every ownership category</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Wellness access comes with every unit share.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Every category of ownership — Executive through Royal — carries
              a year-round accommodation discount and a free-stay allowance
              that includes the wellness programme.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/membership" size="lg">
                See membership categories
                <ArrowRight />
              </Button>
              <Button href="/ownership#calculator" variant="secondary" size="lg">
                Calculate a share plan
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
