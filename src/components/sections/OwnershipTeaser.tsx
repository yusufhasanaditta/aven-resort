"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import { Depth, TiltCard } from "@/components/ui/TiltCard";
import { ownershipBenefits } from "@/data/ownership";
import type { Benefit } from "@/data/cms-defaults";
import { bnDigits, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Hand-written Bangla for the eight default benefits, in the same order. */
const bnBenefits: Benefit[] = [
  { title: "সাফ কাবলা জমি", description: "নিবন্ধিত জমির মালিকানা।", icon: "document" },
  { title: "হোটেলের মালিকানা", description: "পুরো হোটেল ও রিসোর্টের আংশিক মালিকানা।", icon: "building" },
  { title: "বাৎসরিক মুনাফা", description: "রুম, রেস্টুরেন্ট ও অ্যাক্টিভিটি থেকে অর্জিত মুনাফার অংশ।", icon: "chart" },
  { title: "সহজ হস্তান্তর", description: "যেকোনো সময় লাভসহ শেয়ার বিক্রি বা হস্তান্তরের সুযোগ।", icon: "exchange" },
  { title: "আজীবন বিনিয়োগ", description: "আজীবন হালাল আয়ের উৎস।", icon: "infinity" },
  { title: "কমিউনিটি", description: "সফল বিনিয়োগকারীদের অভিজাত ব্যবসায়িক কমিউনিটিতে প্রবেশ।", icon: "users" },
  { title: "ফ্রি অবকাশ", description: "প্ল্যান অনুযায়ী বছরে ৩ থেকে ৩৫ দিন ফ্রি থাকা।", icon: "key" },
  { title: "সহজ কিস্তি", description: "ডাউন পেমেন্টের পর ১২ থেকে ২৪টি মাসিক কিস্তি।", icon: "tag" },
];

const copy = {
  en: {
    eyebrow: "Every share carries",
    title: "Why own",
    accent: "with us?",
    lede: "Whichever plan your holding falls into, all eight come with it — starting with registered Saf-Kabla land.",
    center: "Your share",
    centerSub: "8 rights in one",
  },
  bn: {
    eyebrow: "প্রতিটি শেয়ারের সাথে",
    title: "কেন আমাদের সাথে",
    accent: "মালিক হবেন?",
    lede: "আপনার হোল্ডিং যে প্ল্যানেই পড়ুক, এই আটটি সুবিধা সবসময় সাথে থাকবে — শুরুটা নিবন্ধিত সাফ কাবলা জমি দিয়ে।",
    center: "আপনার শেয়ার",
    centerSub: "এক শেয়ারে ৮টি অধিকার",
  },
};

/**
 * The brochure's "Why Own With Us?" — the eight things every share carries,
 * as glass tiles that tilt in 3D around a floating share emblem, over a
 * perspective grid. Tile icons and titles lift off the glass as it turns.
 */
export function OwnershipTeaser({ benefits = ownershipBenefits, lang = "en" }: { benefits?: Benefit[]; lang?: Lang }) {
  const reduced = useReducedMotion();
  const bn = lang === "bn";
  const t = copy[lang];
  const list = bn && benefits.length === bnBenefits.length ? bnBenefits : benefits;
  const left = list.slice(0, Math.ceil(list.length / 2));
  const right = list.slice(Math.ceil(list.length / 2));

  const tile = (b: Benefit, i: number) => (
    <RevealItem key={`${i}-${b.title}`} as="li">
      <TiltCard intensity={10} innerClassName="group rounded-3xl">
        <div className="preserve-3d relative flex min-h-[7rem] gap-4 rounded-3xl bg-gradient-to-br from-cream-50/[0.09] to-cream-50/[0.02] p-5 ring-1 ring-cream-50/12 backdrop-blur-md transition-colors duration-500 group-hover:ring-gold-400/40">
          <span aria-hidden="true" className="absolute right-4 top-2 font-display text-5xl leading-none text-cream-50/[0.06]">
            {bn ? bnDigits(String(i + 1).padStart(2, "0")) : String(i + 1).padStart(2, "0")}
          </span>
          <Depth z={50} className="shrink-0">
            <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-300 to-gold-500 text-forest-950 shadow-[0_12px_24px_-8px_rgba(232,207,135,0.55)]">
              <BenefitIcon icon={b.icon} className="h-6 w-6" />
            </span>
          </Depth>
          <Depth z={28}>
            <p className="text-[0.9375rem] font-semibold text-cream-50">{b.title}</p>
            <p className="mt-1 text-[0.8125rem] leading-relaxed text-cream-200/65">{b.description}</p>
          </Depth>
        </div>
      </TiltCard>
    </RevealItem>
  );

  return (
    <section
      id="why-own"
      translate={bn && list === bnBenefits ? "no" : undefined}
      className={cn("relative scroll-mt-20 overflow-hidden bg-forest-950 py-20 text-cream-100 sm:py-28 lg:py-32", bn && "font-bangla")}
    >
      <div className="bg-leaf-swirl-light absolute inset-0 opacity-70" aria-hidden="true" />
      {/* Perspective grid floor */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[30rem] [perspective:900px]">
        <div className="absolute inset-x-[-25%] bottom-0 h-full origin-bottom bg-[linear-gradient(rgba(232,207,135,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(232,207,135,0.12)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_top,black,transparent)] [transform:rotateX(62deg)]" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <Container className="relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className={cn(bn ? "text-sm font-medium" : "text-eyebrow", "text-gold-400")}>{t.eyebrow}</p>
          <h2 className={cn("mt-4 text-balance text-cream-50", bn ? "text-4xl font-semibold leading-snug sm:text-5xl" : "font-display text-display-md")}>
            {t.title} <span className={cn("text-gold-300", !bn && "italic")}>{t.accent}</span>
          </h2>
          <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">{t.lede}</p>
        </Reveal>

        <div className="mt-14 grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
          <RevealGroup amount={0.08} as="ol" className="grid gap-5">
            {left.map((b, i) => tile(b, i))}
          </RevealGroup>

          {/* The share itself: a floating 3D emblem the benefits orbit */}
          <div aria-hidden="true" className="relative mx-auto hidden h-80 w-72 items-center justify-center lg:flex [perspective:1000px]">
            <motion.div
              animate={reduced ? undefined : { rotateY: [-18, 18, -18], y: [0, -12, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              className="preserve-3d relative h-64 w-48"
            >
              {[0, 1, 2].map((k) => (
                <div
                  key={k}
                  className="absolute inset-0 rounded-[2rem] ring-1 ring-gold-300/30"
                  style={{
                    transform: `translateZ(${-k * 26}px)`,
                    background: k === 0 ? "linear-gradient(145deg,#1c5a43,#0b2a20)" : "rgba(232,207,135,0.06)",
                    boxShadow: k === 0 ? "0 40px 80px -30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.15)" : undefined,
                  }}
                />
              ))}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ transform: "translateZ(40px)" }}>
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-gold-200 to-gold-500 text-forest-950 shadow-[0_18px_40px_-12px_rgba(232,207,135,0.7)]">
                  <BenefitIcon icon="key" className="h-9 w-9" />
                </span>
                <span className="mt-5 text-xl font-semibold text-cream-50">{t.center}</span>
                <span className="mt-1 text-xs text-gold-300">{t.centerSub}</span>
              </div>
            </motion.div>
            <span className="absolute bottom-2 left-1/2 h-5 w-40 -translate-x-1/2 rounded-[50%] bg-black/50 blur-lg" />
          </div>

          <RevealGroup amount={0.08} as="ol" className="grid gap-5">
            {right.map((b, i) => tile(b, i + left.length))}
          </RevealGroup>
        </div>
      </Container>
    </section>
  );
}
