"use client";

import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import { ownershipBenefits } from "@/data/ownership";
import type { Benefit } from "@/data/cms-defaults";

/**
 * The brochure's "Why Own With Us?" page — the eight things every share
 * carries regardless of plan, so they sit once beneath the plan comparison
 * rather than repeated on every card.
 */
export function OwnershipTeaser({ benefits = ownershipBenefits }: { benefits?: Benefit[] }) {
  return (
    <Section tone="forest" id="why-own" className="scroll-mt-20 overflow-hidden">
      <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
      <Container className="relative">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
          <Reveal>
            <Eyebrow tone="light">Every share carries</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
              Why own <span className="italic text-gold-300">with us?</span>
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">
              Whichever plan your holding falls into, each of these comes with
              it — starting with registered Saf-Kabla land.
            </p>
          </Reveal>

          <RevealGroup amount={0.08} as="ol" className="grid gap-x-10 sm:grid-cols-2">
            {benefits.map((b, i) => (
              <RevealItem key={`${i}-${b.title}`} as="li">
                <div className="group flex gap-4 border-b border-cream-50/10 py-5">
                  <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-300 transition-colors duration-500 group-hover:bg-gold-500/30">
                    <BenefitIcon icon={b.icon} />
                    <span className="absolute -right-1 -top-1 font-numeral text-[0.625rem] text-cream-200/40">
                      {i + 1}
                    </span>
                  </span>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-cream-50">{b.title}</p>
                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-cream-200/60">
                      {b.description}
                    </p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </Container>
    </Section>
  );
}
