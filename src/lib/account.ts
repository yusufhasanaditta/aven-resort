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
  dhakaDay,
  formatBDT,
  installmentDueDate,
  installmentLabelFor,
  installmentPartName,
  MAX_SCHEDULE_ROWS,
  ownershipPercent,
  parseSchedule,
  planForUnits,
  scheduleAmounts,
  stayDays,
  type ScheduleRow,
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
  /** What the team wrote the money was for: "December", "Down payment"… */
  label?: string | null;
};

export type HoldingRow = {
  id: string;
  units: number;
  totalAmountBDT: number;
  paymentPlan: "FULL" | "INSTALLMENT";
  installmentMonths: number | null;
  downPaymentBDT?: number | null;
  /** The team's own schedule for this holding (JSON ScheduleRow[]); null follows the plan. */
  scheduleJson?: string | null;
  discountBDT?: number;
  discountNote?: string | null;
  shareFrom?: number | null;
  shareTo?: number | null;
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
  memberNo?: string | null;
  photoUrl?: string | null;
  nid?: string | null;
  nomineeName?: string | null;
  nomineeRelation?: string | null;
  referredBy?: string | null;
};

/** PARTIAL: some money is in, not all of it. */
export type StepStatus = PaymentStatus | "UPCOMING" | "PARTIAL";

export type DashStep = {
  n: number;
  label: string;
  /** Short name of this part: "Down payment", "3rd installment", "Full payment". */
  part: string;
  /** What the schedule asks for. */
  amountBDT: number;
  /** Paid toward it so far, and what's still owed on it. */
  paidBDT: number;
  dueBDT: number;
  dueDate: string;
  status: StepStatus;
  /** When it was paid in full. */
  paidAt: string | null;
  /** When the team added it (installments set by hand); null for the plan's own. */
  addedAt: string | null;
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
  /** What the shareholder pays: the chart price less any office discount. */
  totalAmountBDT: number;
  /** Chart price before the discount; equals totalAmountBDT when there is none. */
  listPriceBDT: number;
  discountBDT: number;
  discountNote: string | null;
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
  /** True when the team manages this holding's installments by hand (it may have none). */
  customSchedule: boolean;
  /** Owed but on no installment — paid in any amount, any time; never overdue. */
  openBalanceBDT: number;
  /** Money received, newest first. */
  history: { id: string; amountBDT: number; label: string; method: string; paidAt: string }[];
  /** Share numbers, e.g. "#0012–0016"; null for holdings opened before numbering. */
  shareNo: string | null;
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
    photoUrl: string | null;
    nid: string | null;
    nomineeName: string | null;
    nomineeRelation: string | null;
    referredBy: string | null;
    /** Share numbers of every holding that is not cancelled. */
    shareNumbers: string[];
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

/** The membership number (e.g. 20262001); accounts from before numbering fall back to the old style. */
export function memberIdFor(user: { id: string; createdAt: Date; memberNo?: string | null }) {
  if (user.memberNo) return user.memberNo;
  return `AVN-${user.createdAt.getFullYear()}-${user.id.slice(-6).toUpperCase()}`;
}

/** Share numbers as shown on cards and receipts: "#0012", or a run "#0012–0016". */
export function shareNoLabel(from?: number | null, to?: number | null) {
  if (!from) return null;
  const pad = (n: number) => String(n).padStart(4, "0");
  return !to || to === from ? `#${pad(from)}` : `#${pad(from)}–${pad(to)}`;
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

/** "Down payment + 12 monthly" / "6 installments" / "Full payment" / "Custom plan · 9 payments". */
export function paymentPlanLabel(holding: {
  paymentPlan: "FULL" | "INSTALLMENT";
  installmentMonths: number | null;
  downPaymentBDT?: number | null;
  customSchedule?: boolean;
  scheduleJson?: string | null;
}) {
  const custom = holding.customSchedule ? holding.installmentMonths : parseSchedule(holding.scheduleJson)?.length;
  if (custom === 0) return "Flexible — any amount, any time";
  if (custom) return `Flexible · ${custom} installment${custom === 1 ? "" : "s"} set`;
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

/** One part of a holding's schedule, before any money is applied. */
type Part = { label: string; part: string; amountBDT: number; due: Date | null; addedAt?: Date | null };

/** A holding's schedule: the team's own if they set one, else the plan's standard split. */
export function holdingSchedule(h: HoldingRow): Part[] {
  const custom = parseSchedule(h.scheduleJson);
  if (custom) {
    return custom.map((r) => ({ label: r.label, part: r.label, amountBDT: r.amountBDT, due: dhakaDay(r.due), addedAt: r.added ? new Date(r.added) : null }));
  }
  const installments = h.paymentPlan === "INSTALLMENT" && !!h.installmentMonths;
  const amounts = installments ? scheduleAmounts(h.totalAmountBDT, h.installmentMonths!, h.downPaymentBDT) : [h.totalAmountBDT];
  return amounts.map((amountBDT, i) => ({
    label: paymentLabel(h, i + 1),
    part: installments ? installmentPartName(i + 1, !!h.downPaymentBDT) : "Full payment",
    amountBDT,
    due: installmentDueDate(h.createdAt, i + 1),
  }));
}

/** How much of one payment went to one part of the schedule. */
export type PaymentCover = { n: number; part: string; appliedBDT: number; scheduledBDT: number; settles: boolean };

const settledAt = (p: PaymentRow) => p.paidAt ?? p.updatedAt;

/**
 * Applies every successful payment to the schedule in order — earliest due
 * first — whatever its amount: ৳5,000 toward a ৳62,500 installment leaves it
 * part-paid with ৳57,500 owed; a larger sum can clear one and start the next.
 * An installment the team added later only takes money recorded after it was
 * added; anything that fits no installment goes to the open balance.
 * Returns each part's paid total and, per payment, what it covered.
 */
function allocate(parts: Part[], payments: PaymentRow[]) {
  const paid = parts.map(() => 0);
  const completedAt: (Date | null)[] = parts.map(() => null);
  const covers: Record<string, PaymentCover[]> = {};
  const ordered = payments
    .filter((p) => p.status === "SUCCESS")
    .sort((a, b) => settledAt(a).getTime() - settledAt(b).getTime() || a.createdAt.getTime() - b.createdAt.getTime());
  for (const p of ordered) {
    let left = p.amountBDT;
    const list: PaymentCover[] = [];
    for (let i = 0; i < parts.length && left > 0; i++) {
      const added = parts[i].addedAt;
      if (added && p.createdAt < added) continue;
      const take = Math.min(left, parts[i].amountBDT - paid[i]);
      if (take <= 0) continue;
      paid[i] += take;
      left -= take;
      const settles = paid[i] >= parts[i].amountBDT;
      list.push({ n: i + 1, part: parts[i].part, appliedBDT: take, scheduledBDT: parts[i].amountBDT, settles });
      if (settles) completedAt[i] = settledAt(p);
    }
    covers[p.id] = list;
  }
  return { paid, completedAt, covers };
}

/** "2nd installment", "Down payment (part)", "Down payment (balance) + 1st installment", "1st installment through 6th installment (part) · 6 parts". */
export function coverLabel(list: PaymentCover[]): string {
  const name = (c: PaymentCover) =>
    c.part === OPEN_BALANCE
      ? "Payment toward balance"
      : c.appliedBDT === c.scheduledBDT
        ? c.part
        : c.settles
          ? `${c.part} (balance)`
          : `${c.part} (part)`;
  if (!list.length) return "Payment";
  if (list.length === 1) return name(list[0]);
  if (list.length === 2) return `${name(list[0])} + ${name(list[1])}`;
  if (list.length === 3) return `${name(list[0])}, ${name(list[1])} and ${name(list[2])}`;
  return `${name(list[0])} through ${name(list[list.length - 1])} · ${list.length} parts`;
}

/** Name of the part of a price no installment covers — paid in any amount, any time. */
export const OPEN_BALANCE = "Open balance";

function computeLedger(h: HoldingRow) {
  const parts = holdingSchedule(h);
  // Whatever no installment covers stays an open balance: no due date, paid in any amount.
  const scheduled = parts.reduce((s, p) => s + p.amountBDT, 0);
  const openBDT = Math.max(0, h.totalAmountBDT - scheduled);
  const all: Part[] = openBDT ? [...parts, { label: OPEN_BALANCE, part: OPEN_BALANCE, amountBDT: openBDT, due: null }] : parts;
  const { paid, completedAt, covers } = allocate(all, h.payments);
  const latestAttempt = (n: number) =>
    h.payments
      .filter((p) => p.installmentNo === n && p.status !== "SUCCESS")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const steps: DashStep[] = parts.map((part, i) => {
    const n = i + 1;
    const done = paid[i] >= part.amountBDT;
    const attempt = done ? undefined : latestAttempt(n);
    const status: StepStatus = done
      ? "SUCCESS"
      : attempt?.status === "PENDING"
        ? "PENDING"
        : paid[i] > 0
          ? "PARTIAL"
          : attempt?.status === "FAILED" || attempt?.status === "CANCELLED"
            ? attempt.status
            : "UPCOMING";
    return {
      n,
      label: part.label,
      part: part.part,
      amountBDT: part.amountBDT,
      paidBDT: paid[i],
      dueBDT: part.amountBDT - paid[i],
      dueDate: (part.due ?? h.createdAt).toISOString(),
      status,
      paidAt: completedAt[i]?.toISOString() ?? null,
      addedAt: part.addedAt?.toISOString() ?? null,
    };
  });

  // Receipt wording per payment: what the team wrote it was for, else what it covered (or was meant to).
  const labels: Record<string, string> = {};
  for (const p of h.payments) {
    labels[p.id] =
      p.label?.trim() ||
      (p.status === "SUCCESS" ? coverLabel(covers[p.id] ?? []) : (parts[p.installmentNo - 1]?.label ?? "Payment"));
  }
  const openPaid = openBDT ? paid[parts.length] : 0;
  return { steps, covers, labels, openBalanceBDT: openBDT - openPaid };
}

/** What each payment on a holding paid for, by payment id — for receipts and payment lists. */
export function paymentLabels(h: HoldingRow): Record<string, string> {
  return computeLedger(h).labels;
}

/** Exactly how one payment was applied to the installments (and the open balance). */
export function paymentCovers(h: HoldingRow, paymentId: string): PaymentCover[] {
  return computeLedger(h).covers[paymentId] ?? [];
}

/**
 * One holding's ledger: its installments (if any), what's been paid, what
 * remains and what's due next. Shared by the shareholder dashboard and the
 * admin panel so both always show the same numbers.
 */
export function holdingLedger(h: HoldingRow): DashHolding {
  const { steps, labels, openBalanceBDT } = computeLedger(h);
  const cancelled = h.status === "CANCELLED";
  const paidBDT = h.payments.filter((p) => p.status === "SUCCESS").reduce((sum, p) => sum + p.amountBDT, 0);
  const fullyPaid = paidBDT >= h.totalAmountBDT;
  const next = cancelled ? undefined : steps.find((s) => s.status !== "SUCCESS");
  const today = new Date().toISOString();
  const overdueCount = cancelled
    ? 0
    : steps.filter((s) => s.status !== "SUCCESS" && s.status !== "PENDING" && daysUntil(s.dueDate, today) < 0).length;
  const history = h.payments
    .filter((p) => p.status === "SUCCESS")
    .map((p) => ({ id: p.id, amountBDT: p.amountBDT, label: labels[p.id], method: p.method, paidAt: (p.paidAt ?? p.updatedAt).toISOString() }))
    .sort((a, b) => b.paidAt.localeCompare(a.paidAt));

  return {
    id: h.id,
    plan: toCard(h.plan),
    units: h.units,
    totalAmountBDT: h.totalAmountBDT,
    listPriceBDT: h.totalAmountBDT + (h.discountBDT ?? 0),
    discountBDT: h.discountBDT ?? 0,
    discountNote: h.discountNote ?? null,
    paidBDT,
    remainingBDT: cancelled ? 0 : Math.max(0, h.totalAmountBDT - paidBDT),
    openBalanceBDT: cancelled ? 0 : Math.max(0, openBalanceBDT),
    overdueCount,
    paidCount: steps.filter((s) => s.status === "SUCCESS").length,
    leftCount: cancelled ? 0 : steps.filter((s) => s.status !== "SUCCESS").length,
    paymentPlan: h.paymentPlan,
    installmentMonths: steps.length,
    downPaymentBDT: h.downPaymentBDT ?? null,
    customSchedule: !!parseSchedule(h.scheduleJson),
    shareNo: shareNoLabel(h.shareFrom, h.shareTo),
    status: h.status,
    openedAt: h.createdAt.toISOString(),
    steps,
    history,
    nextDue: next ? { n: next.n, amountBDT: next.dueBDT, dueDate: next.dueDate } : null,
    hasPending: h.payments.some((p) => p.status === "PENDING"),
    fullyPaid,
  };
}

/** "৳5,000 of ৳62,500 paid" — for part-paid installments. */
export function partPaidLine(s: Pick<DashStep, "paidBDT" | "amountBDT">) {
  return `${formatBDT(s.paidBDT)} of ${formatBDT(s.amountBDT)} paid`;
}

export function buildDashboard(user: UserRow, holdings: HoldingRow[], plans: PlanRow[]): DashboardData {
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  const dashHoldings = holdings.map(holdingLedger);

  const invoices: DashInvoice[] = holdings
    .flatMap((h) => {
      const labels = paymentLabels(h);
      return h.payments.map((p) => ({
        id: p.id,
        invoiceNo: invoiceNumberFor(p),
        holdingId: h.id,
        planName: h.plan.name,
        accentColor: h.plan.accentColor,
        units: h.units,
        label: labels[p.id],
        amountBDT: p.amountBDT,
        status: p.status,
        tranId: p.tranId,
        method: p.method,
        issuedAt: p.createdAt.toISOString(),
        settledAt: p.status === "SUCCESS" ? (p.paidAt ?? p.updatedAt).toISOString() : null,
      }));
    })
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
    .filter((h) => h.nextDue)
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
      photoUrl: user.photoUrl ?? null,
      nid: user.nid ?? null,
      nomineeName: user.nomineeName ?? null,
      nomineeRelation: user.nomineeRelation ?? null,
      referredBy: user.referredBy ?? null,
      shareNumbers: dashHoldings.filter((h) => h.status !== "CANCELLED" && h.shareNo).map((h) => h.shareNo!),
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

/**
 * What's wrong with the installments the team set for a holding, if anything —
 * shared by the editor (live, as the team types) and the server (on save).
 * They may cover all of the price, part of it, or none; together they can't
 * be more than it. Paid installments keep their amount, and a part-paid one
 * can't drop below what's been paid on it.
 */
export function scheduleProblems(
  rows: ScheduleRow[],
  ledger: Pick<DashHolding, "totalAmountBDT" | "steps">,
): { form: string | null; rows: Record<number, string> } {
  const out: Record<number, string> = {};
  if (rows.length > MAX_SCHEDULE_ROWS) return { form: `At most ${MAX_SCHEDULE_ROWS} payments.`, rows: out };

  rows.forEach((r, i) => {
    const old = ledger.steps[i];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.due) || Number.isNaN(dhakaDay(r.due).getTime())) out[i] = "Pick a due date.";
    else if (i > 0 && r.due < rows[i - 1].due) out[i] = "Due dates must go in order.";
    else if (!Number.isInteger(r.amountBDT) || r.amountBDT < 1) out[i] = "Enter an amount of at least ৳1.";
    else if (!r.label.trim()) out[i] = "Give it a name.";
    else if (old?.status === "SUCCESS" && r.amountBDT !== old.amountBDT) out[i] = `Already paid — keep it at ${formatBDT(old.amountBDT)}.`;
    else if (old && old.paidBDT > 0 && r.amountBDT < old.paidBDT) out[i] = `${formatBDT(old.paidBDT)} is already paid on this one.`;
  });
  const paidParts = ledger.steps.filter((s) => s.paidBDT > 0).length;
  if (rows.length < paidParts) return { form: "Payments already made can't be removed from the schedule.", rows: out };

  // Installments can cover part of the price; the rest stays an open balance.
  const sum = rows.reduce((s, r) => s + (Number.isInteger(r.amountBDT) ? r.amountBDT : 0), 0);
  const over = sum - ledger.totalAmountBDT;
  const form = over > 0 ? `These installments come to ${formatBDT(over)} more than the ${formatBDT(ledger.totalAmountBDT)} price.` : null;
  return { form, rows: out };
}
