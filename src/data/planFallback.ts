import { ownershipTiers } from "./ownership";

/**
 * Static stand-in for `MembershipPlan` rows, used only when `/api/plans`
 * fails or returns nothing — e.g. a fresh deploy whose database hasn't been
 * migrated/seeded yet. Every plan-driven UI (the calculator, the carousel)
 * must always have *something* to render; a blank or perpetually-loading
 * state is what actually causes "the buttons don't work" reports, since
 * nothing downstream can render without a plan list.
 */
export type FallbackPlan = {
  id: string;
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
  sortOrder: number;
};

const UNIT_RANGE = /(\d+)\s*(?:[-–]\s*(\d+))?/;

export const fallbackPlans: FallbackPlan[] = ownershipTiers.map((t, i) => {
  const match = t.unitShare.match(UNIT_RANGE);
  return {
    id: `fallback-${t.id}`,
    slug: t.id,
    name: t.name,
    subtitle: t.subtitle,
    minUnits: match ? Number(match[1]) : 1,
    maxUnits: match?.[2] ? Number(match[2]) : null,
    unitPriceBDT: 500_000,
    freeStayNights: Number(t.freeStay.match(/\d+/)?.[0] ?? 0),
    discountPercent: Number(t.discount.match(/\d+/)?.[0] ?? 0),
    accentColor: t.accent,
    featured: t.featured,
    sortOrder: i,
  };
});
