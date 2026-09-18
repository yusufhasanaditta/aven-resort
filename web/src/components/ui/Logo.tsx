import { cn } from "@/lib/utils";

/**
 * The AVEN mark: a leaf pair with a gold seed, redrawn as inline SVG from the
 * logo in the UI Design mockups so it stays crisp and recolourable.
 */
export function LogoMark({
  className,
  tone = "brand",
}: {
  className?: string;
  tone?: "brand" | "light";
}) {
  const leafDark = tone === "light" ? "#FAF8F2" : "#0E4D38";
  const leafMid = tone === "light" ? "#C9E0D2" : "#7FA650";
  const seed = tone === "light" ? "#E8CF87" : "#C9A227";

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <path
        d="M20 36C20 26.5 14.8 18.6 6.4 15.2 4.6 24.4 9.8 34.2 20 36Z"
        fill={leafMid}
      />
      <path
        d="M20 36C20 23.4 26 12.4 35.6 7 38.4 19.6 31.6 32.2 20 36Z"
        fill={leafDark}
      />
      <path
        d="M20 36C20 29 17.4 22.6 12.8 18"
        stroke={leafDark}
        strokeOpacity="0.35"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      <circle cx="12.2" cy="10.4" r="4.2" fill={seed} />
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
            "font-display text-xl font-semibold tracking-[0.14em]",
            tone === "light" ? "text-cream-50" : "text-forest-700",
          )}
        >
          AVEN
        </span>
        <span
          className={cn(
            "mt-0.5 text-[0.5rem] font-semibold tracking-[0.34em]",
            tone === "light" ? "text-cream-200/80" : "text-forest-600/65",
          )}
        >
          TEA EMPIRE
        </span>
      </span>
    </span>
  );
}
