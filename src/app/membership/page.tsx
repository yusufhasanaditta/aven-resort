import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { MembershipCarousel } from "@/components/sections/MembershipCarousel";
import { OwnershipTeaser } from "@/components/sections/OwnershipTeaser";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Membership Plans",
  description:
    "Four membership categories at Aven Tea Empire, presented as a rotating 3D deck — Executive, Premium, Platinum and Royal, each with its own unit-share range, free stay and discount.",
};

export default function MembershipPage() {
  return (
    <>
      <Hero
        eyebrow="Membership"
        title="A Category for"
        titleAccent="Every Kind of Owner"
        lede="Four membership plans, set by the size of your holding — each carrying its own free-stay allowance, accommodation discount and standing in the AVEN community."
        image="/renders/hotel-facade.jpg"
        imageAlt="Aven Tea Resort's main building facade at golden hour"
        height="short"
        leaves={false}
        actions={[{ label: "Calculate my plan", href: "/ownership#calculator" }]}
      />

      <MembershipCarousel
        tone="cream"
        eyebrow="The deck"
        title="Swipe, or let it swipe itself."
        lede="The centre card is always the plan in focus — the deck advances on its own every few seconds, and pauses the moment you touch it."
      />

      <OwnershipTeaser />

      <Section tone="white" className="py-16 sm:py-20">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Ready to see the numbers</Eyebrow>
            <h2 className="mt-4 font-display text-display-sm text-balance text-forest-900">
              Run your own share calculation.
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Button href="/ownership#calculator" size="lg">
                Open the share calculator
                <ArrowRight />
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Talk to the team
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
