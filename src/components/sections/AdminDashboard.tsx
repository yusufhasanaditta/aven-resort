"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminSidebar, adminTabs, type AdminTabId } from "@/components/sections/admin/AdminSidebar";
import { OverviewTab } from "@/components/sections/admin/OverviewTab";
import { UsersTab } from "@/components/sections/admin/UsersTab";
import { InquiriesTab } from "@/components/sections/admin/InquiriesTab";
import { PlansTab } from "@/components/sections/admin/PlansTab";
import { AssetsTab } from "@/components/sections/admin/AssetsTab";
import type { OverviewData } from "@/lib/admin-types";

/**
 * The admin control room: a persistent dark sidebar (drawer on mobile) plus a
 * cream content pane. Badge counts on the nav come from the same overview
 * fetch each tab uses, so the sidebar always agrees with what's inside.
 */
export function AdminDashboard({ adminName }: { adminName: string }) {
  const [active, setActive] = useState<AdminTabId>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [overview, setOverview] = useState<OverviewData | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => json && !json.error && setOverview(json))
      .catch(() => {});
  }, []);

  const activeLabel = adminTabs.find((t) => t.id === active)?.label ?? "Overview";

  const counts = overview
    ? { shareholders: overview.userCount, inquiries: overview.inquiryCount }
    : undefined;

  function select(id: AdminTabId) {
    setActive(id);
    setDrawerOpen(false);
  }

  return (
    <div className="min-h-[100svh] bg-cream-100 pt-[var(--header-height)] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-[var(--header-height)] h-[calc(100svh-var(--header-height))]">
          <AdminSidebar active={active} onSelect={select} adminName={adminName} counts={counts} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-forest-950/60 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] lg:hidden"
            >
              <AdminSidebar
                active={active}
                onSelect={select}
                adminName={adminName}
                counts={counts}
                onClose={() => setDrawerOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Content */}
      <div className="flex-1 lg:min-w-0">
        <div className="sticky top-[var(--header-height)] z-30 flex items-center gap-3 border-b border-forest-600/10 bg-cream-100/90 px-5 py-4 backdrop-blur sm:px-8 lg:hidden">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin menu"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-forest-600/15 text-forest-700"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path
                d="M2 4h12M2 8h12M2 12h12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="font-display text-lg text-forest-900">{activeLabel}</p>
        </div>

        <div className="px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <p className="hidden text-eyebrow text-forest-600/50 lg:block">Control room</p>
          <h1 className="hidden font-display text-display-sm text-forest-900 lg:block">
            {activeLabel}
          </h1>

          <div className="mt-2 lg:mt-8">
            {active === "overview" && <OverviewTab data={overview} />}
            {active === "shareholders" && <UsersTab />}
            {active === "inquiries" && <InquiriesTab />}
            {active === "plans" && <PlansTab />}
            {active === "assets" && <AssetsTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
