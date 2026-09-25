"use client";

import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import { ownershipBenefits } from "@/data/ownership";

/**
 * The universal ownership benefits — every share carries these regardless of
 * category, so they sit once, beneath the membership deck and the calculator
 * rather than repeated on every tier card.
 */
export function OwnershipTeaser() {
  return (
    <Section tone="forest" className="overflow-hidden">
      <Container>
        <Reveal className="max-w-3xl">
          <Eyebrow tone="light">Every share carries</Eyebrow>
          <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
            One registered title.{" "}
            <span className="italic text-gold-300">Eight standing benefits.</span>
          </h2>
          <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">
            Ownership is structured as unit shares in the hotel establishment
            itself, backed by Saf-Kabla registered land documents. Whichever
            category your holding falls into, every one of the following
            comes with it.
          </p>
        </Reveal>

        <RevealGroup
          amount={0.08}
          className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-cream-50/12 bg-cream-50/8 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ownershipBenefits.map((b) => (
            <RevealItem key={b.id}>
              <div className="group h-full bg-forest-950/40 p-6 transition-colors duration-500 hover:bg-forest-950/10">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gold-500/15 text-gold-300 transition-colors duration-500 group-hover:bg-gold-500/25">
                  <BenefitIcon icon={b.icon} />
                </span>
                <p className="mt-4 text-[0.8125rem] font-semibold text-cream-50">
                  {b.title}
                </p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-cream-200/55">
                  {b.description}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/ownership#compare" variant="light" size="lg">
              Compare the four categories
              <ArrowRight />
            </Button>
            <Button href="/ownership#calculator" variant="outline-light" size="lg">
              Open the calculator
            </Button>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
