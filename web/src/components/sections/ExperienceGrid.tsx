"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { TiltCard, Depth } from "@/components/ui/TiltCard";
import {
  experienceCategories,
  experiences,
  type ExperienceCategory,
} from "@/data/experiences";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const categoryKeys = Object.keys(
  experienceCategories,
) as ExperienceCategory[];

/** Filterable experience grid, with an animated layout on filter change. */
export function ExperienceGrid() {
  const [filter, setFilter] = useState<ExperienceCategory | null>(null);

  const visible = filter
    ? experiences.filter((e) => e.category === filter)
    : experiences;

  return (
    <Section tone="white">
      <Container>
        <Reveal className="max-w-2xl">
          <Eyebrow>The programme</Eyebrow>
          <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
            Five revenue streams,{" "}
            <span className="italic text-forest-600">
              one destination.
            </span>
          </h2>
          <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
            Rooms alone do not carry a hill resort through a monsoon. The
            programme is built so wellness, water, culture, dining and events
            each pull their own weight across the year.
          </p>
        </Reveal>

        {/* Filter row */}
        <Reveal delay={0.08}>
          <div className="mt-10 flex flex-wrap gap-2">
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
              All · {experiences.length}
            </button>
            {categoryKeys.map((key) => {
              const count = experiences.filter(
                (e) => e.category === key,
              ).length;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(filter === key ? null : key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                    filter === key
                      ? "bg-forest-600 text-cream-50"
                      : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
                  )}
                >
                  {experienceCategories[key].label} · {count}
                </button>
              );
            })}
          </div>

          {filter && (
            <p className="mt-4 text-[0.8125rem] italic text-forest-900/50">
              {experienceCategories[filter].blurb}
            </p>
          )}
        </Reveal>

        <motion.div
          layout
          className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((exp) => (
              <motion.article
                key={exp.id}
                layout
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.45, ease: easeOutExpo }}
              >
                <TiltCard
                  className="group h-full"
                  innerClassName="h-full rounded-2xl bg-cream-100 shadow-lift ring-1 ring-forest-600/8 transition-shadow duration-500 group-hover:shadow-float"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl">
                    <div className="relative aspect-4/3 overflow-hidden">
                      <Image
                        src={exp.image}
                        alt={exp.name}
                        fill
                        sizes="(min-width: 1024px) 28rem, (min-width: 640px) 45vw, 92vw"
                        className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/50 to-transparent" />
                      <Depth z={30} className="absolute left-4 top-4">
                        <span className="rounded-full bg-cream-50/92 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-forest-700 backdrop-blur">
                          {experienceCategories[exp.category].label}
                        </span>
                      </Depth>
                      <Depth z={20} className="absolute bottom-3 left-4">
                        <span className="text-[0.6875rem] font-medium text-cream-100/85">
                          {exp.hill}
                        </span>
                      </Depth>
                    </div>

                    <Depth z={18} className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-2xl leading-tight text-forest-900">
                        {exp.name}
                      </h3>
                      <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/60">
                        {exp.detail}
                      </p>
                      <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                        {exp.includes.map((inc) => (
                          <li
                            key={inc}
                            className="rounded-full bg-forest-600/7 px-2.5 py-1 text-[0.6875rem] text-forest-800/75"
                          >
                            {inc}
                          </li>
                        ))}
                      </ul>
                    </Depth>
                  </div>
                </TiltCard>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>
    </Section>
  );
}
