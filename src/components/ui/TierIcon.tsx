import { cn } from "@/lib/utils";

/**
 * A soft circular icon badge per ownership tier — the round leaf/shield/crown
 * avatars from the original investment-page mockup, redrawn as inline SVG so
 * they recolour per tier instead of being baked-in artwork.
 */
const glyphs: Record<string, React.ReactNode> = {
  executive: (
    <path
      d="M12 4c-3 3-4 6-4 9a4 4 0 0 0 8 0c0-3-1-6-4-9Z"
      fill="currentColor"
    />
  ),
  premium: (
    <path
      d="M12 3c-2.5 2.5-3.5 5-3.5 7.5a3.5 3.5 0 0 0 7 0c0-2.5-1-5-3.5-7.5Zm-5 8c-1.5 1.5-2 3-2 4.5a2 2 0 0 0 4 0c0-1.5-.5-3-2-4.5Zm10 0c-1.5 1.5-2 3-2 4.5a2 2 0 0 0 4 0c0-1.5-.5-3-2-4.5Z"
      fill="currentColor"
    />
  ),
  platinum: (
    <path
      d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
      fill="currentColor"
    />
  ),
  royal: (
    <path
      d="M4 8l3.5 2.5L12 5l4.5 5.5L20 8l-1.5 9h-13L4 8Zm3 10.5h10V20H7v-1.5Z"
      fill="currentColor"
    />
  ),
};

export function TierIcon({
  tierId,
  color,
  size = "md",
  className,
}: {
  tierId: string;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = { sm: "h-8 w-8", md: "h-11 w-11", lg: "h-14 w-14" }[size];
  const glyph = glyphs[tierId] ?? glyphs.executive;

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full",
        dims,
        className,
      )}
      style={{
        background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${color} 35%, white), color-mix(in oklab, ${color} 18%, transparent))`,
        boxShadow: `inset 0 1px 1px color-mix(in oklab, white 60%, transparent), inset 0 -3px 6px color-mix(in oklab, ${color} 40%, transparent), 0 4px 10px -4px color-mix(in oklab, ${color} 55%, transparent)`,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className={size === "sm" ? "h-4 w-4" : size === "lg" ? "h-7 w-7" : "h-5 w-5"}
        style={{ color }}
        aria-hidden="true"
      >
        {glyph}
      </svg>
    </span>
  );
}
