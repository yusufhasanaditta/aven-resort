"use client";

import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { TiltCard, Depth } from "@/components/ui/TiltCard";
import { ownershipTiers, ownershipBenefits } from "@/data/ownership";
import { cn } from "@/lib/utils";

/**
 * The ownership pitch, condensed for the homepage: the four categories as
 * tilting cards, with the universal benefits listed alongside.
 */
export function OwnershipTeaser() {
  return (
    <Section tone="forest" className="overflow-hidden">
      <Container>
        <Reveal className="max-w-3xl">
          <Eyebrow tone="light">Fractional ownership</Eyebrow>
          <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
            Four categories.{" "}
            <span className="italic text-gold-300">One registered title.</span>
          </h2>
          <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">
            Ownership is structured as unit shares in the hotel establishment
            itself, backed by Saf-Kabla registered land documents. Category is
            determined by the number of shares held, and carries its own stay
            allowance and year-round discount.
          </p>
        </Reveal>

        <RevealGroup
          amount={0.09}
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {ownershipTiers.map((tier) => (
            <RevealItem key={tier.id} preset="riseIn">
              <TiltCard
                className="group h-full"
                innerClassName={cn(
                  "h-full rounded-2xl p-6 ring-1 transition-all duration-500",
                  tier.featured
                    ? "bg-cream-50 ring-transparent shadow-float"
                    : "bg-cream-50/8 ring-cream-50/15 backdrop-blur-sm hover:bg-cream-50/12",
                )}
              >
                <Depth z={26} className="flex h-full flex-col">
                  {tier.featured && (
                    <span className="mb-4 inline-flex w-fit rounded-full bg-forest-600 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-cream-50">
                      Most selected
                    </span>
                  )}

                  <span
                    className="h-1 w-10 rounded-full"
                    style={{ background: tier.accent }}
                  />

                  <h3
                    className={cn(
                      "mt-4 font-display text-3xl",
                      tier.featured ? "text-forest-900" : "text-cream-50",
                    )}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={cn(
                      "mt-1 text-[0.8125rem]",
                      tier.featured ? "text-forest-900/55" : "text-cream-200/55",
                    )}
                  >
                    {tier.subtitle}
                  </p>

                  <dl className="mt-6 space-y-4 text-[0.8125rem]">
                    {[
                      { k: "Unit share", v: tier.unitShare },
                      { k: "Free stay", v: tier.freeStay },
                      { k: "Discount", v: tier.discount },
                    ].map((row) => (
                      <div key={row.k}>
                        <dt
                          className={cn(
                            "text-[0.625rem] uppercase tracking-[0.14em]",
                            tier.featured
                              ? "text-forest-900/40"
                              : "text-cream-200/40",
                          )}
                        >
                          {row.k}
                        </dt>
                        <dd
                          className={cn(
                            "mt-1 font-medium",
                            tier.featured
                              ? "text-forest-900"
                              : "text-cream-100",
                          )}
                        >
                          {row.v}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-auto pt-7">
                    <Button
                      href="/contact"
                      variant={tier.featured ? "primary" : "outline-light"}
                      size="sm"
                      className="w-full"
                    >
                      Contact for {tier.name}
                    </Button>
                  </div>
                </Depth>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Universal benefits */}
        <Reveal delay={0.1}>
          <div className="mt-16 rounded-2xl border border-cream-50/12 bg-cream-50/5 p-8 backdrop-blur-sm sm:p-10">
            <h3 className="font-display text-2xl text-cream-50">
              Every share carries
            </h3>
            <ul className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
              {ownershipBenefits.map((b) => (
                <li key={b.id}>
                  <p className="text-[0.8125rem] font-semibold text-gold-300">
                    {b.title}
                  </p>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-cream-200/60">
                    {b.description}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-9">
              <Button href="/ownership" variant="light" size="lg">
                Full ownership structure
                <ArrowRight />
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
