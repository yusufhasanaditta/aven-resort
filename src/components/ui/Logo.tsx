import { cn } from "@/lib/utils";

/**
 * The AVEN mark: a high-contrast "A" with three wave lines running through
 * its base — the hills and tea terraces — redrawn as inline SVG from the
 * brochure cover so it stays crisp and recolourable.
 */
export function LogoMark({
  className,
  tone = "brand",
  color,
  wave,
}: {
  className?: string;
  tone?: "brand" | "light" | "gold";
  /** Override the whole mark's colour, e.g. to match a membership card's ink. */
  color?: string;
  /** Override the wave colour, e.g. to tint the mark per membership plan. */
  wave?: string;
}) {
  const ink = color ?? (tone === "light" ? "#FAF8F2" : tone === "gold" ? "#E8CF87" : "#0B4332");
  const waves = wave ?? (tone === "brand" && !color ? "#0E4D38" : ink);

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      {/* Thin left leg, heavy right leg, like a Didone capital */}
      <path d="M19.6 4.5 7.6 35.5" stroke={ink} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M19 3.6h2.4L34 35.6h-4.4L19 3.6Z" fill={ink} />
      <path d="M4.8 35.6h5.8M27.8 35.6h8.6" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
      {/* Hills & terraces */}
      <g stroke={waves} strokeWidth="1.25" strokeLinecap="round">
        <path d="M11.8 24.6c2.4-2.3 4.8-2.3 7.2 0s4.8 2.3 7.2 0" />
        <path d="M10.2 28.4c2.8-2.5 5.6-2.5 8.4 0s5.6 2.5 8.4 0 2.2-1.4 3-1" />
        <path d="M8.6 32.2c3.2-2.7 6.4-2.7 9.6 0s6.4 2.7 9.6 0c1.2-1 2.4-1.3 3.6-1" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "light";
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <span className="h-9 w-9 shrink-0">
        <LogoMark tone={tone} />
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[1.375rem] font-medium tracking-[0.3em]",
            tone === "light" ? "text-cream-50" : "text-forest-800",
          )}
        >
          AVEN
        </span>
        <span
          className={cn(
            "mt-1 whitespace-nowrap text-[0.46875rem] font-semibold tracking-[0.2em] sm:tracking-[0.28em]",
            tone === "light" ? "text-cream-200/80" : "text-forest-600/65",
          )}
        >
          ECO LUXURY RESORT
        </span>
      </span>
    </span>
  );
}
