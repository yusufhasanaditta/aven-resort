"use client";

import { useRef } from "react";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { ImageCard } from "@/components/ui/ImageCard";
import { cn } from "@/lib/utils";

export type RailItem = {
  id: string;
  image: string;
  title: string;
  eyebrow?: string;
  description?: string;
  meta?: string[];
};

/**
 * Horizontally scrolling card rail with snap points — the pattern used for
 * accommodations and experiences on the homepage.
 */
export function CardRail({
  eyebrow,
  title,
  lede,
  items,
  cta,
  tone = "white",
  ratio = "portrait",
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: string;
  items: RailItem[];
  cta?: { label: string; href: string };
  tone?: "cream" | "white" | "forest";
  ratio?: "portrait" | "landscape" | "square";
}) {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  const light = tone === "forest";

  return (
    <Section tone={tone} className="overflow-hidden">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal className="max-w-2xl">
            <Eyebrow tone={light ? "light" : "brand"}>{eyebrow}</Eyebrow>
            <h2
              className={cn(
                "mt-4 font-display text-display-md text-balance",
                light ? "text-cream-50" : "text-forest-900",
              )}
            >
              {title}
            </h2>
            {lede && (
              <p
                className={cn(
                  "mt-5 text-pretty text-[0.9375rem] leading-relaxed",
                  light ? "text-cream-200/65" : "text-forest-900/60",
                )}
              >
                {lede}
              </p>
            )}
          </Reveal>

          <Reveal className="flex items-center gap-2">
            <div className="hidden gap-2 sm:flex">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => scrollBy(dir)}
                  aria-label={dir === -1 ? "Scroll left" : "Scroll right"}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border transition-colors",
                    light
                      ? "border-cream-50/25 text-cream-100 hover:bg-cream-50/10"
                      : "border-forest-600/20 text-forest-700 hover:bg-forest-600/6",
                  )}
                >
                  <ArrowRight
                    className={cn(
                      "group-hover:translate-x-0",
                      dir === -1 && "rotate-180",
                    )}
                  />
                </button>
              ))}
            </div>
            {cta && (
              <Button
                href={cta.href}
                variant={light ? "light" : "secondary"}
                size="md"
              >
                {cta.label}
                <ArrowRight />
              </Button>
            )}
          </Reveal>
        </div>
      </Container>

      <div
        ref={railRef}
        className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 sm:px-8"
      >
        {items.map((item, i) => (
          <Reveal
            key={item.id}
            delay={Math.min(i, 4) * 0.06}
            className="w-[78vw] shrink-0 snap-start sm:w-[22rem]"
          >
            <ImageCard
              image={item.image}
              title={item.title}
              eyebrow={item.eyebrow}
              description={item.description}
              meta={item.meta}
              ratio={ratio}
            />
          </Reveal>
        ))}
        {/* Trailing spacer so the last card can snap clear of the edge */}
        <div aria-hidden="true" className="w-1 shrink-0" />
      </div>
    </Section>
  );
}
