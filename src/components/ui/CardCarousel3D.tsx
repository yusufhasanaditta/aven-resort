"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A 3D coverflow carousel: the active card sits forward and centred, its
 * neighbours recede in scale, opacity and Z behind it on either side, and the
 * whole row advances on its own — center card swiping left, the next right
 * card rising to take its place — pausing the moment a visitor interacts.
 *
 * Generic over `T`; the caller supplies how to render one card. Only a
 * window of cards around the active index actually renders, so this scales
 * to any number of items without paying for all of them at once.
 */
export function CardCarousel3D<T>({
  items,
  renderCard,
  autoplayMs = 4200,
  className,
  cardClassName,
}: {
  items: T[];
  renderCard: (item: T, isActive: boolean) => React.ReactNode;
  autoplayMs?: number;
  className?: string;
  cardClassName?: string;
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const count = items.length;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + count) % count),
    [count],
  );

  useEffect(() => {
    if (paused || reduced || count <= 1) return;
    timerRef.current = setInterval(() => go(1), autoplayMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused, reduced, autoplayMs, count, go]);

  // Shortest signed distance from `active`, so the deck wraps both ways.
  function offsetOf(index: number) {
    let d = index - active;
    if (d > count / 2) d -= count;
    if (d < -count / 2) d += count;
    return d;
  }

  const WINDOW = 2; // cards rendered on each side of centre

  return (
    <div
      className={cn("relative", className)}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="perspective-far h-full">
        <div className="preserve-3d relative flex h-full items-center justify-center">
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const offset = offsetOf(index);
              if (Math.abs(offset) > WINDOW) return null;

              const isActive = offset === 0;
              const abs = Math.abs(offset);

              return (
                <motion.div
                  key={index}
                  className={cn(
                    "absolute preserve-3d cursor-pointer",
                    cardClassName,
                  )}
                  style={{ zIndex: 10 - abs }}
                  initial={false}
                  animate={{
                    x: `${offset * 62}%`,
                    scale: 1 - abs * 0.16,
                    opacity: abs > WINDOW ? 0 : 1 - abs * 0.32,
                    rotateY: offset * -26,
                    z: -abs * 140,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 32 }}
                  onClick={() => !isActive && setActive(index)}
                  aria-hidden={!isActive}
                >
                  {renderCard(item, isActive)}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="relative z-20 mt-8 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous plan"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/25 text-cream-100 transition-colors hover:bg-cream-50/10"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4 rotate-180" fill="none">
            <path
              d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Go to card ${i + 1}`}
              aria-current={i === active}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === active ? "w-6 bg-gold-400" : "w-1.5 bg-cream-50/30",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next plan"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-50/25 text-cream-100 transition-colors hover:bg-cream-50/10"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
            <path
              d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
