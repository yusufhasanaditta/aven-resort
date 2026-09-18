"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Button, ArrowRight } from "@/components/ui/Button";
import {
  getZone,
  zoneCategories,
  zones,
  type ZoneCategory,
} from "@/data/zones";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const SceneCanvas = dynamic(
  () => import("@/components/three/SceneCanvas").then((m) => m.SceneCanvas),
  { ssr: false },
);
const MasterplanScene = dynamic(
  () =>
    import("@/components/three/MasterplanScene").then((m) => m.MasterplanScene),
  { ssr: false },
);

const categoryKeys = Object.keys(zoneCategories) as ZoneCategory[];

/**
 * The interactive masterplan.
 *
 * The 3D model is the primary control: pins select a zone, which flies the
 * camera in and opens the detail panel. The zone list on the left is the
 * equivalent keyboard- and screen-reader-accessible path to the same state, so
 * nothing here is reachable only by pointing at the canvas.
 */
export function MasterplanExplorer() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<ZoneCategory | null>(null);

  const zone = selected ? getZone(selected) : null;
  const visible = filter ? zones.filter((z) => z.category === filter) : zones;

  return (
    <section className="relative bg-forest-950">
      <div className="mx-auto grid max-w-[110rem] lg:grid-cols-[22rem_1fr] xl:grid-cols-[24rem_1fr]">
        {/* Zone index */}
        <aside className="order-2 border-t border-cream-50/10 lg:order-1 lg:border-r lg:border-t-0">
          <div className="sticky top-[var(--header-height)] max-h-[calc(100svh-var(--header-height))] overflow-y-auto px-5 py-8 sm:px-7">
            <h2 className="text-eyebrow text-gold-400">The 17 zones</h2>

            {/* Category filter */}
            <div className="mt-5 flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setFilter(null)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-[0.6875rem] font-medium transition-colors",
                  filter === null
                    ? "bg-cream-50 text-forest-800"
                    : "bg-cream-50/8 text-cream-200/65 hover:bg-cream-50/14",
                )}
              >
                All
              </button>
              {categoryKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(filter === key ? null : key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-medium transition-colors",
                    filter === key
                      ? "bg-cream-50 text-forest-800"
                      : "bg-cream-50/8 text-cream-200/65 hover:bg-cream-50/14",
                  )}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: zoneCategories[key].color }}
                  />
                  {zoneCategories[key].label}
                </button>
              ))}
            </div>

            <ul className="mt-6 space-y-0.5">
              {visible.map((z) => (
                <li key={z.id}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(selected === z.id ? null : z.id)
                    }
                    aria-pressed={selected === z.id}
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      selected === z.id
                        ? "bg-cream-50/12"
                        : "hover:bg-cream-50/6",
                    )}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full transition-transform group-hover:scale-150"
                      style={{ background: zoneCategories[z.category].color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[0.8125rem] font-medium text-cream-100">
                        {z.name}
                      </span>
                      <span className="block truncate text-[0.6875rem] text-cream-200/45">
                        {z.hill}
                        {z.land && ` · ${z.land.decimals} dec`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* 3D canvas */}
        <div className="relative order-1 lg:order-2">
          <div className="relative h-[62svh] lg:h-[calc(100svh-var(--header-height))] lg:min-h-[40rem]">
            <SceneCanvas
              className="absolute inset-0 h-full w-full"
              shadows
              camera={{ position: [20, 16, 22], fov: 38 }}
              fallback={
                <Image
                  src="/renders/masterplan-aerial.jpg"
                  alt="Aerial view of the estate showing Hill 1 reception, Hill 2 hotel and spa, Hill 3 villas, and the lake"
                  fill
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              }
            >
              <MasterplanScene
                selected={selected}
                filter={filter}
                onSelect={(id) => setSelected(id === selected ? null : id)}
              />
            </SceneCanvas>

            {/* Canvas chrome */}
            <div className="pointer-events-none absolute left-5 top-5 flex flex-col gap-2">
              <span className="w-fit rounded-full bg-forest-950/70 px-3 py-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-cream-100 backdrop-blur">
                Interactive masterplan
              </span>
              <span className="w-fit rounded-full bg-forest-950/50 px-3 py-1.5 text-[0.625rem] text-cream-200/80 backdrop-blur">
                Drag to orbit · scroll to zoom · tap a pin
              </span>
            </div>

            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-5 top-5 rounded-full bg-cream-50/90 px-3.5 py-2 text-[0.6875rem] font-semibold text-forest-800 backdrop-blur transition-colors hover:bg-white"
              >
                Reset view
              </button>
            )}
          </div>

          {/* Detail panel */}
          <AnimatePresence mode="wait">
            {zone && (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.5, ease: easeOutExpo }}
                className="border-t border-cream-50/10 lg:absolute lg:bottom-6 lg:right-6 lg:z-10 lg:w-[26rem] lg:rounded-2xl lg:border lg:border-cream-50/12 lg:bg-forest-950/85 lg:backdrop-blur-xl"
              >
                <div className="p-6 sm:p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span
                        className="text-[0.625rem] font-semibold uppercase tracking-[0.16em]"
                        style={{ color: zoneCategories[zone.category].color }}
                      >
                        Zone {zone.number} · {zoneCategories[zone.category].label}
                      </span>
                      <h3 className="mt-2 font-display text-3xl text-cream-50">
                        {zone.name}
                      </h3>
                      <p className="mt-1 text-[0.8125rem] italic text-cream-200/60">
                        {zone.tagline}
                      </p>
                    </div>
                    <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
                      <Image
                        src={zone.image}
                        alt=""
                        fill
                        sizes="5rem"
                        className="object-cover"
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-[0.8125rem] leading-relaxed text-cream-200/70">
                    {zone.description}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-1.5">
                    {zone.highlights.map((h) => (
                      <li
                        key={h}
                        className="rounded-full bg-cream-50/8 px-2.5 py-1 text-[0.6875rem] text-cream-100/75"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>

                  <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-cream-50/10 pt-5">
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                        Land
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-cream-50">
                        {zone.land ? `${zone.land.decimals} dec` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                        Share
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-cream-50">
                        {zone.land ? `${zone.land.percent}%` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                        Type
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-cream-50">
                        {zone.zoneType}
                      </dd>
                    </div>
                  </dl>

                  {zone.land?.buffer && (
                    <p className="mt-3 text-[0.6875rem] text-cream-200/45">
                      Plus {zone.land.buffer.decimals} dec adjacent landscape
                      buffer.
                    </p>
                  )}
                  {!zone.land && (
                    <p className="mt-3 text-[0.6875rem] text-cream-200/45">
                      Included within the estate&rsquo;s landscape and open-area
                      allocation.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Below-fold CTA */}
      <div className="border-t border-cream-50/10 px-5 py-10 text-center sm:px-8">
        <p className="text-[0.9375rem] text-cream-200/65">
          Full zone documentation and land allocation schedules are available to
          prospective owners.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button href="/contact" variant="light">
            Request the masterplan pack
            <ArrowRight />
          </Button>
          <Button href="/ownership" variant="outline-light">
            Ownership categories
          </Button>
        </div>
      </div>
    </section>
  );
}
