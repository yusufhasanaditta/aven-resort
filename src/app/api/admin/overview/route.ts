import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CONTACT_REQUEST_SOURCE } from "@/lib/contact-requests";
import { adminGuard } from "@/lib/admin";
import { daysUntil, holdingLedger } from "@/lib/account";
import { TOTAL_SHARES } from "@/lib/shares";
import { LEAD_STATUSES } from "@/lib/validation";
import type { OverviewData } from "@/lib/admin-types";

const TZ = "Asia/Dhaka";
const monthKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ }).slice(0, 7);

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const [allLeads, pendingApplications, shareholderCount, holdings, plans, activity] = await Promise.all([
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.application.count({ where: { status: { in: ["SUBMITTED", "UNDER_REVIEW"] } } }),
    prisma.user.count({ where: { role: "SHAREHOLDER" } }),
    prisma.shareHolding.findMany({
      include: { plan: true, payments: true, user: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  // "Contact me" requests have their own list; the CRM numbers count the rest.
  const leads = allLeads.filter((l) => l.source !== CONTACT_REQUEST_SOURCE);
  const contactRequestsNew = allLeads.filter((l) => l.source === CONTACT_REQUEST_SOURCE && l.status === "NEW").length;

  const now = new Date();
  const nowIso = now.toISOString();
  const thisMonth = monthKey(now);

  const ledgers = holdings.map((h) => ({ h, l: holdingLedger(h) }));
  const live = ledgers.filter(({ h }) => h.status !== "CANCELLED");

  const payments = holdings.flatMap((h) => h.payments);
  const collected = payments.filter((p) => p.status === "SUCCESS");

  // Collections for the last 12 months, oldest first.
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 15);
    return { key: monthKey(d), label: d.toLocaleDateString("en-GB", { month: "short", timeZone: TZ }) };
  });
  const collectionsByMonth = months.map((m) => ({
    label: m.label,
    key: m.key,
    amountBDT: collected
      .filter((p) => monthKey(p.paidAt ?? p.updatedAt) === m.key)
      .reduce((s, p) => s + p.amountBDT, 0),
  }));

  const overdue = live.filter(({ l }) => l.overdueCount > 0);
  const overdueBDT = live.reduce(
    (sum, { l }) =>
      sum +
      l.steps
        .filter((s) => s.status !== "SUCCESS" && s.status !== "PENDING" && daysUntil(s.dueDate, nowIso) < 0)
        .reduce((a, s) => a + s.amountBDT, 0),
    0,
  );

  const upcomingDues = live
    .flatMap(({ h, l }) =>
      l.steps
        .filter((s) => s.status !== "SUCCESS" && s.status !== "PENDING")
        .map((s) => ({
          holdingId: h.id,
          customerId: h.user.id,
          customer: h.user.name,
          phone: h.user.phone,
          planName: h.plan.name,
          n: s.n,
          of: l.steps.length,
          amountBDT: s.amountBDT,
          dueDate: s.dueDate,
          days: daysUntil(s.dueDate, nowIso),
        })),
    )
    .filter((d) => d.days <= 30)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 10);

  const soldUnits = live.reduce((s, { h }) => s + h.units, 0);
  const converted = leads.filter((l) => l.status === "CONVERTED").length;

  const data: OverviewData = {
    contactRequestsNew,
    leads: {
      total: leads.length,
      newThisMonth: leads.filter((l) => monthKey(l.createdAt) === thisMonth).length,
      byStatus: LEAD_STATUSES.map((status) => ({ status, count: leads.filter((l) => l.status === status).length })),
      conversionRate: leads.length ? converted / leads.length : 0,
      followUpsDue: leads.filter(
        (l) =>
          l.nextFollowUpAt &&
          !["CONVERTED", "CLOSED"].includes(l.status) &&
          daysUntil(l.nextFollowUpAt.toISOString(), nowIso) <= 0,
      ).length,
      recent: leads.slice(0, 5).map((l) => ({
        id: l.id,
        name: l.name,
        status: l.status,
        packageSlug: l.packageSlug,
        investmentBDT: l.investmentBDT,
        createdAt: l.createdAt.toISOString(),
      })),
    },
    pendingApplications,
    newCandidates: await prisma.jobApplication.count({ where: { status: "NEW" } }).catch(() => 0),
    shareholderCount,
    shares: { total: TOTAL_SHARES, sold: soldUnits, active: live.filter(({ h }) => h.status === "ACTIVE").reduce((s, { h }) => s + h.units, 0) },
    money: {
      committedBDT: live.reduce((s, { h }) => s + h.totalAmountBDT, 0),
      collectedBDT: collected.reduce((s, p) => s + p.amountBDT, 0),
      outstandingBDT: live.reduce((s, { l }) => s + l.remainingBDT, 0),
      overdueBDT,
      overdueHoldings: overdue.length,
      pendingPayments: payments.filter((p) => p.status === "PENDING").length,
    },
    collectionsByMonth,
    byPlan: plans.map((plan) => {
      const ofPlan = live.filter(({ h }) => h.planId === plan.id);
      return {
        slug: plan.slug,
        name: plan.name,
        accentColor: plan.accentColor,
        holdings: ofPlan.length,
        units: ofPlan.reduce((s, { h }) => s + h.units, 0),
        committedBDT: ofPlan.reduce((s, { h }) => s + h.totalAmountBDT, 0),
      };
    }),
    upcomingDues,
    activity: activity.map((a) => ({
      id: a.id,
      actor: a.actor,
      action: a.action,
      target: a.target,
      createdAt: a.createdAt.toISOString(),
    })),
  };

  return NextResponse.json(data);
}
