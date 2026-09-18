import type { Variants, Transition } from "framer-motion";

export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeInOutQuint = [0.83, 0, 0.17, 1] as const;

export const springSoft: Transition = {
  type: "spring",
  stiffness: 120,
  damping: 20,
  mass: 0.8,
};

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** Standard reveal — used by <Reveal> and most section headers. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOutExpo },
  },
};

/** Reveal with a touch of Z, so cards rise toward the viewer. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 40, rotateX: 8, transformPerspective: 1200 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.9, ease: easeOutExpo },
  },
};

export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren, delayChildren } },
});

export const viewportOnce = { once: true, margin: "-12% 0px -12% 0px" } as const;
