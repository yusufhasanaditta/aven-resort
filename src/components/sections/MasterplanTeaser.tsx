"use client";

import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { EstatePreview } from "@/components/three/EstatePreview";
import { estateFacts } from "@/data/zones";
import { tillas } from "@/lib/terrain";

/**
 * The homepage's entry into the 3D masterplan: a live study model of the
 * estate beside the headline land figures.
 */
export function MasterplanTeaser() {
  return (
    <Section tone="cream" className="overflow-hidden">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <Reveal>
              <Eyebrow>The site</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                Five hills, one estate,{" "}
                <span className="italic text-forest-600">
                  seventeen zones.
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                Aven Tea Empire occupies five tillas above Srimangal. The
                reception sits on Hill 1, the hotel and spa crown Hill 2 at the
                estate&rsquo;s highest point, and the villas step down Hill 3.
                Between them, a natural valley has become the kayaking lake.
              </p>
            </Reveal>

            <RevealGroup className="mt-10 grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-4 lg:grid-cols-2">
              {estateFacts.map((f) => (
                <RevealItem key={f.label}>
                  <p className="font-display text-4xl text-forest-700">
                    {f.value}
                    <span className="ml-1.5 text-base text-forest-600/60">
                      {f.unit}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] font-medium text-forest-900/75">
                    {f.label}
                  </p>
                  <p className="mt-0.5 text-xs text-forest-900/45">{f.detail}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-wrap gap-3">
                <Button href="/masterplan" size="lg">
                  Explore the 3D masterplan
                  <ArrowRight />
                </Button>
              </div>
            </Reveal>
          </div>

          <Reveal preset="riseIn" className="order-1 lg:order-2">
            <div className="relative">
              <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-gradient-to-b from-[#e4ece7] to-[#cfdcd5] shadow-float ring-1 ring-forest-600/10">
                <EstatePreview className="h-full w-full" />

                <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-forest-950/70 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-cream-100 backdrop-blur">
                  Live 3D model
                </div>
                <div className="pointer-events-none absolute bottom-5 right-5 rounded-full bg-cream-50/85 px-3 py-1.5 text-[0.625rem] font-medium text-forest-800 backdrop-blur">
                  Drag to orbit
                </div>
              </div>

              {/* Hill legend, floating off the model */}
              <div className="mt-5 flex flex-wrap gap-2">
                {tillas.map((t) => (
                  <span
                    key={t.id}
                    className="rounded-full border border-forest-600/15 bg-cream-50 px-3 py-1 text-[0.6875rem] font-medium text-forest-800/70"
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
