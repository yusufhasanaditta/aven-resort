import { cn } from "@/lib/utils";

/**
 * Soft, beveled circular icon tile — the shared visual language behind
 * `TierIcon`, the admin stat cards and the account page. A radial highlight
 * plus an inset+drop shadow pair gives it the gentle "soft 3D" read from the
 * original mockups' isometric icon badges, without needing actual artwork.
 */
export function IconTile({
  color,
  size = "md",
  className,
  children,
}: {
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  const dims = { sm: "h-9 w-9", md: "h-11 w-11", lg: "h-14 w-14" }[size];

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-2xl",
        dims,
        className,
      )}
      style={{
        background: `radial-gradient(circle at 32% 28%, color-mix(in oklab, ${color} 30%, white), color-mix(in oklab, ${color} 14%, transparent))`,
        boxShadow: `inset 0 1px 1px color-mix(in oklab, white 55%, transparent), inset 0 -3px 6px color-mix(in oklab, ${color} 35%, transparent), 0 4px 10px -5px color-mix(in oklab, ${color} 50%, transparent)`,
        color,
      }}
    >
      {children}
    </span>
  );
}
