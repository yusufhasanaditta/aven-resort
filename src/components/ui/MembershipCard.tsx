import { LogoMark } from "@/components/ui/Logo";
import { stayDays } from "@/lib/shares";
import { cn } from "@/lib/utils";

export type MembershipCardData = {
  slug: string;
  name: string;
  subtitle: string;
  minUnits: number;
  maxUnits: number | null;
  unitPriceBDT: number;
  freeStayNights: number;
  discountPercent: number;
  accentColor: string;
  featured: boolean;
};

type CardTheme = {
  bg: string;
  ink: string;
  strip: string;
  patternStroke: string;
  pattern: keyof typeof patterns;
  glyph?: "diamond" | "crown";
  perk?: string;
};

/** 40×40 tiles for the right-hand panel, one per plan, as on the brochure cards. */
const patterns = {
  swirl:
    "M20 20C10 14 8 4 16 0M20 20c10 6 12 16 4 20M20 20c-6 10-16 12-20 4M20 20c6-10 16-12 20-4",
  chevron: "M0 10 10 0l10 10L30 0l10 10M0 30l10-10 10 10 10-10 10 10M0 20l10-10 10 10 10-10 10 10",
  cube: "M20 0 37.3 10v20L20 40 2.7 30V10ZM20 20v20M20 20 2.7 10M20 20l17.3-10",
  lattice: "M0 0 20 40 40 0M0 40 20 0l20 40M0 20h40",
  hex: "M10 0h20l10 20-10 20H10L0 20Z",
};

const themes: Record<string, CardTheme> = {
  executive: { bg: "#2E5A3F", ink: "#D6E6BF", strip: "#6F8F63", patternStroke: "rgba(214,230,191,0.22)", pattern: "swirl" },
  silver: { bg: "#8C8D90", ink: "#17181A", strip: "#B9BABC", patternStroke: "rgba(20,20,22,0.2)", pattern: "swirl" },
  gold: { bg: "#A57A4B", ink: "#F6E7A8", strip: "#E6CF88", patternStroke: "rgba(246,231,168,0.26)", pattern: "chevron" },
  platinum: { bg: "#2B2B2B", ink: "#F5F5F5", strip: "#8E8E8E", patternStroke: "rgba(255,255,255,0.12)", pattern: "cube" },
  diamond: { bg: "#A33D3A", ink: "#F6E3B0", strip: "#D9A68C", patternStroke: "rgba(246,227,176,0.22)", pattern: "lattice", glyph: "diamond" },
  royal: { bg: "#1F1C3D", ink: "#E8CF87", strip: "#8C7A45", patternStroke: "rgba(232,207,135,0.16)", pattern: "hex", glyph: "crown", perk: "100% Villa Ownership" },
};

function themeFor(plan: MembershipCardData): CardTheme {
  return (
    themes[plan.slug] ?? {
      bg: plan.accentColor,
      ink: "#FDFCF8",
      strip: "rgba(253,252,248,0.35)",
      patternStroke: "rgba(253,252,248,0.16)",
      pattern: "swirl",
    }
  );
}

function patternUrl(theme: CardTheme) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'><path d='${patterns[theme.pattern]}' fill='none' stroke='${theme.patternStroke}' stroke-width='1.2'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

function sharesLabel(plan: MembershipCardData) {
  if (plan.maxUnits === null) return `${plan.minUnits}+ Shares`;
  if (plan.maxUnits - plan.minUnits <= 1) return `${plan.minUnits}–${plan.maxUnits} Shares`;
  return `${plan.minUnits} Shares`;
}

/**
 * A membership card in the brochure's design: plan details on the left, a
 * patterned panel carrying the AVEN mark on the right, split by a metallic
 * strip. Pass `holder` to personalise it — the account page shows each
 * shareholder their own card with their name and member number.
 */
export function MembershipCard({
  plan,
  isActive = true,
  holder,
  className,
}: {
  plan: MembershipCardData;
  isActive?: boolean;
  holder?: { name: string; memberId: string };
  className?: string;
}) {
  const t = themeFor(plan);

  return (
    <div
      className={cn(
        "group/card relative flex aspect-[1.62] w-[21rem] overflow-hidden rounded-[1.6rem] backface-hidden sm:w-[25rem]",
        className,
      )}
      style={{
        background: t.bg,
        color: t.ink,
        boxShadow: isActive
          ? `0 34px 70px -24px ${t.bg}, 0 10px 24px -10px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)`
          : "inset 0 1px 0 rgba(255,255,255,0.12)",
      }}
    >
      {/* Left: plan details */}
      <div className="relative z-10 flex w-[58%] flex-col px-6 py-5 sm:px-7 sm:py-6">
        <p className="flex items-center gap-1.5 font-display text-[1.7rem] uppercase leading-none tracking-[0.02em] sm:text-[2rem]">
          {plan.name}
          {t.glyph === "diamond" && <DiamondGlyph />}
          {t.glyph === "crown" && <CrownGlyph />}
        </p>
        <p className="mt-0.5 text-[0.6875rem] opacity-80">Membership</p>
        <span className="mt-2 h-px w-4/5 opacity-50" style={{ background: t.ink }} />

        <p className="mt-3 text-[0.6875rem] font-medium sm:text-xs">
          {sharesLabel(plan)}
        </p>
        {t.perk && <p className="text-[0.6875rem] font-medium sm:text-xs">{t.perk}</p>}

        <div className="mt-auto">
          {holder ? (
            <>
              <p className="truncate text-[0.8125rem] font-semibold uppercase tracking-[0.12em]">
                {holder.name}
              </p>
              <p className="mt-0.5 font-mono text-[0.625rem] tracking-[0.18em] opacity-70">
                {holder.memberId}
              </p>
            </>
          ) : (
            <>
              <p className="text-[0.6875rem] opacity-80">Free Stay</p>
              <p className="font-display text-[1.6rem] leading-none sm:text-[1.8rem]">
                {stayDays(plan.freeStayNights)} Days
              </p>
            </>
          )}
        </div>
      </div>

      {/* Metallic strip */}
      <span aria-hidden="true" className="relative z-10 w-[5px] shrink-0" style={{ background: t.strip }} />

      {/* Right: patterned panel with the mark */}
      <div
        aria-hidden="true"
        className="relative flex flex-1 items-center justify-center"
        style={{ backgroundImage: patternUrl(t), backgroundSize: "30px 30px" }}
      >
        <span className="h-20 w-20 drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] sm:h-24 sm:w-24">
          <LogoMark color={t.ink} />
        </span>
      </div>

      {/* Gloss sweep — a slow light pass across the laminate */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(115deg,transparent_30%,rgba(255,255,255,0.16)_45%,transparent_60%)] bg-[length:250%_100%] bg-[position:120%_0] transition-[background-position] duration-[1400ms] ease-out group-hover/card:bg-[position:-20%_0]"
      />
      {plan.featured && (
        <span className="absolute right-3 top-3 z-30 rounded-full bg-black/25 px-2 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-[0.16em] backdrop-blur">
          Most chosen
        </span>
      )}
    </div>
  );
}

function DiamondGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M6 4h12l4 5-10 12L2 9l4-5Zm-4 5h20M9 4l3 17m3-17-3 17M6 4l3 5m9-5-3 5" strokeLinejoin="round" />
    </svg>
  );
}

function CrownGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
      <path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-1.8 10H4.8L3 8Zm2 11.5h14V21H5v-1.5Z" />
    </svg>
  );
}

/** Compact horizontal variant, used in comparison tables, account summaries and dark result panels. */
export function MembershipBadge({
  plan,
  tone = "light",
}: {
  plan: Pick<MembershipCardData, "name" | "accentColor">;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "dark" ? "bg-cream-50/10 text-cream-50" : "bg-forest-600/8 text-forest-800",
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: plan.accentColor }} />
      {plan.name}
    </span>
  );
}
