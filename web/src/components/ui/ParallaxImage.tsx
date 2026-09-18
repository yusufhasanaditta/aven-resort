"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Scroll-linked parallax on a fixed-ratio frame. The image is oversized and
 * drifts against the frame, so stacked sections read as separate depth planes.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  imageClassName,
  distance = 12,
  scale = 1.18,
  priority = false,
  sizes = "100vw",
  overlay,
}: {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  /** Travel as a percentage of frame height. */
  distance?: number;
  scale?: number;
  priority?: boolean;
  sizes?: string;
  overlay?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${distance}%`, `${distance}%`],
  );

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-forest-900", className)}
    >
      <motion.div
        style={{ y, scale }}
        className="absolute inset-0 will-change-transform"
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={cn("object-cover", imageClassName)}
        />
      </motion.div>
      {overlay}
    </div>
  );
}
