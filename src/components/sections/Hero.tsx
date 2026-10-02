"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button, ArrowRight } from "@/components/ui/Button";
import { HeroLeaves } from "@/components/three/HeroLeaves";
import { Container } from "@/components/ui/Section";
import { Num } from "@/components/ui/Number";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * The landing hero.
 *
 * Four depth planes, each moving at its own rate against the scroll: the
 * render, the WebGL leaf field, the copy, and the fact strip. The result reads
 * as a camera pulling back rather than a page scrolling.
 */
export function Hero({
  eyebrow,
  title,
  titleAccent,
  lede,
  image,
  imageAlt,
  facts,
  actions,
  height = "full",
  leaves = true,
  bangla = false,
  accentStyle = "block",
}: {
  /** Optional line above the title; omitted when empty. */
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  /** "block" sets the accent as large as the title; "line" keeps it to one line under it. */
  accentStyle?: "block" | "line";
  lede?: string;
  image: string;
  imageAlt: string;
  facts?: { value: string; label: string }[];
  actions?: { label: string; href: string; variant?: "light" | "outline-light" }[];
  height?: "full" | "tall" | "short";
  leaves?: boolean;
  /** Copy is hand-written Bangla: set it in the Bangla face and keep the auto-translator off it. */
  bangla?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.06, 1.2]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-38%"]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const leafOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const heights = {
    full: "min-h-[100svh]",
    tall: "min-h-[82svh]",
    short: "min-h-[64svh]",
  };

  return (
    <section
      ref={ref}
      translate={bangla ? "no" : undefined}
      className={cn(
        bangla && "font-bangla",
        "relative flex items-end overflow-hidden bg-forest-950",
        heights[height],
      )}
    >
      {/* Plane 1 — the render */}
      <motion.div
        style={{ y: imageY, scale: imageScale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          // Admin-supplied images may be absolute URLs that aren't in the image config.
          unoptimized={/^https?:/.test(image)}
          sizes="100vw"
          className="object-cover"
        />
      </motion.div>

      {/* Grading: darken top for the nav, bottom for the copy */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/75 via-forest-950/25 to-forest-950/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-forest-950/30 to-transparent" />

      {/* Plane 2 — drifting leaves */}
      {leaves && (
        <motion.div
          style={{ opacity: leafOpacity }}
          className="pointer-events-none absolute inset-0"
        >
          <HeroLeaves className="h-full w-full" />
        </motion.div>
      )}

      {/* Plane 3 — copy */}
      <motion.div
        style={{ y: copyY, opacity: copyOpacity }}
        className="relative z-10 w-full pb-14 pt-32 sm:pb-20"
      >
        <Container>
          <div className={accentStyle === "line" ? "max-w-5xl" : "max-w-3xl"}>
            {eyebrow && (
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: easeOutExpo, delay: 0.1 }}
                className="mb-5 text-eyebrow text-gold-400"
              >
                {eyebrow}
              </motion.p>
            )}

            <h1 className={cn("text-balance text-cream-50", bangla ? "text-[clamp(2.6rem,7vw,5.5rem)] font-semibold leading-[1.15]" : "font-display text-display-xl")}>
              {title.split(" ").map((word, i) => (
                <span key={i} className="inline-block overflow-hidden">
                  <motion.span
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.95,
                      ease: easeOutExpo,
                      delay: 0.18 + i * 0.055,
                    }}
                    className="inline-block"
                  >
                    {word}&nbsp;
                  </motion.span>
                </span>
              ))}
              {titleAccent && (
                <span className="block overflow-hidden">
                  <motion.span
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.95,
                      ease: easeOutExpo,
                      delay: 0.34,
                    }}
                    className={cn(
                      "inline-block font-display font-medium tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]",
                      accentStyle === "line"
                        ? // Warm ivory reads clearly over both the dark tea hills and the lit walkway;
                          // the place name after the last comma is picked out in bright gold.
                          "mt-2.5 text-[clamp(1.35rem,3.7vw,3.1rem)] font-semibold leading-tight text-[#FFF3D6] [text-shadow:0_1px_2px_rgba(0,0,0,0.55)]"
                        : "text-gold-300",
                    )}
                  >
                    {accentStyle === "line" && titleAccent.includes(", ") ? (
                      <>
                        <span className="sm:whitespace-nowrap">{titleAccent.slice(0, titleAccent.lastIndexOf(", ") + 1)}</span>{" "}
                        <span className="whitespace-nowrap text-[#F7C948]">{titleAccent.slice(titleAccent.lastIndexOf(", ") + 2)}</span>
                      </>
                    ) : (
                      titleAccent
                    )}
                  </motion.span>
                </span>
              )}
            </h1>

            {lede && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.5 }}
                className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-cream-100/80"
              >
                {lede}
              </motion.p>
            )}

            {actions && actions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: easeOutExpo, delay: 0.62 }}
                className="mt-9 flex flex-wrap gap-3"
              >
                {actions.map((a) => (
                  <Button
                    key={a.href}
                    href={a.href}
                    variant={a.variant ?? "light"}
                    size="lg"
                  >
                    {a.label}
                    <ArrowRight />
                  </Button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Plane 4 — fact strip */}
          {facts && facts.length > 0 && (
            <motion.dl
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: easeOutExpo, delay: 0.78 }}
              className={cn(
                "mt-14 grid gap-px overflow-hidden rounded-2xl border border-cream-50/30 bg-cream-50/20 backdrop-blur-xl shadow-xl",
                facts.length >= 4
                  ? "grid-cols-2 sm:grid-cols-4"
                  : facts.length === 3
                    ? "w-full max-w-md grid-cols-3"
                    : facts.length === 1
                      ? "w-fit min-w-[16rem] grid-cols-1"
                      : "max-w-2xl grid-cols-1 sm:grid-cols-[1.5fr_1fr]",
              )}
            >
              {facts.map((f) => (
                <div key={f.label} className="bg-forest-950/60 px-5 py-5">
                  <Num as="dt" size="lg" className="text-cream-50 font-semibold drop-shadow-md">
                    {f.value}
                  </Num>
                  <dd className="mt-1 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-cream-200/90 drop-shadow-sm">
                    {f.label}
                  </dd>
                </div>
              ))}
            </motion.dl>
          )}
        </Container>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: copyOpacity }}
        className="pointer-events-none absolute bottom-6 right-6 z-10 hidden items-center gap-2 text-[0.625rem] uppercase tracking-[0.24em] text-cream-100/50 sm:flex"
      >
        Scroll
        <span className="relative block h-9 w-px overflow-hidden bg-cream-100/25">
          <motion.span
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 block h-1/2 bg-gold-400"
          />
        </span>
      </motion.div>
    </section>
  );
}
