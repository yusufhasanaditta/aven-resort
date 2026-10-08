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
  /** Per-share price when paying by installment. */
  unitPriceBDT: number;
  /** Per-share price when paying in full. */
  fullPriceBDT: number;
  /** Down payment for the plan's package size (`minUnits` shares). */
  downPaymentBDT: number;
  /** Monthly installments after the down payment. */
  installmentCount: number;
  freeStayNights: number;
};

export type InstallmentLine = {
  index: number;
  label: string;
  amountBDT: number;
};

export type CalculatorResult<T extends PlanLike = PlanLike> = {
  plan: T;
  units: number;
  paymentPlan: "FULL" | "INSTALLMENT";
  /** Per-share price for the chosen way of paying. */
  pricePerShareBDT: number;
  /** The amount actually charged. */
  totalBDT: number;
  freeStayNights: number;
  /** Installment plans only: the first payment. */
  downPaymentBDT: number | null;
  /** Installment plans only: how many monthly installments follow the down payment. */
  monthlyCount: number | null;
  /** Installment plans only: the regular monthly amount. */
  monthlyBDT: number | null;
  installments: InstallmentLine[] | null;
};

/** Total unit shares issued for the project. */
export const TOTAL_SHARES = 2700;

/**
 * Which plan a given unit count falls into.
 *
 * Plans are contiguous ranges (1–4, 5–9, 10–19, 20–29, 30+), so the match is
 * whichever range contains `units`; below the lowest range, the lowest plan
 * applies — above the highest (unbounded) range, the highest plan applies.
 */
export function planForUnits<T extends PlanLike>(plans: T[], units: number): T {
  const sorted = [...plans].sort((a, b) => a.minUnits - b.minUnits);
  const inRange = sorted.find(
    (plan) => units >= plan.minUnits && (plan.maxUnits === null || units <= plan.maxUnits),
  );
  if (inRange) return inRange;
  return units < sorted[0].minUnits ? sorted[0] : sorted[sorted.length - 1];
}

/**
 * The amount of each scheduled payment.
 *
 * With a down payment, payment 1 is the down payment and the balance is split
 * evenly over the remaining `steps - 1` monthly installments (any rounding
 * remainder lands on the last). Without one — holdings opened before the
 * price chart — the total is split evenly over all `steps`.
 */
export function scheduleAmounts(totalBDT: number, steps: number, downPaymentBDT?: number | null): number[] {
  const split = (amount: number, n: number) => {
    const base = Math.floor(amount / n);
    return Array.from({ length: n }, (_, i) => (i === n - 1 ? amount - base * (n - 1) : base));
  };
  if (downPaymentBDT && steps > 1) return [downPaymentBDT, ...split(totalBDT - downPaymentBDT, steps - 1)];
  return split(totalBDT, Math.max(1, steps));
}

export function buildInstallmentSchedule(
  totalBDT: number,
  steps: number,
  downPaymentBDT?: number | null,
): InstallmentLine[] {
  // Numbered parts only — "Down payment", "1st installment", … — no calendar months.
  return scheduleAmounts(totalBDT, steps, downPaymentBDT).map((amountBDT, i) => ({
    index: i + 1,
    label: downPaymentBDT ? (i === 0 ? "Down payment" : `${ordinal(i)} installment`) : `${ordinal(i + 1)} installment`,
    amountBDT,
  }));
}

/** 1 → "1st", 2 → "2nd", 11 → "11th", 23 → "23rd". */
export function ordinal(n: number): string {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${["th", "st", "nd", "rd"][n % 10] ?? "th"}`;
}

/** Label for scheduled payment `n` (1-based) of a holding: "Down payment", "3rd installment of 15". */
export function installmentLabelFor(n: number, steps: number, hasDownPayment: boolean): string {
  if (!hasDownPayment) return `${ordinal(n)} installment of ${steps}`;
  return n === 1 ? "Down payment" : `${ordinal(n - 1)} installment of ${steps - 1}`;
}

/** Just the part name, without the "of N": "Down payment", "3rd installment". */
export function installmentPartName(n: number, hasDownPayment: boolean): string {
  if (hasDownPayment) return n === 1 ? "Down payment" : `${ordinal(n - 1)} installment`;
  return `${ordinal(n)} installment`;
}

/** The down payment for `units` shares — the chart's package figure, prorated per share. */
export function downPaymentFor(plan: PlanLike, units: number): number {
  return Math.round((plan.downPaymentBDT / Math.max(1, plan.minUnits)) * units);
}

export function calculate<T extends PlanLike>(
  plans: T[],
  units: number,
  paymentPlan: "FULL" | "INSTALLMENT",
): CalculatorResult<T> {
  const safeUnits = Math.max(1, Math.round(units));
  const plan = planForUnits(plans, safeUnits);
  const installment = paymentPlan === "INSTALLMENT";
  const pricePerShareBDT = installment ? plan.unitPriceBDT : plan.fullPriceBDT || plan.unitPriceBDT;
  const totalBDT = pricePerShareBDT * safeUnits;

  const monthlyCount = installment ? Math.max(1, plan.installmentCount) : null;
  const downPaymentBDT = installment ? Math.min(downPaymentFor(plan, safeUnits), totalBDT) : null;
  const installments = installment ? buildInstallmentSchedule(totalBDT, monthlyCount! + 1, downPaymentBDT) : null;

  return {
    plan,
    units: safeUnits,
    paymentPlan,
    pricePerShareBDT,
    totalBDT,
    freeStayNights: plan.freeStayNights,
    downPaymentBDT,
    monthlyCount,
    monthlyBDT: installments ? installments[1]?.amountBDT ?? null : null,
    installments,
  };
}

/**
 * The most an office discount can take off a quote. The down payment stays as
 * it is and the discount comes off the monthly installments, so each of them
 * must still be at least 1 taka; a full payment must stay at least 1 taka.
 */
/** A price and how it is split: a quote, or an existing holding (`installments` only needs its length). */
export type DiscountBase = { totalBDT: number; downPaymentBDT: number | null; installments: ArrayLike<unknown> | null };

export function maxDiscountBDT(result: DiscountBase): number {
  const steps = result.installments?.length ?? 1;
  return result.downPaymentBDT && steps > 1
    ? result.totalBDT - result.downPaymentBDT - (steps - 1)
    : result.totalBDT - 1;
}

/** Why a discount can't be given on this quote, or null when it can. */
export function discountProblem(result: DiscountBase, discountBDT: number): string | null {
  if (!Number.isInteger(discountBDT) || discountBDT < 0) return "Enter the discount as a whole number of taka.";
  const max = maxDiscountBDT(result);
  if (discountBDT > max) {
    return result.downPaymentBDT && (result.installments?.length ?? 1) > 1
      ? `The discount comes off the monthly installments, so it can be at most ${formatBDT(max)}.`
      : `The discount can be at most ${formatBDT(max)}.`;
  }
  return null;
}

/**
 * A quote for a sale with no automatic schedule: just the price. No down
 * payment, no monthly installments — the shareholder pays any amount, any
 * time, and the team adds installments by hand only if they agree some.
 */
export function flexibleQuote<T extends PlanLike>(result: CalculatorResult<T>): CalculatorResult<T> {
  return { ...result, downPaymentBDT: null, monthlyCount: null, monthlyBDT: null, installments: null };
}

/** Stored on a holding with no installments yet (see parseSchedule). */
export const NO_INSTALLMENTS = "[]";

/**
 * A quote with an office discount taken off: the total drops by the discount
 * and the monthly installments are re-split over the lower balance, while the
 * down payment stays the same. Call `discountProblem` first.
 */
export function withDiscount<T extends PlanLike>(result: CalculatorResult<T>, discountBDT: number): CalculatorResult<T> {
  if (!discountBDT) return result;
  const totalBDT = result.totalBDT - discountBDT;
  const installments = result.installments
    ? buildInstallmentSchedule(totalBDT, result.installments.length, result.downPaymentBDT)
    : null;
  return {
    ...result,
    totalBDT,
    installments,
    monthlyBDT: installments ? installments[1]?.amountBDT ?? null : null,
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

/** Due date of installment `n` (1-based) for a holding opened on `openedAt`. */
export function installmentDueDate(openedAt: Date, n: number): Date {
  // The first payment is due the day the holding opens; the rest on the 1st of each following month.
  if (n <= 1) return openedAt;
  return new Date(openedAt.getFullYear(), openedAt.getMonth() + n - 1, 1);
}

/**
 * A custom payment schedule the team set for one holding — any number of
 * payments, each with its own due day and amount. Stored as JSON on the
 * holding; without one, the holding follows its plan's standard split.
 */
export type ScheduleRow = {
  /** Due day in Bangladesh time, YYYY-MM-DD. */
  due: string;
  amountBDT: number;
  /** "Down payment", "3rd installment", or the team's own name for it. */
  label: string;
  /**
   * When the team added it (ISO). Only money recorded after that goes to it —
   * what was paid before was for something else. Absent: all payments count.
   */
  added?: string;
};

export const MAX_SCHEDULE_ROWS = 240;

const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** The installments the team set (an empty list is a flexible holding with none), or null when it follows the plan. */
export function parseSchedule(json?: string | null): ScheduleRow[] | null {
  if (!json) return null;
  try {
    const rows = JSON.parse(json) as unknown;
    if (!Array.isArray(rows)) return null;
    const ok = rows.every(
      (r) =>
        r &&
        typeof r.due === "string" &&
        DAY.test(r.due) &&
        Number.isInteger(r.amountBDT) &&
        r.amountBDT > 0 &&
        typeof r.label === "string" &&
        (r.added === undefined || (typeof r.added === "string" && !Number.isNaN(Date.parse(r.added)))),
    );
    return ok ? (rows as ScheduleRow[]) : null;
  } catch {
    return null;
  }
}

/** A YYYY-MM-DD day as the start of that day in Bangladesh. */
export function dhakaDay(day: string): Date {
  return new Date(`${day}T00:00:00+06:00`);
}

/** A date as its YYYY-MM-DD day in Bangladesh. */
export function toDhakaDay(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

/** `day` moved by whole months, keeping the day of month where it exists (31 Jan + 1 → 28/29 Feb). */
export function addMonths(day: string, months: number): string {
  const [y, m, d] = day.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1 + months, 1));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  first.setUTCDate(Math.min(d, last));
  return first.toISOString().slice(0, 10);
}

/** The default name of the payment at `index` (0-based) in a schedule. */
export function scheduleLabel(index: number, hasDownPayment: boolean): string {
  return installmentPartName(index + 1, hasDownPayment);
}

/**
 * Splits an amount into `count` payments — the first due on `firstDue`, then
 * every `everyMonths` months. With `roundTo` (e.g. 1000) every payment but the
 * last is a round figure and the last takes the remainder.
 */
export function splitIntoPayments({
  amountBDT,
  count,
  firstDue,
  everyMonths = 1,
  roundTo = 1,
}: {
  amountBDT: number;
  count: number;
  firstDue: string;
  everyMonths?: number;
  roundTo?: number;
}): { due: string; amountBDT: number }[] {
  const n = Math.max(1, Math.min(MAX_SCHEDULE_ROWS, Math.floor(count)));
  const step = Math.max(1, Math.floor(roundTo));
  let each = Math.floor(amountBDT / n / step) * step;
  if (each < 1 || each * (n - 1) >= amountBDT) each = Math.floor(amountBDT / n);
  return Array.from({ length: n }, (_, i) => ({
    due: addMonths(firstDue, i * Math.max(1, everyMonths)),
    amountBDT: i === n - 1 ? amountBDT - each * (n - 1) : each,
  })).filter((r) => r.amountBDT > 0);
}

/** Short form in the lakh/crore notation used in Bangladesh, e.g. "৳39.5 L", "৳1.25 Cr". */
export function formatBDTCompact(amount: number): string {
  const trim = (n: number) => n.toFixed(2).replace(/\.?0+$/, "");
  if (amount >= 10_000_000) return `৳${trim(amount / 10_000_000)} Cr`;
  if (amount >= 100_000) return `৳${trim(amount / 100_000)} L`;
  return formatBDT(amount);
}
