"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { LogoMark } from "@/components/ui/Logo";
import { OverviewPanel } from "./OverviewPanel";
import { HoldingsPanel } from "./HoldingsPanel";
import { InvoicesPanel } from "./InvoicesPanel";
import { BuyPanel } from "./BuyPanel";
import { ProfilePanel } from "./ProfilePanel";
import { ApplicationsPanel, PaymentInstructionsCard, type AccountApplication } from "./ApplicationsPanel";
import { NotificationBell, type AccountNotification } from "./NotificationBell";
import type { AccountNotice, ContactContent, PaymentInstructions } from "@/data/cms-defaults";
import type { DashboardData } from "@/lib/account";
import { accountTabs, type AccountTabId } from "@/lib/account-tabs";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const paymentBanner: Record<string, { text: string; className: string }> = {
  success: {
    text: "Payment successful — thank you. Your installment tracker and receipt are updated.",
    className: "border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
  },
  failed: {
    text: "That payment did not go through and nothing was charged. You can try again below.",
    className: "border-red-300/30 bg-red-400/10 text-red-200",
  },
  reserved: {
    text: "Your shares are reserved. Pay using the bank or bKash details below and the Aven team will confirm it — or pay online here once it is switched on.",
    className: "border-gold-300/30 bg-gold-400/10 text-gold-200",
  },
  cancelled: {
    text: "Payment was cancelled. You can try again whenever you're ready.",
    className: "border-white/15 bg-white/5 text-cream-200/80",
  },
};

/**
 * The shareholder's dashboard: a dark, glassy field with a tab rail (a bottom
 * dock on phones). The active tab is mirrored into `?tab=` so any view can be
 * linked to or refreshed without losing place.
 */
export function AccountDashboard({
  data,
  initialTab,
  payment,
  applications,
  paymentInfo,
  notifications,
  receiptId,
  paymentMode,
  contact,
  notice,
}: {
  data: DashboardData;
  initialTab: AccountTabId;
  payment?: string;
  applications: AccountApplication[];
  paymentInfo: PaymentInstructions | null;
  notifications: AccountNotification[];
  receiptId?: string;
  paymentMode: "live" | "test" | "offline";
  contact: ContactContent;
  notice: AccountNotice | null;
}) {
  const [tab, setTab] = useState<AccountTabId>(initialTab);

  const select = useCallback((id: AccountTabId) => {
    setTab(id);
    window.history.replaceState(null, "", id === "overview" ? "/account" : `/account?tab=${id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const counts: Partial<Record<AccountTabId, number>> = {
    holdings: data.holdings.length,
    invoices: data.invoices.length,
    applications: applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length,
  };
  const banner = payment ? paymentBanner[payment] : undefined;
  const activeLabel = accountTabs.find((t) => t.id === tab)?.label;

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#03130e] pt-[var(--header-height)] text-cream-100">
      {/* Field: glows + hairline grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[36rem] w-[36rem] rounded-full bg-emerald-500/12 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-gold-400/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      </div>

      <div className="relative mx-auto flex max-w-[92rem] gap-8 px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-6 sm:px-6 sm:pt-8 lg:px-8 lg:pb-16">
        {/* Rail */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav
            aria-label="Account"
            className="sticky top-[calc(var(--header-height)+2rem)] rounded-3xl border border-white/8 bg-white/[0.03] p-3 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 px-3 pb-4 pt-2">
              {data.user.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- profile photo from /media
                <img src={data.user.photoUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-gold-400/40" />
              ) : (
                <span className="h-8 w-8"><LogoMark tone="light" /></span>
              )}
              <span>
                <span className="block text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">Shareholder</span>
                <span className="block truncate text-sm text-cream-50">{data.user.name}</span>
              </span>
            </div>
            <ul className="space-y-1">
              {accountTabs.map((t) => {
                const active = t.id === tab;
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => select(t.id)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left text-sm transition-colors",
                        active ? "text-forest-950" : "text-cream-200/70 hover:bg-white/5 hover:text-cream-50",
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="account-tab"
                          className="absolute inset-0 rounded-2xl bg-cream-50"
                          transition={{ type: "spring", stiffness: 380, damping: 34 }}
                        />
                      )}
                      <AdminIcon icon={t.icon} className="relative h-4.5 w-4.5" />
                      <span className="relative flex-1 font-medium">{t.label}</span>
                      {counts[t.id] ? (
                        <span
                          className={cn(
                            "relative rounded-full px-2 py-0.5 text-[0.625rem] font-semibold tabular-nums",
                            active ? "bg-forest-950/10" : "bg-white/8",
                          )}
                        >
                          {counts[t.id]}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 border-t border-white/8 px-3 pt-4 font-mono text-[0.625rem] tracking-[0.14em] text-cream-200/35">
              {data.user.memberId}
            </p>
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.24em] text-cream-200/40">My Aven</p>
              <h1 className="font-display text-3xl text-cream-50 sm:text-4xl">{activeLabel}</h1>
            </div>
            <NotificationBell initial={notifications} />
          </div>

          {notice && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold-300/25 bg-gradient-to-r from-gold-400/12 to-gold-400/[0.04] px-5 py-4">
              <div className="flex items-start gap-3">
                <AdminIcon icon="bell" className="mt-0.5 h-5 w-5 shrink-0 text-gold-300" />
                <div>
                  {notice.title && <p className="text-sm font-semibold text-cream-50">{notice.title}</p>}
                  {notice.text && <p className="mt-0.5 whitespace-pre-line text-[0.8125rem] leading-relaxed text-cream-200/70">{notice.text}</p>}
                </div>
              </div>
              {notice.linkLabel && notice.href && (
                <Link href={notice.href} className="shrink-0 rounded-full bg-gold-400 px-4 py-1.5 text-xs font-semibold text-forest-950 hover:bg-gold-300">
                  {notice.linkLabel}
                </Link>
              )}
            </div>
          )}

          {banner && (
            <div role="status" className={cn("mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-5 py-3 text-sm", banner.className)}>
              <p>{banner.text}</p>
              {receiptId && (
                <Link href={`/account/invoices/${receiptId}`} className="shrink-0 rounded-full bg-emerald-300/15 px-4 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-300/25">
                  View receipt →
                </Link>
              )}
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: easeOutExpo }}
            >
              {tab === "overview" && <OverviewPanel data={data} onNavigate={select} />}
              {tab === "holdings" && (
                <div className="space-y-5">
                  <HoldingsPanel data={data} onBuy={() => select("buy")} />
                  {paymentInfo && data.holdings.some((h) => !h.fullyPaid && h.status !== "CANCELLED") && <PaymentInstructionsCard info={paymentInfo} />}
                </div>
              )}
              {tab === "applications" && <ApplicationsPanel applications={applications} onHoldings={() => select("holdings")} />}
              {tab === "invoices" && <InvoicesPanel data={data} />}
              {tab === "buy" && (
                <div className="space-y-5">
                  <BuyPanel data={data} paymentMode={paymentMode} onOrdered={() => select("holdings")} />
                  {paymentInfo && <PaymentInstructionsCard info={paymentInfo} />}
                </div>
              )}
              {tab === "profile" && <ProfilePanel data={data} contact={contact} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Phone dock */}
      <nav
        aria-label="Account"
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 rounded-3xl border border-white/10 bg-[#03130e]/85 p-1.5 backdrop-blur-xl lg:hidden"
      >
        <ul className="grid grid-cols-6">
          {accountTabs.map((t) => {
            const active = t.id === tab;
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => select(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[0.625rem] font-medium transition-colors",
                    active ? "bg-cream-50 text-forest-950" : "text-cream-200/60",
                  )}
                >
                  <AdminIcon icon={t.icon} className="h-4.5 w-4.5" />
                  <span className="relative max-w-full truncate px-0.5">{t.short}</span>
                  {t.id === "applications" && counts.applications ? (
                    <span className="absolute right-[calc(50%-1.1rem)] top-1 h-2 w-2 rounded-full bg-gold-400 ring-2 ring-[#03130e]" aria-label={`${counts.applications} in review`} />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
