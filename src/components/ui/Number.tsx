import { cn } from "@/lib/utils";

/**
 * Renders numeric content — stats, figures, indices — in the sans face with
 * tabular lining numerals, instead of the serif display font.
 *
 * Cormorant Garamond (the site's display serif) draws bold figures as
 * old-style numerals: uneven baseline, inconsistent stroke weight. That reads
 * beautifully in a headline and badly as "10.80 Acres" or "60% discount".
 * Every number presented as a fact — not as part of a sentence — should go
 * through this component rather than sitting under `font-display` directly.
 */
const sizes = {
  "2xs": "text-xs",
  xs: "text-sm",
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
  xl: "text-4xl",
  "2xl": "text-5xl",
} as const;

export function Num({
  as: Component = "span",
  size = "lg",
  className,
  children,
}: {
  as?: "span" | "p" | "dt" | "div";
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Component className={cn("font-numeral", sizes[size], className)}>
      {children}
    </Component>
  );
}
