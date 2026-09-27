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
  fullPriceBDT: number;
  downPaymentBDT: number;
  installmentCount: number;
  freeStayNights: number;
  accentColor: string;
  featured: boolean;
  sortOrder: number;
};

export const fallbackPlans: FallbackPlan[] = ownershipTiers.map((t, i) => ({
  id: `fallback-${t.id}`,
  slug: t.id,
  name: t.name,
  subtitle: t.subtitle,
  minUnits: t.minUnits,
  maxUnits: t.maxUnits,
  unitPriceBDT: t.installmentPriceBDT,
  fullPriceBDT: t.fullPriceBDT,
  downPaymentBDT: t.downPaymentBDT,
  installmentCount: t.installmentCount,
  // The chart counts free stay in days; the schema stores nights.
  freeStayNights: t.freeStayDays - 1,
  accentColor: t.accent,
  featured: t.featured,
  sortOrder: i,
}));
