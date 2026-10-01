import "server-only";
import { prisma } from "@/lib/db";
import { fallbackPlans, type FallbackPlan } from "@/data/planFallback";

/**
 * The membership plans as priced in admin → Packages, for server-rendered
 * pages. Falls back to the brochure figures only if the database has none
 * or can't be reached, so a page never renders without plans.
 */
export async function getPlans(): Promise<FallbackPlan[]> {
  try {
    const rows = await prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.length ? rows : fallbackPlans;
  } catch {
    return fallbackPlans;
  }
}
