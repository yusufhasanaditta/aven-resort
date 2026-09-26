"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CardCarousel3D } from "@/components/ui/CardCarousel3D";
import { MembershipCard, type MembershipCardData } from "@/components/ui/MembershipCard";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { fallbackPlans } from "@/data/planFallback";
import { formatBDT, stayDays } from "@/lib/shares";

/**
 * The homepage / membership-page 3D card carousel. Loads live plan data from
 * the database (so admin edits to pricing show up immediately) and falls
 * back to the static tier data if the API hasn't responded yet.
 */
export function MembershipCarousel({
  tone = "forest",
  eyebrow = "Membership Plans",
  title = "Six plans. One rotating deck.",
  lede = "Executive to Royal — click a side card, or just wait and the deck advances on its own. Each plan pulls its terms live from Aven's membership records.",
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
          ? "relative isolate overflow-hidden bg-forest-950 py-20 sm:py-28"
          : "relative isolate overflow-hidden bg-cream-100 py-20 sm:py-28"
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

      <div className="mt-12 flex h-[22rem] items-center justify-center sm:h-[25rem]">
        <CardCarousel3D
          items={plans}
          className="h-full w-full"
          renderCard={(plan, isActive) => (
            <div className="flex flex-col items-center">
              <MembershipCard plan={plan} isActive={isActive} />
              <div
                className={
                  "mt-5 flex items-center gap-4 text-center transition-opacity duration-500 " +
                  (isActive ? "opacity-100" : "pointer-events-none opacity-0")
                }
              >
                <p className={light ? "text-[0.8125rem] text-cream-200/70" : "text-[0.8125rem] text-forest-900/60"}>
                  {stayDays(plan.freeStayNights)} days free stay ·{" "}
                  <span className="font-numeral">{formatBDT(plan.unitPriceBDT)}</span>
                  <span className="opacity-60"> / share, indicative</span>
                </p>
                <Link
                  href={`/ownership?plan=${plan.slug}#calculator`}
                  tabIndex={isActive ? 0 : -1}
                  className="rounded-full bg-gold-400 px-4 py-1.5 text-xs font-semibold text-forest-950 transition-colors hover:bg-gold-300"
                >
                  Choose {plan.name}
                </Link>
              </div>
            </div>
          )}
        />
      </div>

      <Container>
        <div className="mt-10 flex justify-center">
          <Button href="/ownership#compare" variant={light ? "light" : "primary"} size="lg">
            Compare all categories
            <ArrowRight />
          </Button>
        </div>
      </Container>
    </section>
  );
}
