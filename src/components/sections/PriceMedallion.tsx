"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Depth, TiltCard } from "@/components/ui/TiltCard";
import { LogoMark } from "@/components/ui/Logo";

/**
 * The share price as a 3D gold medallion: layered rims lift off the face as
 * it tilts toward the pointer, an orbit ring circles it in perspective, and
 * the whole piece floats gently.
 */
export function PriceMedallion({ price, label, note }: { price: string; label: string; note: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="relative mx-auto flex h-[19rem] w-[19rem] items-center justify-center sm:h-[21rem] sm:w-[21rem]">
      {/* Ground shadow */}
      <span aria-hidden="true" className="absolute bottom-2 left-1/2 h-6 w-48 -translate-x-1/2 rounded-[50%] bg-forest-950/35 blur-xl" />

      {/* Orbit ring, seen in perspective */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 [perspective:900px]">
        <motion.div
          animate={reduced ? undefined : { rotateZ: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute inset-3 rounded-full border border-gold-400/40 [transform:rotateX(72deg)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gold-300 shadow-[0_0_14px_rgba(232,207,135,0.9)]" />
        </motion.div>
      </div>

      <motion.div
        animate={reduced ? undefined : { y: [0, -10, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-60 w-60 sm:h-64 sm:w-64"
      >
        <TiltCard intensity={14} className="h-full w-full" innerClassName="group rounded-full">
          {/* Coin edge */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_210deg,#8a6a2c,#f3dd98,#a57a3b,#fbe9b4,#8a6a2c)] shadow-[0_30px_60px_-20px_rgba(4,30,22,0.7)]" />
          <Depth z={14} className="absolute inset-[7px] rounded-full bg-[radial-gradient(circle_at_30%_25%,#1c5a43,#0b2a20_70%)] ring-1 ring-gold-200/40">
            <div className="bg-leaf-swirl-light absolute inset-0 rounded-full opacity-50" />
          </Depth>
          <Depth z={24} className="absolute inset-[18px] rounded-full border border-dashed border-gold-300/35">{null}</Depth>
          <Depth z={46} className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="h-9 w-9">
              <LogoMark tone="gold" />
            </span>
            <span className="mt-2 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-gold-300">{label}</span>
            <span className="mt-1 font-numeral text-[2.1rem] leading-none text-cream-50 drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)] sm:text-[2.35rem]">
              {price}
            </span>
            <span className="mt-2 max-w-[11rem] text-[0.625rem] leading-snug text-cream-200/65">{note}</span>
          </Depth>
        </TiltCard>
      </motion.div>
    </div>
  );
}
