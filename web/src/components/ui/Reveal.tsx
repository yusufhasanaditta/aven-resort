"use client";

import { motion, type Variants } from "framer-motion";
import { fadeUp, riseIn, stagger, viewportOnce } from "@/lib/motion";

const presets: Record<string, Variants> = { fadeUp, riseIn };

/** Scroll-triggered reveal. `rise` adds a subtle X-axis rotation. */
export function Reveal({
  as = "div",
  preset = "fadeUp",
  delay = 0,
  className,
  children,
}: {
  as?: "div" | "li" | "section" | "article" | "span";
  preset?: "fadeUp" | "riseIn";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const Component = motion[as];
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={presets[preset]}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Wrap a list to stagger its <Reveal> children. */
export function RevealGroup({
  as = "div",
  amount = 0.08,
  delayChildren = 0,
  className,
  children,
}: {
  as?: "div" | "ul" | "ol";
  amount?: number;
  delayChildren?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const Component = motion[as];
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(amount, delayChildren)}
      className={className}
    >
      {children}
    </Component>
  );
}

/** Child of RevealGroup — inherits the stagger timing. */
export function RevealItem({
  as = "div",
  preset = "fadeUp",
  className,
  children,
}: {
  as?: "div" | "li" | "article";
  preset?: "fadeUp" | "riseIn";
  className?: string;
  children: React.ReactNode;
}) {
  const Component = motion[as];
  return (
    <Component variants={presets[preset]} className={className}>
      {children}
    </Component>
  );
}

/** Word-by-word reveal for display headlines. */
export function RevealWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      variants={stagger(0.045, delay)}
      className={className}
    >
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "105%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
            {i < words.length - 1 && " "}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
