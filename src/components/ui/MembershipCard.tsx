import Link from "next/link";
import { formatBDT } from "@/lib/shares";
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

/** The membership tier card used in the 3D carousel and the plans grid. */
export function MembershipCard({
  plan,
  isActive = true,
  className,
}: {
  plan: MembershipCardData;
  isActive?: boolean;
  className?: string;
}) {
  const range = plan.maxUnits ? `${plan.minUnits}–${plan.maxUnits}` : `${plan.minUnits}+`;

  return (
    <div
      className={cn(
        "relative flex h-[26rem] w-[19rem] flex-col overflow-hidden rounded-[1.75rem] p-7 shadow-float backface-hidden sm:w-[21rem]",
        className,
      )}
      style={{
        background: `linear-gradient(155deg, #0b3527 0%, #062a1f 55%, #041a14 100%)`,
        boxShadow: isActive
          ? `0 30px 70px -20px ${plan.accentColor}55, 0 8px 24px -8px rgba(0,0,0,0.5)`
          : undefined,
      }}
    >
      {/* Gold foil corner accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-2xl"
        style={{ background: plan.accentColor }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)",
        }}
      />

      {plan.featured && (
        <span className="relative z-10 mb-4 inline-flex w-fit rounded-full bg-gold-500 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-forest-950">
          Most selected
        </span>
      )}

      <span
        className="relative z-10 h-1 w-10 rounded-full"
        style={{ background: plan.accentColor }}
      />

      <h3 className="relative z-10 mt-4 font-display text-3xl text-cream-50">
        {plan.name}
      </h3>
      <p className="relative z-10 mt-1 text-[0.8125rem] text-cream-200/60">
        {plan.subtitle}
      </p>

      <dl className="relative z-10 mt-6 space-y-3.5 text-[0.8125rem]">
        <div className="flex items-baseline justify-between border-b border-cream-50/10 pb-3">
          <dt className="text-cream-200/45">Unit shares</dt>
          <dd className="font-numeral text-cream-50">{range}</dd>
        </div>
        <div className="flex items-baseline justify-between border-b border-cream-50/10 pb-3">
          <dt className="text-cream-200/45">Free stay / year</dt>
          <dd className="font-numeral text-cream-50">{plan.freeStayNights} nights</dd>
        </div>
        <div className="flex items-baseline justify-between border-b border-cream-50/10 pb-3">
          <dt className="text-cream-200/45">Discount</dt>
          <dd className="font-numeral text-cream-50">
            {plan.discountPercent > 0 ? `${plan.discountPercent}%` : "Regular price"}
          </dd>
        </div>
      </dl>

      <div className="relative z-10 mt-auto pt-6">
        <p className="text-[0.625rem] uppercase tracking-[0.12em] text-cream-200/40">
          From, per unit share
        </p>
        <p className="mt-1 font-numeral text-2xl text-cream-50">
          {formatBDT(plan.unitPriceBDT)}
          <span className="ml-1.5 text-xs font-normal text-cream-200/40">indicative</span>
        </p>

        <Link
          href={`/ownership?plan=${plan.slug}#calculator`}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-cream-50 text-sm font-medium text-forest-800 transition-colors hover:bg-white"
        >
          Calculate this plan
        </Link>
      </div>
    </div>
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
