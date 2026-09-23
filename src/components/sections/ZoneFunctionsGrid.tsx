"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Num } from "@/components/ui/Number";
import { zoneFunctions } from "@/data/zoneFunctions";
import { zoneCategories, type ZoneCategory } from "@/data/zones";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const categoryKeys = Object.keys(zoneCategories) as ZoneCategory[];

/**
 * Site zoning & functions — every named function documented within the
 * estate's 17 zones, unpacked into its own card. This is the "minimum 20"
 * site-zoning-and-function section: 26 entries here, each tagged back to its
 * parent zone number so nothing reads as invented.
 */
export function ZoneFunctionsGrid() {
  const [filter, setFilter] = useState<ZoneCategory | null>(null);

  const visible = filter ? zoneFunctions.filter((f) => f.category === filter) : zoneFunctions;

  return (
    <Section tone="cream">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>Site zoning &amp; functions</Eyebrow>
          <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
            <Num as="span" size="xl" className="text-forest-700">
              {zoneFunctions.length}
            </Num>{" "}
            named functions, across 17 zones.
          </h2>
          <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
            Every function below is one of the specific features already
            documented on its parent zone — unpacked here individually, with
            its own image and its own place on the masterplan.
          </p>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter(null)}
              className={cn(
                "rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                filter === null
                  ? "bg-forest-600 text-cream-50"
                  : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
              )}
            >
              All · {zoneFunctions.length}
            </button>
            {categoryKeys.map((key) => {
              const count = zoneFunctions.filter((f) => f.category === key).length;
              if (count === 0) return null;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(filter === key ? null : key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                    filter === key
                      ? "bg-forest-600 text-cream-50"
                      : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: zoneCategories[key].color }}
                  />
                  {zoneCategories[key].label} · {count}
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div layout className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {visible.map((fn) => (
              <motion.article
                key={fn.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: easeOutExpo }}
                className="group overflow-hidden rounded-2xl bg-cream-50 shadow-lift ring-1 ring-forest-600/8"
              >
                <div className="relative aspect-4/3 overflow-hidden">
                  <Image
                    src={fn.image}
                    alt={fn.name}
                    fill
                    sizes="(min-width: 1280px) 22vw, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 via-forest-950/5 to-transparent" />
                  <span
                    className="absolute left-3 top-3 rounded-full px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-white"
                    style={{ background: zoneCategories[fn.category].color }}
                  >
                    Zone {String(fn.zoneNumber).padStart(2, "0")}
                  </span>
                  <p className="absolute bottom-2.5 left-3 right-3 text-[0.6875rem] font-medium text-cream-100/85">
                    {fn.hill}
                  </p>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg leading-tight text-forest-900">
                    {fn.name}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-forest-900/55">
                    {fn.description}
                  </p>
                  <p className="mt-2 text-[0.625rem] uppercase tracking-[0.1em] text-forest-600/50">
                    {fn.zoneName}
                  </p>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Section>
  );
}
