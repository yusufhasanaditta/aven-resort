/**
 * Pure share-calculator math, shared by the interactive calculator (client)
 * and the order-creation route (server) so the number a shareholder sees
 * before paying is exactly the number they're charged.
 *
 * Deliberately structural rather than importing Prisma's `MembershipPlan`
 * type: the calculator also has to run against the static fallback plan data
 * (see `src/data/planFallback.ts`) when the database is unavailable, and both
 * shapes satisfy this interface.
 */

export type PlanLike = {
  id: string;
  slug: string;
  minUnits: number;
  maxUnits: number | null;
  unitPriceBDT: number;
  freeStayNights: number;
  discountPercent: number;
};

export type InstallmentLine = {
  index: number;
  label: string;
  amountBDT: number;
  dueLabel: string;
};

export type CalculatorResult<T extends PlanLike = PlanLike> = {
  plan: T;
  units: number;
  /** Units × unit price, before the plan discount. */
  grossBDT: number;
  /** What the plan discount takes off `grossBDT`. */
  savingsBDT: number;
  /** The amount actually charged. */
  totalBDT: number;
  freeStayNights: number;
  discountPercent: number;
  installments: InstallmentLine[] | null;
};

/** Total unit shares issued for the project, per the brochure fact sheet. */
export const TOTAL_SHARES = 2000;

/**
 * Which tier a given unit count falls into.
 *
 * Plans are contiguous ranges (1–2, 3–4, 5–9, 10–19, 20–29, 30+), so the match is whichever
 * range contains `units`; below the lowest range, the lowest tier applies —
 * above the highest (unbounded) range, the highest tier applies.
 */
export function planForUnits<T extends PlanLike>(plans: T[], units: number): T {
  const sorted = [...plans].sort((a, b) => a.minUnits - b.minUnits);
  const inRange = sorted.find(
    (plan) => units >= plan.minUnits && (plan.maxUnits === null || units <= plan.maxUnits),
  );
  if (inRange) return inRange;
  return units < sorted[0].minUnits ? sorted[0] : sorted[sorted.length - 1];
}

export function buildInstallmentSchedule(
  totalBDT: number,
  months: number,
  start: Date = new Date(),
): InstallmentLine[] {
  const now = start;
  const base = Math.floor(totalBDT / months);
  const remainder = totalBDT - base * months;

  return Array.from({ length: months }, (_, i) => {
    const due = new Date(now.getFullYear(), now.getMonth() + i, 1);
    return {
      index: i + 1,
      label: i === 0 ? "Booking installment" : `Installment ${i + 1}`,
      amountBDT: i === months - 1 ? base + remainder : base,
      dueLabel: due.toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      }),
    };
  });
}

export function calculate<T extends PlanLike>(
  plans: T[],
  units: number,
  paymentPlan: "FULL" | "INSTALLMENT",
  installmentMonths?: number,
): CalculatorResult<T> {
  const safeUnits = Math.max(1, Math.round(units));
  const plan = planForUnits(plans, safeUnits);
  // The brochure prices each plan against the regular share price —
  // "1–2 Shares | Regular Price", "3 Shares | 5% Discount" and so on — so the
  // plan discount comes off the share total itself.
  const grossBDT = plan.unitPriceBDT * safeUnits;
  const totalBDT = Math.round(grossBDT * (1 - plan.discountPercent / 100));

  return {
    plan,
    units: safeUnits,
    grossBDT,
    savingsBDT: grossBDT - totalBDT,
    totalBDT,
    freeStayNights: plan.freeStayNights,
    discountPercent: plan.discountPercent,
    installments:
      paymentPlan === "INSTALLMENT" && installmentMonths
        ? buildInstallmentSchedule(totalBDT, installmentMonths)
        : null,
  };
}

export function formatBDT(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** The brochure counts free stay in days ("Free Stay 3 Days"); the schema stores nights. */
export function stayDays(freeStayNights: number): number {
  return freeStayNights + 1;
}

/** A holding's slice of the whole project, as a percentage of all issued shares. */
export function ownershipPercent(units: number): number {
  return (units / TOTAL_SHARES) * 100;
}

/** Due date of instalment `n` (1-based) for a holding opened on `openedAt`. */
export function installmentDueDate(openedAt: Date, n: number): Date {
  return new Date(openedAt.getFullYear(), openedAt.getMonth() + n - 1, 1);
}

/** Short form in the lakh/crore notation used in Bangladesh, e.g. "৳39.5 L", "৳1.25 Cr". */
export function formatBDTCompact(amount: number): string {
  const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, "");
  if (amount >= 10_000_000) return `৳${trim(amount / 10_000_000)} Cr`;
  if (amount >= 100_000) return `৳${trim(amount / 100_000)} L`;
  return formatBDT(amount);
}
