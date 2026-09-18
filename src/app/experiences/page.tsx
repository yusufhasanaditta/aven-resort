import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { ExperienceGrid } from "@/components/sections/ExperienceGrid";
import { VisionStatement } from "@/components/sections/VisionStatement";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { demandDrivers } from "@/data/ownership";

export const metadata: Metadata = {
  title: "Experiences",
  description:
    "Hammam and Thai spa, a kayaking eco-lake, canopy walks, tea ceremony, lakeside barbecue and a tea-country wedding amphitheatre — the Aven Tea Empire programme.",
};

export default function ExperiencesPage() {
  return (
    <>
      <Hero
        eyebrow="Experiences"
        title="What Fills the"
        titleAccent="Days and the Calendar"
        lede="Wellness, water, culture, adventure, dining and events — sixteen distinct experiences across five hills, each designed as its own reason to book."
        image="/renders/spa-wellness-courtyard.jpg"
        imageAlt="The spa courtyard with hammam, Thai pavilion, Ayurveda centre and meditation garden"
        height="tall"
        leaves={false}
        facts={[
          { value: "6", label: "Programme pillars" },
          { value: "16", label: "Experiences" },
          { value: "200+", label: "Event capacity" },
          { value: "30", label: "Decimal of lake" },
        ]}
      />

      <ExperienceGrid />

      <VisionStatement
        quote="Night lighting transforms the bridge into a golden floating line across the tillas."
        attribution="Connectivity, Hill 1 to Hill 2"
        image="/renders/hanging-bridge-night.jpg"
        imageAlt="The hanging bridge lit in gold, winding across the tea terraces at dusk"
      />

      <Section tone="cream">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
            <Reveal>
              <Eyebrow>Why it matters to owners</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                Demand that does not depend on one season.
              </h2>
              <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                Each pillar of the programme brings its own market. Weddings
                fill the lawn, corporates fill the conference hall, wellness
                travellers fill the spa, and the tea itself brings the domestic
                luxury traveller year-round.
              </p>
              <div className="mt-8">
                <Button href="/ownership" size="lg">
                  How ownership works
                  <ArrowRight />
                </Button>
              </div>
            </Reveal>

            <RevealGroup className="grid gap-5 sm:grid-cols-2">
              {demandDrivers.map((d, i) => (
                <RevealItem key={d.label}>
                  <div className="h-full rounded-2xl border border-forest-600/10 bg-cream-50 p-6">
                    <span className="font-display text-3xl text-forest-600/25">
                      0{i + 1}
                    </span>
                    <h3 className="mt-3 font-display text-xl text-forest-900">
                      {d.label}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/60">
                      {d.detail}
                    </p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </Section>
    </>
  );
}
