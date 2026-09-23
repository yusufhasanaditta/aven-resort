import type { MembershipPlan } from "@prisma/client";

/**
 * Pure share-calculator math, shared by the interactive calculator (client)
 * and the order-creation route (server) so the number a shareholder sees
 * before paying is exactly the number they're charged.
 */

export type InstallmentLine = {
  index: number;
  label: string;
  amountBDT: number;
  dueLabel: string;
};

export type CalculatorResult = {
  plan: MembershipPlan;
  units: number;
  totalBDT: number;
  freeStayNights: number;
  discountPercent: number;
  installments: InstallmentLine[] | null;
};

/**
 * Which tier a given unit count falls into.
 *
 * Plans are contiguous ranges (1–2, 3–4, 5–9, 10+), so the match is whichever
 * range contains `units`; below the lowest range, the lowest tier applies —
 * above the highest (unbounded) range, the highest tier applies.
 */
export function planForUnits(
  plans: MembershipPlan[],
  units: number,
): MembershipPlan {
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
): InstallmentLine[] {
  const now = new Date();
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

export function calculate(
  plans: MembershipPlan[],
  units: number,
  paymentPlan: "FULL" | "INSTALLMENT",
  installmentMonths?: number,
): CalculatorResult {
  const safeUnits = Math.max(1, Math.round(units));
  const plan = planForUnits(plans, safeUnits);
  const totalBDT = plan.unitPriceBDT * safeUnits;

  return {
    plan,
    units: safeUnits,
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
