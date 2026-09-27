import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The AVEN logo, from `new ui design/logo/`. The supplied artwork is white
 * lettering over a sky photo; the sky was keyed out into transparent PNGs in
 * `public/brand/` — a white version for dark backgrounds and a forest-green
 * one for light backgrounds — so the logo sits on any surface with no box.
 */
export function Logo({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <Image
      src={tone === "light" ? "/brand/aven-logo-white.png" : "/brand/aven-logo-dark.png"}
      alt="AVEN Eco Luxury Resort and Wellness"
      width={1034}
      height={320}
      priority
      className={cn("h-11 w-auto select-none sm:h-12", className)}
    />
  );
}

/**
 * Just the "A" with its wave lines, cut from the same artwork. Drawn as a CSS
 * mask so it takes any colour — the membership cards tint it to their ink.
 */
export function LogoMark({
  className,
  tone = "brand",
  color,
}: {
  className?: string;
  tone?: "brand" | "light" | "gold";
  /** Override the mark's colour, e.g. to match a membership card's ink. */
  color?: string;
}) {
  const ink = color ?? (tone === "light" ? "#FAF8F2" : tone === "gold" ? "#E8CF87" : "#0B4332");
  const mask = "url(/brand/aven-mark.png) center / contain no-repeat";
  return (
    <span
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
      style={{ backgroundColor: ink, mask, WebkitMask: mask }}
    />
  );
}
