"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Pointer-tracked 3D tilt with a travelling specular highlight.
 *
 * Children wrapped in <Depth> lift off the card surface as it rotates, which
 * is what sells the effect. Falls back to a flat card under reduced motion.
 */
export function TiltCard({
  className,
  innerClassName,
  intensity = 9,
  glare = true,
  children,
}: {
  className?: string;
  innerClassName?: string;
  intensity?: number;
  glare?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const rotateX = useSpring(tiltX, SPRING);
  const rotateY = useSpring(tiltY, SPRING);

  const glareX = useSpring(pointerX, SPRING);
  const glareY = useSpring(pointerY, SPRING);
  const glareLeft = useTransform(glareX, (v) => `${v * 100}%`);
  const glareTop = useTransform(glareY, (v) => `${v * 100}%`);
  const glareBackground = useMotionTemplate`radial-gradient(55% 55% at ${glareLeft} ${glareTop}, rgba(255,255,255,0.75), transparent 72%)`;

  function handleMove(event: React.PointerEvent<HTMLDivElement>) {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    pointerX.set(x);
    pointerY.set(y);
    tiltY.set((x - 0.5) * intensity * 2);
    tiltX.set((0.5 - y) * intensity * 2);
  }

  function handleLeave() {
    tiltX.set(0);
    tiltY.set(0);
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const showGlare = glare && !reduced;

  return (
    <div className={cn("perspective-near", className)}>
      <motion.div
        ref={ref}
        onPointerMove={handleMove}
        onPointerLeave={handleLeave}
        style={{ rotateX, rotateY }}
        className={cn("preserve-3d relative h-full w-full", innerClassName)}
      >
        {children}
        {showGlare && (
          <motion.span
            aria-hidden="true"
            style={{ background: glareBackground }}
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
      </motion.div>
    </div>
  );
}

/** Lift a child off the tilt surface along Z. */
export function Depth({
  z = 40,
  className,
  children,
}: {
  z?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn("preserve-3d", className)}
      style={{ transform: `translateZ(${z}px)` }}
    >
      {children}
    </div>
  );
}
