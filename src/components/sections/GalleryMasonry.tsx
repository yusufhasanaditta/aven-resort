"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Container, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import {
  gallery,
  galleryCategories,
  type GalleryCategory,
} from "@/data/gallery";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** Filterable masonry gallery with a keyboard-navigable lightbox. */
export function GalleryMasonry() {
  const [filter, setFilter] = useState<GalleryCategory | null>(null);
  const [index, setIndex] = useState<number | null>(null);

  const visible = filter ? gallery.filter((g) => g.category === filter) : gallery;
  const active = index !== null ? visible[index] : null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) =>
      setIndex((i) =>
        i === null ? null : (i + dir + visible.length) % visible.length,
      ),
    [visible.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  return (
    <Section tone="white">
      <Container>
        <Reveal>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setFilter(null);
                setIndex(null);
              }}
              className={cn(
                "rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                filter === null
                  ? "bg-forest-600 text-cream-50"
                  : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
              )}
            >
              All · {gallery.length}
            </button>
            {galleryCategories.map((c) => {
              const count = gallery.filter((g) => g.category === c.id).length;
              if (count === 0) return null;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setFilter(filter === c.id ? null : c.id);
                    setIndex(null);
                  }}
                  className={cn(
                    "rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                    filter === c.id
                      ? "bg-forest-600 text-cream-50"
                      : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
                  )}
                >
                  {c.label} · {count}
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.div
          layout
          className="mt-10 grid auto-rows-[13rem] grid-cols-2 gap-3 sm:auto-rows-[15rem] sm:grid-cols-3 lg:grid-cols-4"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((item, i) => (
              <motion.button
                key={item.src}
                layout
                type="button"
                onClick={() => setIndex(i)}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.4, ease: easeOutExpo }}
                className={cn(
                  "group relative overflow-hidden rounded-xl bg-forest-900 text-left",
                  item.span === "wide" && "col-span-2",
                  item.span === "tall" && "row-span-2",
                )}
              >
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 26vw, (min-width: 640px) 34vw, 50vw"
                  className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/10 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-x-0 bottom-0 translate-y-1 p-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0">
                  <p className="font-display text-lg leading-tight text-cream-50">
                    {item.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[0.6875rem] leading-snug text-cream-200/0 transition-colors duration-500 group-hover:text-cream-200/75">
                    {item.caption}
                  </p>
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>
      </Container>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-forest-950/95 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            onClick={close}
          >
            <motion.figure
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.45, ease: easeOutExpo }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[92svh] w-full max-w-6xl flex-col px-4"
            >
              <div className="relative min-h-0 flex-1">
                <Image
                  src={active.src}
                  alt={active.title}
                  width={1800}
                  height={1200}
                  className="mx-auto max-h-[74svh] w-auto rounded-xl object-contain"
                />
              </div>
              <figcaption className="mt-4 text-center">
                <p className="font-display text-2xl text-cream-50">
                  {active.title}
                </p>
                <p className="mx-auto mt-1.5 max-w-xl text-[0.8125rem] leading-relaxed text-cream-200/60">
                  {active.caption}
                </p>
                <p className="mt-3 text-[0.6875rem] text-cream-200/35">
                  {(index ?? 0) + 1} / {visible.length}
                </p>
              </figcaption>
            </motion.figure>

            {/* Controls */}
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 transition-colors hover:bg-cream-50/20"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  step(dir === "next" ? 1 : -1);
                }}
                aria-label={dir === "next" ? "Next image" : "Previous image"}
                className={cn(
                  "absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-cream-50/10 text-cream-50 transition-colors hover:bg-cream-50/20",
                  dir === "next" ? "right-5" : "left-5",
                )}
              >
                <svg
                  viewBox="0 0 20 20"
                  className={cn("h-4 w-4", dir === "prev" && "rotate-180")}
                  fill="none"
                >
                  <path
                    d="M7 4l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  );
}
