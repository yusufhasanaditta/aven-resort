"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const quotes = [
  { text: "Take care of your body. It's the only place you have to live.", by: "Jim Rohn" },
  { text: "Look deep into nature, and then you will understand everything better.", by: "Albert Einstein" },
  { text: "Almost everything will work again if you unplug it for a few minutes — including you.", by: "Anne Lamott" },
  { text: "In every walk with nature, one receives far more than he seeks.", by: "John Muir" },
  { text: "Yoga is the journey of the self, through the self, to the self.", by: "The Bhagavad Gita" },
  { text: "Adopt the pace of nature: her secret is patience.", by: "Ralph Waldo Emerson" },
  { text: "The greatest wealth is health.", by: "Virgil" },
  { text: "Nature itself is the best physician.", by: "Hippocrates" },
];

/**
 * A card of famous wellness quotes. It advances on its own, swipes left and
 * right on touch (or drag), and the whole card opens the Wellness page.
 */
export function WellnessQuotes({ className }: { className?: string }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const dragged = useRef(false);

  const go = useCallback((delta: number) => {
    setDir(delta);
    setI((n) => (n + delta + quotes.length) % quotes.length);
  }, []);

  useEffect(() => {
    if (paused || reduced) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [paused, reduced, go]);

  const q = quotes[i];

  return (
    <div
      className={cn("relative flex flex-col overflow-hidden rounded-3xl bg-forest-950 text-cream-50", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="bg-leaf-swirl-light pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-8 font-display text-[9rem] leading-none text-gold-400/15">
        &ldquo;
      </span>

      <Link
        href="/wellness"
        aria-label={`${q.text} — ${q.by}. Open the Wellness page.`}
        onClick={(e) => {
          // A swipe shouldn't also count as a click.
          if (dragged.current) {
            e.preventDefault();
            dragged.current = false;
          }
        }}
        className="relative flex flex-1 flex-col justify-between p-7 outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-gold-400">Wellness thought</p>

        <div className="relative mt-4 min-h-[8.5rem] touch-pan-y" aria-live="polite">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.blockquote
              key={i}
              custom={dir}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.35}
              onDragStart={() => {
                dragged.current = true;
                setPaused(true);
              }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 50) go(info.offset.x < 0 ? 1 : -1);
                setPaused(false);
                // The click that ends a drag fires right after this; forget the drag once it has.
                setTimeout(() => (dragged.current = false), 80);
              }}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -40 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="cursor-grab select-none active:cursor-grabbing"
            >
              <p className="font-display text-2xl leading-snug text-balance">&ldquo;{q.text}&rdquo;</p>
              <footer className="mt-3 text-sm text-cream-200/65">— {q.by}</footer>
            </motion.blockquote>
          </AnimatePresence>
        </div>

        <span className="mt-6 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-gold-300">
          Discover Aven wellness
          <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="h-3.5 w-3.5">
            <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Link>

      <div className="relative flex items-center justify-between px-7 pb-6">
        <div className="flex gap-1.5">
          {quotes.map((_, n) => (
            <button
              key={n}
              type="button"
              aria-label={`Quote ${n + 1}`}
              aria-current={n === i ? "true" : undefined}
              onClick={() => {
                setDir(n > i ? 1 : -1);
                setI(n);
              }}
              className={cn("h-1.5 rounded-full transition-all duration-300", n === i ? "w-6 bg-gold-400" : "w-1.5 bg-cream-50/30 hover:bg-cream-50/60")}
            />
          ))}
        </div>
        <div className="flex gap-1.5">
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Previous quote" : "Next quote"}
              onClick={() => go(d)}
              className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-cream-50/20 transition-colors hover:bg-cream-50/10"
            >
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className={cn("h-3.5 w-3.5", d < 0 && "rotate-180")}>
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
