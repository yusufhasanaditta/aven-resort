import "server-only";
import type { Prisma } from "@prisma/client";
import { holdingLedger, invoiceNumberFor, memberIdFor, paymentLabels } from "@/lib/account";
import type { AdminCustomer, AdminHolding, AdminPayment } from "@/lib/admin-types";

export const holdingInclude = {
  plan: true,
  payments: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.ShareHoldingInclude;

type HoldingWithAll = Prisma.ShareHoldingGetPayload<{ include: typeof holdingInclude }>;

export function toAdminHolding(h: HoldingWithAll): AdminHolding {
  return { ...holdingLedger(h), customer: h.user };
}

export function toAdminPayments(h: HoldingWithAll): AdminPayment[] {
  const labels = paymentLabels(h);
  return h.payments.map((p) => ({
    id: p.id,
    receiptNo: invoiceNumberFor(p),
    holdingId: h.id,
    customer: { id: h.user.id, name: h.user.name, phone: h.user.phone },
    planName: h.plan.name,
    units: h.units,
    installmentNo: p.installmentNo,
    installmentLabel: labels[p.id],
    amountBDT: p.amountBDT,
    method: p.method,
    tranId: p.tranId,
    reference: p.reference,
    note: p.note,
    recordedBy: p.recordedBy,
    status: p.status,
    createdAt: p.createdAt.toISOString(),
    paidAt: p.status === "SUCCESS" ? (p.paidAt ?? p.updatedAt).toISOString() : null,
  }));
}

export function toAdminCustomer(
  user: {
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
  },
  holdings: AdminHolding[],
): AdminCustomer {
  const live = holdings.filter((h) => h.status !== "CANCELLED");
  const next = live
    .filter((h) => h.nextDue)
    .map((h) => h.nextDue!)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    location: user.location,
    createdAt: user.createdAt.toISOString(),
    memberId: memberIdFor(user),
    photoUrl: user.photoUrl ?? null,
    nid: user.nid ?? null,
    nomineeName: user.nomineeName ?? null,
    nomineeRelation: user.nomineeRelation ?? null,
    referredBy: user.referredBy ?? null,
    shareNumbers: live.filter((h) => h.shareNo).map((h) => h.shareNo!),
    units: live.filter((h) => h.status === "ACTIVE").reduce((s, h) => s + h.units, 0),
    committedBDT: live.reduce((s, h) => s + h.totalAmountBDT, 0),
    paidBDT: live.reduce((s, h) => s + h.paidBDT, 0),
    remainingBDT: live.reduce((s, h) => s + h.remainingBDT, 0),
    overdueCount: live.reduce((s, h) => s + h.overdueCount, 0),
    holdingCount: holdings.length,
    nextDue: next ? { amountBDT: next.amountBDT, dueDate: next.dueDate } : null,
  };
}
