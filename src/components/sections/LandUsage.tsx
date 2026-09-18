"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { landUsage, zones } from "@/data/zones";
import { easeOutExpo, viewportOnce } from "@/lib/motion";
import { cn } from "@/lib/utils";

const TOTAL = landUsage.breakdown.reduce((sum, d) => sum + d.decimals, 0);

/**
 * Land allocation, as two charts.
 *
 * Part-to-whole across four categories is a single stacked proportion bar, not
 * a pie. The per-zone comparison below it is one series, so it takes one hue
 * and no legend. Every segment is directly labelled and a table view is
 * available, which is the required relief for the two lighter steps that sit
 * under 3:1 against cream.
 */
export function LandUsage() {
  const [table, setTable] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  const ranked = zones
    .filter((z) => z.land)
    .map((z) => ({
      name: z.name,
      decimals: z.land!.decimals,
      percent: z.land!.percent,
      hill: z.hill,
    }))
    .sort((a, b) => b.decimals - a.decimals);

  const maxZone = ranked[0].decimals;

  return (
    <Section tone="white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <Eyebrow>Land usage summary</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              {landUsage.headline}
            </h2>
            <p className="mt-4 font-display text-2xl italic text-forest-600">
              {landUsage.split}
            </p>
            <p className="mt-6 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Every decimal of the development area is classified and accounted
              for. The governing design rule — connect without cutting hills —
              means the built footprint sits inside the topography rather than
              replacing it.
            </p>

            <button
              type="button"
              onClick={() => setTable((v) => !v)}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-forest-600/20 px-4 py-2 text-xs font-medium text-forest-700 transition-colors hover:bg-forest-600/6"
              aria-pressed={table}
            >
              {table ? "Show charts" : "View as table"}
            </button>
          </Reveal>

          <div>
            {table ? (
              <LandTable ranked={ranked} />
            ) : (
              <>
                {/* Stacked proportion bar */}
                <Reveal>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-semibold text-forest-900">
                      Development &amp; investment area
                    </h3>
                    <p className="text-xs text-forest-900/50">
                      {TOTAL} decimal · 3.60 acres
                    </p>
                  </div>

                  <div
                    className="mt-4 flex h-14 w-full gap-0.5 overflow-hidden rounded-lg"
                    role="img"
                    aria-label={`Land allocation: ${landUsage.breakdown
                      .map((d) => `${d.label} ${d.percent}%`)
                      .join(", ")}`}
                  >
                    {landUsage.breakdown.map((d, i) => (
                      <motion.div
                        key={d.label}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={viewportOnce}
                        transition={{
                          duration: 0.9,
                          ease: easeOutExpo,
                          delay: i * 0.1,
                        }}
                        onMouseEnter={() => setHovered(d.label)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                          flexGrow: d.decimals,
                          background: d.color,
                          transformOrigin: "left",
                        }}
                        className={cn(
                          "relative origin-left transition-opacity duration-300",
                          hovered && hovered !== d.label
                            ? "opacity-45"
                            : "opacity-100",
                          i === 0 && "rounded-l-lg",
                          i === landUsage.breakdown.length - 1 &&
                            "rounded-r-lg",
                        )}
                      />
                    ))}
                  </div>

                  {/* Direct labels — required relief for the lighter steps */}
                  <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {landUsage.breakdown.map((d) => (
                      <div
                        key={d.label}
                        onMouseEnter={() => setHovered(d.label)}
                        onMouseLeave={() => setHovered(null)}
                        className={cn(
                          "flex gap-3 transition-opacity duration-300",
                          hovered && hovered !== d.label
                            ? "opacity-45"
                            : "opacity-100",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1 h-3 w-3 shrink-0 rounded-[3px]"
                          style={{ background: d.color }}
                        />
                        <div>
                          <dt className="text-[0.8125rem] font-semibold text-forest-900">
                            {d.label}
                          </dt>
                          <dd className="mt-0.5 text-[0.8125rem] text-forest-900/70">
                            <span className="font-semibold text-forest-700">
                              {d.percent}%
                            </span>{" "}
                            · {d.decimals} decimal
                          </dd>
                          <dd className="mt-0.5 text-xs leading-relaxed text-forest-900/45">
                            {d.detail}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>

                  <p className="mt-5 text-xs text-forest-900/40">
                    {landUsage.note}
                  </p>
                </Reveal>

                {/* Per-zone comparison — one series, one hue, no legend */}
                <Reveal delay={0.1}>
                  <h3 className="mt-12 text-sm font-semibold text-forest-900">
                    Allocation by zone
                  </h3>
                  <ul className="mt-5 space-y-2.5">
                    {ranked.map((z, i) => (
                      <li key={z.name} className="group">
                        <div className="flex items-baseline justify-between gap-4">
                          <span className="text-[0.8125rem] text-forest-900/80">
                            {z.name}
                          </span>
                          <span className="shrink-0 text-xs tabular-nums text-forest-900/50">
                            {z.decimals} dec ·{" "}
                            <span className="font-semibold text-forest-700">
                              {z.percent}%
                            </span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-forest-600/8">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: 1 }}
                            viewport={viewportOnce}
                            transition={{
                              duration: 0.85,
                              ease: easeOutExpo,
                              delay: 0.04 * i,
                            }}
                            style={{
                              width: `${(z.decimals / maxZone) * 100}%`,
                              transformOrigin: "left",
                            }}
                            className="h-full rounded-full bg-forest-600"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function LandTable({
  ranked,
}: {
  ranked: { name: string; decimals: number; percent: number; hill: string }[];
}) {
  return (
    <div className="space-y-10">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Land allocation by category across the development area
          </caption>
          <thead>
            <tr className="border-b border-forest-600/15 text-xs uppercase tracking-wider text-forest-900/50">
              <th scope="col" className="pb-2 pr-4 font-medium">Category</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Decimal</th>
              <th scope="col" className="pb-2 text-right font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {landUsage.breakdown.map((d) => (
              <tr key={d.label} className="border-b border-forest-600/8">
                <th scope="row" className="py-2.5 pr-4 font-normal text-forest-900">
                  {d.label}
                </th>
                <td className="py-2.5 pr-4 text-right tabular-nums text-forest-900/70">
                  {d.decimals}
                </td>
                <td className="py-2.5 text-right tabular-nums font-semibold text-forest-700">
                  {d.percent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">Land allocation by zone</caption>
          <thead>
            <tr className="border-b border-forest-600/15 text-xs uppercase tracking-wider text-forest-900/50">
              <th scope="col" className="pb-2 pr-4 font-medium">Zone</th>
              <th scope="col" className="pb-2 pr-4 font-medium">Location</th>
              <th scope="col" className="pb-2 pr-4 text-right font-medium">Decimal</th>
              <th scope="col" className="pb-2 text-right font-medium">Share</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((z) => (
              <tr key={z.name} className="border-b border-forest-600/8">
                <th scope="row" className="py-2.5 pr-4 font-normal text-forest-900">
                  {z.name}
                </th>
                <td className="py-2.5 pr-4 text-forest-900/55">{z.hill}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums text-forest-900/70">
                  {z.decimals}
                </td>
                <td className="py-2.5 text-right tabular-nums font-semibold text-forest-700">
                  {z.percent}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
