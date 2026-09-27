/**
 * The shareholder dashboard's view model. `buildDashboard` runs on the server
 * against Prisma rows and returns one plain, serialisable snapshot — dates as
 * ISO strings — so every panel of the client dashboard reads from the same
 * computed numbers rather than re-deriving them.
 *
 * Structural input types (not Prisma imports) keep this file free of server
 * dependencies so its types and formatters can be shared with the client.
 */
import type { MembershipCardData } from "@/components/ui/MembershipCard";
import {
  installmentDueDate,
  installmentLabelFor,
  installmentPartName,
  ownershipPercent,
  planForUnits,
  scheduleAmounts,
  stayDays,
} from "@/lib/shares";

type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export type PlanRow = MembershipCardData & { id: string; sortOrder: number };

export type PaymentRow = {
  id: string;
  amountBDT: number;
  method: string;
  tranId: string;
  installmentNo: number;
  status: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
  /** Set when the money actually arrived (manual records); falls back to `updatedAt`. */
  paidAt?: Date | null;
};

export type HoldingRow = {
  id: string;
  units: number;
  totalAmountBDT: number;
  paymentPlan: "FULL" | "INSTALLMENT";
  installmentMonths: number | null;
  downPaymentBDT?: number | null;
  status: "PENDING_PAYMENT" | "ACTIVE" | "CANCELLED";
  createdAt: Date;
  plan: PlanRow;
  payments: PaymentRow[];
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  createdAt: Date;
};

export type StepStatus = PaymentStatus | "UPCOMING";

export type DashStep = {
  n: number;
  label: string;
  /** Short name of this part: "Down payment", "3rd installment", "Full payment". */
  part: string;
  amountBDT: number;
  dueDate: string;
  status: StepStatus;
  paidAt: string | null;
};

export type DashInvoice = {
  id: string;
  invoiceNo: string;
  holdingId: string;
  planName: string;
  accentColor: string;
  units: number;
  label: string;
  amountBDT: number;
  status: PaymentStatus;
  tranId: string;
  method: string;
  issuedAt: string;
  settledAt: string | null;
};

export type DashHolding = {
  id: string;
  plan: MembershipCardData;
  units: number;
  totalAmountBDT: number;
  paidBDT: number;
  remainingBDT: number;
  /** Past-due installments not yet paid, in Bangladesh calendar days. */
  overdueCount: number;
  /** Parts of the schedule paid, and still to pay. */
  paidCount: number;
  leftCount: number;
  paymentPlan: "FULL" | "INSTALLMENT";
  installmentMonths: number | null;
  downPaymentBDT: number | null;
  status: "PENDING_PAYMENT" | "ACTIVE" | "CANCELLED";
  openedAt: string;
  steps: DashStep[];
  nextDue: { n: number; amountBDT: number; dueDate: string } | null;
  hasPending: boolean;
  fullyPaid: boolean;
};

export type DashEvent = {
  id: string;
  at: string;
  kind: "joined" | "holding" | "paid" | "failed" | "pending";
  title: string;
  detail: string;
};

export type DashboardData = {
  /** Server time the snapshot was taken, so client and server agree on "today". */
  now: string;
  user: {
    name: string;
    email: string;
    phone: string;
    location: string;
    memberSince: string;
    memberId: string;
  };
  plans: (MembershipCardData & { id: string })[];
  holdings: DashHolding[];
  invoices: DashInvoice[];
  events: DashEvent[];
  summary: {
    activeUnits: number;
    reservedUnits: number;
    committedBDT: number;
    paidBDT: number;
    outstandingBDT: number;
    ownershipPct: number;
    currentPlan: MembershipCardData | null;
    nextPlan: MembershipCardData | null;
    unitsToNextPlan: number;
    stayDaysPerYear: number;
    firstShareAt: string | null;
    nextDue: {
      holdingId: string;
      planName: string;
      n: number;
      of: number;
      amountBDT: number;
      dueDate: string;
    } | null;
  };
};

/** A stable, human-readable member number, e.g. `AVN-2026-4F9KQ2`. */
export function memberIdFor(user: { id: string; createdAt: Date }) {
  return `AVN-${user.createdAt.getFullYear()}-${user.id.slice(-6).toUpperCase()}`;
}

/** Invoice number for one payment, e.g. `INV-202609-7XK2PD`. */
export function invoiceNumberFor(payment: { id: string; createdAt: Date }) {
  const d = payment.createdAt;
  return `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${payment.id
    .slice(-6)
    .toUpperCase()}`;
}

/** Label for one payment line on a holding. */
export function paymentLabel(
  holding: { paymentPlan: "FULL" | "INSTALLMENT"; installmentMonths: number | null; downPaymentBDT?: number | null },
  installmentNo: number,
) {
  return holding.paymentPlan === "INSTALLMENT" && holding.installmentMonths
    ? installmentLabelFor(installmentNo, holding.installmentMonths, !!holding.downPaymentBDT)
    : "Full payment";
}

/** "Down payment + 12 monthly" / "6 installments" / "Full payment". */
export function paymentPlanLabel(holding: { paymentPlan: "FULL" | "INSTALLMENT"; installmentMonths: number | null; downPaymentBDT?: number | null }) {
  if (holding.paymentPlan !== "INSTALLMENT" || !holding.installmentMonths) return "Full payment";
  return holding.downPaymentBDT
    ? `Down payment + ${holding.installmentMonths - 1} monthly`
    : `${holding.installmentMonths}-month plan`;
}

function toCard(plan: PlanRow): MembershipCardData {
  return {
    slug: plan.slug,
    name: plan.name,
    subtitle: plan.subtitle,
    minUnits: plan.minUnits,
    maxUnits: plan.maxUnits,
    unitPriceBDT: plan.unitPriceBDT,
    fullPriceBDT: plan.fullPriceBDT,
    downPaymentBDT: plan.downPaymentBDT,
    installmentCount: plan.installmentCount,
    freeStayNights: plan.freeStayNights,
    accentColor: plan.accentColor,
    featured: plan.featured,
  };
}

/** The attempt that best represents an installment: a success, else an in-flight one, else the latest. */
function representative(payments: PaymentRow[]) {
  return (
    payments.find((p) => p.status === "SUCCESS") ??
    payments.find((p) => p.status === "PENDING") ??
    [...payments].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
  );
}

/**
 * One holding's ledger: its dated installment schedule, what's been paid, what
 * remains and what's due next. Shared by the shareholder dashboard and the
 * admin panel so both always show the same numbers.
 */
export function holdingLedger(h: HoldingRow): DashHolding {
  const months = h.paymentPlan === "INSTALLMENT" ? h.installmentMonths ?? 1 : 1;
  const amounts =
    h.paymentPlan === "INSTALLMENT" && h.installmentMonths
      ? scheduleAmounts(h.totalAmountBDT, h.installmentMonths, h.downPaymentBDT)
      : [h.totalAmountBDT];

  const steps: DashStep[] = Array.from({ length: months }, (_, i) => {
    const n = i + 1;
    const attempt = representative(h.payments.filter((p) => p.installmentNo === n));
    return {
      n,
      label: paymentLabel(h, n),
      part: h.paymentPlan === "INSTALLMENT" && h.installmentMonths ? installmentPartName(n, !!h.downPaymentBDT) : "Full payment",
      amountBDT: amounts[i],
      dueDate: installmentDueDate(h.createdAt, n).toISOString(),
      status: attempt?.status ?? "UPCOMING",
      paidAt: attempt?.status === "SUCCESS" ? (attempt.paidAt ?? attempt.updatedAt).toISOString() : null,
    };
  });

  const paidBDT = steps.filter((s) => s.status === "SUCCESS").reduce((sum, s) => sum + s.amountBDT, 0);
  const hasPending = steps.some((s) => s.status === "PENDING");
  const fullyPaid = steps.every((s) => s.status === "SUCCESS");
  const next = h.status === "CANCELLED" ? undefined : steps.find((s) => s.status !== "SUCCESS");
  const today = new Date().toISOString();
  const overdueCount =
    h.status === "CANCELLED"
      ? 0
      : steps.filter((s) => s.status !== "SUCCESS" && s.status !== "PENDING" && daysUntil(s.dueDate, today) < 0).length;

  return {
    id: h.id,
    plan: toCard(h.plan),
    units: h.units,
    totalAmountBDT: h.totalAmountBDT,
    paidBDT,
    remainingBDT: h.status === "CANCELLED" ? 0 : h.totalAmountBDT - paidBDT,
    overdueCount,
    paidCount: steps.filter((s) => s.status === "SUCCESS").length,
    leftCount: h.status === "CANCELLED" ? 0 : steps.filter((s) => s.status !== "SUCCESS").length,
    paymentPlan: h.paymentPlan,
    installmentMonths: h.installmentMonths,
    downPaymentBDT: h.downPaymentBDT ?? null,
    status: h.status,
    openedAt: h.createdAt.toISOString(),
    steps,
    nextDue: next ? { n: next.n, amountBDT: next.amountBDT, dueDate: next.dueDate } : null,
    hasPending,
    fullyPaid,
  };
}

export function buildDashboard(user: UserRow, holdings: HoldingRow[], plans: PlanRow[]): DashboardData {
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  const dashHoldings = holdings.map(holdingLedger);

  const invoices: DashInvoice[] = holdings
    .flatMap((h) =>
      h.payments.map((p) => ({
        id: p.id,
        invoiceNo: invoiceNumberFor(p),
        holdingId: h.id,
        planName: h.plan.name,
        accentColor: h.plan.accentColor,
        units: h.units,
        label: paymentLabel(h, p.installmentNo),
        amountBDT: p.amountBDT,
        status: p.status,
        tranId: p.tranId,
        method: p.method,
        issuedAt: p.createdAt.toISOString(),
        settledAt: p.status === "SUCCESS" ? (p.paidAt ?? p.updatedAt).toISOString() : null,
      })),
    )
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));

  const live = dashHoldings.filter((h) => h.status !== "CANCELLED");
  const active = dashHoldings.filter((h) => h.status === "ACTIVE");
  const activeUnits = active.reduce((s, h) => s + h.units, 0);
  const reservedUnits = live.filter((h) => h.status === "PENDING_PAYMENT").reduce((s, h) => s + h.units, 0);
  const committedBDT = live.reduce((s, h) => s + h.totalAmountBDT, 0);
  const paidBDT = live.reduce((s, h) => s + h.paidBDT, 0);

  // Membership standing follows the shares actually held (active holdings).
  const currentPlanRow = activeUnits > 0 && sortedPlans.length ? planForUnits(sortedPlans, activeUnits) : null;
  const nextPlanRow = currentPlanRow
    ? sortedPlans.find((p) => p.minUnits > activeUnits) ?? null
    : sortedPlans[0] ?? null;

  const nextDueAll = live
    .filter((h) => h.nextDue && !h.hasPending)
    .map((h) => ({
      holdingId: h.id,
      planName: h.plan.name,
      n: h.nextDue!.n,
      of: h.steps.length,
      amountBDT: h.nextDue!.amountBDT,
      dueDate: h.nextDue!.dueDate,
    }))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null;

  const events: DashEvent[] = [
    {
      id: "joined",
      at: user.createdAt.toISOString(),
      kind: "joined" as const,
      title: "Joined Aven",
      detail: "Shareholder account opened",
    },
    ...holdings.map((h) => ({
      id: `h-${h.id}`,
      at: h.createdAt.toISOString(),
      kind: "holding" as const,
      title: `${h.plan.name} holding opened`,
      detail: `${h.units} unit share${h.units > 1 ? "s" : ""} · ${paymentPlanLabel(h).toLowerCase()}`,
    })),
    ...invoices.map((inv) => ({
      id: `p-${inv.id}`,
      at: inv.settledAt ?? inv.issuedAt,
      kind: (inv.status === "SUCCESS" ? "paid" : inv.status === "PENDING" ? "pending" : "failed") as DashEvent["kind"],
      title:
        inv.status === "SUCCESS"
          ? "Payment received"
          : inv.status === "PENDING"
            ? "Payment started"
            : inv.status === "FAILED"
              ? "Payment failed"
              : "Payment cancelled",
      detail: `${inv.planName} · ${inv.label} · ${inv.invoiceNo}`,
    })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  const firstShare = holdings.length
    ? holdings.reduce((min, h) => (h.createdAt < min ? h.createdAt : min), holdings[0].createdAt)
    : null;

  return {
    now: new Date().toISOString(),
    user: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      location: user.location,
      memberSince: user.createdAt.toISOString(),
      memberId: memberIdFor(user),
    },
    plans: sortedPlans.map((p) => ({ ...toCard(p), id: p.id })),
    holdings: dashHoldings,
    invoices,
    events,
    summary: {
      activeUnits,
      reservedUnits,
      committedBDT,
      paidBDT,
      outstandingBDT: committedBDT - paidBDT,
      ownershipPct: ownershipPercent(activeUnits),
      currentPlan: currentPlanRow ? toCard(currentPlanRow) : null,
      nextPlan: nextPlanRow ? toCard(nextPlanRow) : null,
      unitsToNextPlan: nextPlanRow ? Math.max(0, nextPlanRow.minUnits - activeUnits) : 0,
      stayDaysPerYear: currentPlanRow ? stayDays(currentPlanRow.freeStayNights) : 0,
      firstShareAt: firstShare ? firstShare.toISOString() : null,
      nextDue: nextDueAll,
    },
  };
}

/**
 * Every date on the dashboard is shown in Bangladesh time — the resort's and
 * the shareholders' timezone — so the server render and the browser agree
 * whatever timezone the server happens to run in.
 */
const TZ = "Asia/Dhaka";

/** "26 Sep 2026" */
export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TZ });
}

/** "September 2026" */
export function formatMonth(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: TZ });
}

function dayNumber(iso: string) {
  const [y, m, d] = new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ }).split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Whole calendar days from `nowIso` to `iso` in Bangladesh time; negative when past. */
export function daysUntil(iso: string, nowIso: string) {
  return dayNumber(iso) - dayNumber(nowIso);
}
