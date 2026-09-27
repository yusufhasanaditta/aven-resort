"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CardCarousel3D } from "@/components/ui/CardCarousel3D";
import { MembershipCard, type MembershipCardData } from "@/components/ui/MembershipCard";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { fallbackPlans } from "@/data/planFallback";
import { PlanDetails } from "@/components/sections/PlanDetails";
import { easeOutExpo } from "@/lib/motion";

/**
 * The homepage / membership-page 3D card carousel. Loads live plan data from
 * the database (so admin edits to pricing show up immediately) and falls
 * back to the static tier data if the API hasn't responded yet.
 */
export function MembershipCarousel({
  tone = "forest",
  eyebrow = "Membership Plans",
  title = "Five plans. One rotating deck.",
  lede = "Executive to Royal — click a side card, or just wait and the deck advances on its own. The full price, down payment and installment schedule of the card in front appear below it.",
}: {
  tone?: "forest" | "cream";
  eyebrow?: string;
  title?: string;
  lede?: string;
}) {
  const [plans, setPlans] = useState<MembershipCardData[]>(fallbackPlans);
  const [active, setActive] = useState(0);
  const current = plans[active] ?? plans[0];

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
              fullPriceBDT: p.fullPriceBDT,
              downPaymentBDT: p.downPaymentBDT,
              installmentCount: p.installmentCount,
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
          onActiveChange={setActive}
          renderCard={(plan, isActive) => <MembershipCard plan={plan} isActive={isActive} />}
        />
      </div>

      <Container>
        <div className="mx-auto mt-6 max-w-3xl" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
              className={light ? "rounded-3xl bg-forest-900/60 p-6 ring-1 ring-cream-50/10 backdrop-blur-md sm:p-8" : "rounded-3xl bg-cream-50 p-6 shadow-lift ring-1 ring-forest-600/8 sm:p-8"}
            >
              <PlanDetails plan={current} tone={light ? "dark" : "light"} />
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>

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
