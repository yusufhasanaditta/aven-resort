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

/** Placeholder until Aven Limited confirms unit pricing — mirrors `prisma/seed.ts`. */
export const PLACEHOLDER_UNIT_PRICE_BDT = 500_000;

export const fallbackPlans: FallbackPlan[] = ownershipTiers.map((t, i) => ({
  id: `fallback-${t.id}`,
  slug: t.id,
  name: t.name,
  subtitle: t.subtitle,
  minUnits: t.minUnits,
  maxUnits: t.maxUnits,
  unitPriceBDT: PLACEHOLDER_UNIT_PRICE_BDT,
  // The brochure counts free stay in days; the schema stores nights.
  freeStayNights: t.freeStayDays - 1,
  discountPercent: t.discountPercent,
  accentColor: t.accent,
  featured: t.featured,
  sortOrder: i,
}));
