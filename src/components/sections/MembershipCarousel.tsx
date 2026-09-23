"use client";

import { useEffect, useState } from "react";
import { CardCarousel3D } from "@/components/ui/CardCarousel3D";
import { MembershipCard, type MembershipCardData } from "@/components/ui/MembershipCard";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { ownershipTiers } from "@/data/ownership";

/** Static fallback, shown until the live (admin-editable) plans load. */
const fallbackPlans: MembershipCardData[] = ownershipTiers.map((t) => ({
  slug: t.id,
  name: t.name,
  subtitle: t.subtitle,
  minUnits: Number(t.unitShare.match(/\d+/)?.[0] ?? 1),
  maxUnits: t.unitShare.includes("&")
    ? null
    : Number(t.unitShare.match(/\d+\s*[-–]\s*(\d+)/)?.[1] ?? null) || null,
  unitPriceBDT: 500_000,
  freeStayNights: Number(t.freeStay.match(/\d+/)?.[0] ?? 0),
  discountPercent: Number(t.discount.match(/\d+/)?.[0] ?? 0),
  accentColor: t.accent,
  featured: t.featured,
}));

/**
 * The homepage / membership-page 3D card carousel. Loads live plan data from
 * the database (so admin edits to pricing show up immediately) and falls
 * back to the static tier data if the API hasn't responded yet.
 */
export function MembershipCarousel({
  tone = "forest",
  eyebrow = "Membership Plans",
  title = "Four categories. One rotating deck.",
  lede = "Drag, click a side card, or just wait — the deck advances on its own. Each plan pulls its terms live from AVEN's membership records.",
}: {
  tone?: "forest" | "cream";
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  const [plans, setPlans] = useState<MembershipCardData[]>(fallbackPlans);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((json) => {
        if (Array.isArray(json.plans) && json.plans.length > 0) {
          setPlans(
            json.plans.map((p: MembershipCardData) => ({
              slug: p.slug,
              name: p.name,
              subtitle: p.subtitle,
              minUnits: p.minUnits,
              maxUnits: p.maxUnits,
              unitPriceBDT: p.unitPriceBDT,
              freeStayNights: p.freeStayNights,
              discountPercent: p.discountPercent,
              accentColor: p.accentColor,
              featured: p.featured,
            })),
          );
        }
      })
      .catch(() => {
        /* keep the static fallback */
      });
  }, []);

  const light = tone === "forest";

  return (
    <section
      className={
        light
          ? "relative overflow-hidden bg-forest-950 py-20 sm:py-28"
          : "relative overflow-hidden bg-cream-100 py-20 sm:py-28"
      }
    >
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow tone={light ? "light" : "brand"}>{eyebrow}</Eyebrow>
          <h2
            className={
              light
                ? "mt-4 font-display text-display-md text-balance text-cream-50"
                : "mt-4 font-display text-display-md text-balance text-forest-900"
            }
          >
            {title}
          </h2>
          <p
            className={
              light
                ? "mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65"
                : "mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60"
            }
          >
            {lede}
          </p>
        </Reveal>
      </Container>

      <div className="mt-14 flex h-[30rem] items-center justify-center sm:h-[32rem]">
        <CardCarousel3D
          items={plans}
          className="h-full w-full"
          renderCard={(plan, isActive) => <MembershipCard plan={plan} isActive={isActive} />}
        />
      </div>

      <Container>
        <div className="mt-10 flex justify-center">
          <Button href="/membership" variant={light ? "light" : "primary"} size="lg">
            Compare all categories
            <ArrowRight />
          </Button>
        </div>
      </Container>
    </section>
  );
}
