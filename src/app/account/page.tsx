import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { runInstallmentReminders } from "@/lib/notify";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildDashboard, memberIdFor } from "@/lib/account";
import { FirstPasswordGate } from "@/components/sections/account/FirstPasswordGate";
import { getContent } from "@/lib/cms";
import { isAccountTab } from "@/lib/account-tabs";
import { paymentMode } from "@/lib/payments";
import { AccountDashboard } from "@/components/sections/account/AccountDashboard";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string; tab?: string; tran?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  if (user.mustChangePassword) return <FirstPasswordGate name={user.name} memberId={memberIdFor(user)} />;

  const { payment, tab, tran } = await searchParams;

  // Catch up on any reminder the daily job hasn't sent yet — after the page is on its way.
  after(() => runInstallmentReminders({ userId: user.id }).catch((err) => console.error("Reminder catch-up failed", err)));

  const [holdings, plans, applications, paymentInfo, contact, notice, notifications] = await Promise.all([
    prisma.shareHolding.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { plan: true, payments: { orderBy: [{ installmentNo: "asc" }, { createdAt: "asc" }] } },
    }),
    prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.application.findMany({ where: { userId: user.id }, omit: { passwordHash: true }, orderBy: { createdAt: "desc" } }),
    getContent("payment"),
    getContent("contact"),
    getContent("accountNotice"),
    prisma.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 30 }),
  ]);

  const data = buildDashboard(user, holdings, plans);
  const settled = tran ? holdings.flatMap((h) => h.payments).find((p) => p.tranId === tran) : undefined;
  const activeTab = isAccountTab(tab) ? tab : "overview";

  return (
    <AccountDashboard
      key={activeTab + (tran ?? "")}
      data={data}
      initialTab={activeTab}
      payment={payment}
      receiptId={settled?.status === "SUCCESS" ? settled.id : undefined}
      paymentMode={paymentMode()}
      applications={applications.map((a) => ({
        id: a.id,
        planSlug: a.planSlug,
        units: a.units,
        paymentPlan: a.paymentPlan,
        installmentMonths: a.installmentMonths,
        quotedTotalBDT: a.quotedTotalBDT,
        status: a.status,
        adminNote: a.status === "REJECTED" ? a.adminNote : null,
        createdAt: a.createdAt.toISOString(),
        reviewedAt: a.reviewedAt?.toISOString() ?? null,
      }))}
      paymentInfo={paymentInfo.enabled ? paymentInfo : null}
      contact={contact}
      notice={notice.enabled && (notice.title.trim() || notice.text.trim()) ? notice : null}
      notifications={notifications.map((n) => ({
        id: n.id,
        kind: n.kind,
        title: n.title,
        body: n.body,
        href: n.href,
        read: !!n.readAt,
        createdAt: n.createdAt.toISOString(),
      }))}
    />
  );
}
