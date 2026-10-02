"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { LogoMark } from "@/components/ui/Logo";
import { Avatar, Modal, ToastProvider, useAdminFetch } from "./kit";
import { ChangePasswordForm } from "@/components/sections/account/ProfileForms";
import { OverviewTab } from "./tabs/OverviewTab";
import { LeadsTab } from "./tabs/LeadsTab";
import { ContactsTab } from "./tabs/ContactsTab";
import { ApplicationsTab } from "./tabs/ApplicationsTab";
import { CustomersTab } from "./tabs/CustomersTab";
import { InstallmentsTab } from "./tabs/InstallmentsTab";
import { PaymentsTab } from "./tabs/PaymentsTab";
import { PackagesTab } from "./tabs/PackagesTab";
import { CareersTab } from "./tabs/CareersTab";
import { ContentTab } from "./tabs/ContentTab";
import { MediaTab } from "./tabs/MediaTab";
import { ActivityTab } from "./tabs/ActivityTab";
import type { OverviewData } from "@/lib/admin-types";
import { ADMIN_TABS, type AdminTabId, type TabFocus } from "@/lib/admin-tabs";
import { cn } from "@/lib/utils";

export type AdminNav = (tab: AdminTabId, focus?: TabFocus) => void;
export type { AdminTabId, TabFocus };

export function AdminShell({ adminName, initialTab }: { adminName: string; initialTab: AdminTabId }) {
  return (
    <ToastProvider>
      <Shell adminName={adminName} initialTab={initialTab} />
    </ToastProvider>
  );
}

function Shell({ adminName, initialTab }: { adminName: string; initialTab: AdminTabId }) {
  const [state, setState] = useState<{ tab: AdminTabId; focus: TabFocus; nonce: number }>({ tab: initialTab, focus: {}, nonce: 0 });
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const overview = useAdminFetch<OverviewData>("/api/admin/overview");

  const nav = useCallback<AdminNav>((tab, focus = {}) => {
    setState((s) => ({ tab, focus, nonce: s.nonce + 1 }));
    setDrawer(false);
    setPalette(false);
    window.history.replaceState(null, "", tab === "overview" ? "/admin" : `/admin?tab=${tab}`);
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((p) => !p);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const o = overview.data;
  const badges: Partial<Record<AdminTabId, { n: number; tone: "red" | "amber" | "gray" }>> = o
    ? {
        leads: { n: o.leads.byStatus.find((s) => s.status === "NEW")?.count ?? 0, tone: "gray" },
        contacts: { n: o.contactRequestsNew, tone: "amber" },
        applications: { n: o.pendingApplications, tone: "amber" },
        installments: { n: o.money.overdueHoldings, tone: "red" },
        payments: { n: o.money.pendingPayments, tone: "amber" },
      }
    : {};

  const changed = overview.reload;
  const { tab, focus, nonce } = state;
  const key = `${tab}-${nonce}`;

  return (
    <div className="min-h-[100svh] bg-[#F4F6F2] font-sans text-[#14201B] lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-[#E3E7E1] bg-white lg:block">
        <div className="sticky top-0 h-[100svh]">
          <Sidebar active={tab} badges={badges} nav={nav} />
        </div>
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDrawer(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden"
            >
              <Sidebar active={tab} badges={badges} nav={nav} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="min-w-0 flex-1">
        <TopBar adminName={adminName} overview={o} nav={nav} onMenu={() => setDrawer(true)} onSearch={() => setPalette(true)} />
        <main className="mx-auto max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {tab === "overview" && <OverviewTab key={key} data={o} error={overview.error} nav={nav} />}
          {tab === "leads" && <LeadsTab key={key} focus={focus} onChanged={changed} />}
          {tab === "contacts" && <ContactsTab key={key} nav={nav} onChanged={changed} />}
          {tab === "applications" && <ApplicationsTab key={key} focus={focus} nav={nav} onChanged={changed} />}
          {tab === "customers" && <CustomersTab key={key} focus={focus} onChanged={changed} />}
          {tab === "installments" && <InstallmentsTab key={key} focus={focus} nav={nav} onChanged={changed} />}
          {tab === "payments" && <PaymentsTab key={key} focus={focus} onChanged={changed} />}
          {tab === "packages" && <PackagesTab key={key} />}
          {tab === "content" && <ContentTab key={key} />}
          {tab === "careers" && <CareersTab key={key} focus={focus} />}
          {tab === "media" && <MediaTab key={key} />}
          {tab === "activity" && <ActivityTab key={key} />}
        </main>
      </div>

      <CommandPalette open={palette} onClose={() => setPalette(false)} nav={nav} />
    </div>
  );
}

/* ---------------------------------------------------------------- sidebar */

function Sidebar({
  active,
  badges,
  nav,
}: {
  active: AdminTabId;
  badges: Partial<Record<AdminTabId, { n: number; tone: "red" | "amber" | "gray" }>>;
  nav: AdminNav;
}) {
  const groups = [...new Set(ADMIN_TABS.map((t) => t.group))];
  return (
    <div className="flex h-full flex-col border-r border-[#E3E7E1] bg-white">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest-950 p-1.5">
          <LogoMark tone="light" />
        </span>
        <span>
          <span className="block text-sm font-semibold tracking-[0.2em] text-[#14201B]">AVEN</span>
          <span className="block text-[0.625rem] font-medium text-[#8A948E]">Admin console</span>
        </span>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g} className="mb-4">
            <p className="px-3 pb-1.5 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-[#9AA39E]">{g}</p>
            <ul className="space-y-0.5">
              {ADMIN_TABS.filter((t) => t.group === g).map((t) => {
                const on = t.id === active;
                const b = badges[t.id];
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => nav(t.id)}
                      aria-current={on ? "page" : undefined}
                      className={cn(
                        "relative flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem] font-medium transition-colors",
                        on ? "bg-forest-50 text-forest-800" : "text-[#4B5751] hover:bg-[#F4F6F2] hover:text-[#14201B]",
                      )}
                    >
                      {on && <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-forest-600" />}
                      <AdminIcon icon={t.icon} className={cn("h-4 w-4", on ? "text-forest-600" : "text-[#8A948E]")} />
                      <span className="flex-1">{t.label}</span>
                      {b && b.n > 0 && (
                        <span
                          className={cn(
                            "min-w-5 rounded-full px-1.5 py-px text-center text-[0.625rem] font-semibold tabular-nums",
                            b.tone === "red" ? "bg-red-500 text-white" : b.tone === "amber" ? "bg-amber-400 text-amber-950" : "bg-[#E8ECE6] text-[#3D4A44]",
                          )}
                        >
                          {b.n}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 p-4 text-white">
        <p className="text-xs font-semibold">Aven Eco Luxury Resort</p>
        <p className="mt-0.5 text-[0.6875rem] text-white/60">2,700 shares · 5 packages</p>
        <Link href="/" target="_blank" className="mt-3 inline-flex items-center gap-1 text-[0.6875rem] font-semibold text-gold-300 hover:underline">
          Open website ↗
        </Link>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- top bar */

function TopBar({
  adminName,
  overview,
  nav,
  onMenu,
  onSearch,
}: {
  adminName: string;
  overview: OverviewData | null;
  nav: AdminNav;
  onMenu: () => void;
  onSearch: () => void;
}) {
  const router = useRouter();
  const [menu, setMenu] = useState<"bell" | "create" | "user" | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(null);
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, [menu]);

  const alerts = overview
    ? [
        overview.money.overdueHoldings > 0 && { text: `${overview.money.overdueHoldings} holdings have overdue installments`, go: () => nav("installments", { filter: "overdue" }), tone: "bg-red-500" },
        overview.leads.followUpsDue > 0 && { text: `${overview.leads.followUpsDue} lead follow-ups due`, go: () => nav("leads", { filter: "due" }), tone: "bg-amber-500" },
        overview.pendingApplications > 0 && { text: `${overview.pendingApplications} applications waiting for review`, go: () => nav("applications"), tone: "bg-violet-500" },
        overview.contactRequestsNew > 0 && { text: `${overview.contactRequestsNew} new contact requests`, go: () => nav("contacts"), tone: "bg-sky-500" },
        overview.money.pendingPayments > 0 && { text: `${overview.money.pendingPayments} payments awaiting confirmation`, go: () => nav("payments", { filter: "PENDING" }), tone: "bg-sky-500" },
      ].filter(Boolean) as { text: string; go: () => void; tone: string }[]
    : [];

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header ref={ref} className="sticky top-0 z-30 border-b border-[#E3E7E1] bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[96rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenu} aria-label="Open admin menu" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#3D4A44] hover:bg-[#F0F2EF] lg:hidden">
          <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none"><path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>

        <button
          type="button"
          onClick={onSearch}
          className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-[#E3E7E1] bg-[#F7F8F6] px-3 text-left text-[0.8125rem] text-[#8A948E] transition-colors hover:border-[#D5DAD3] sm:max-w-md"
        >
          <AdminIcon icon="search" className="h-4 w-4" />
          <span className="flex-1 truncate"><span className="sm:hidden">Search…</span><span className="hidden sm:inline">Search leads, shareholders, payments…</span></span>
          <kbd className="hidden rounded border border-[#DDE1DB] bg-white px-1.5 py-0.5 font-sans text-[0.625rem] text-[#6B756F] sm:inline">Ctrl K</kbd>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === "create" ? null : "create")} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-forest-700 px-3 text-[0.8125rem] font-medium text-white hover:bg-forest-800">
              <span className="text-base leading-none">+</span> <span className="hidden sm:inline">New</span>
            </button>
            {menu === "create" && (
              <Menu>
                <MenuItem icon="users" onClick={() => { setMenu(null); nav("leads", { create: true }); }}>Lead</MenuItem>
                <MenuItem icon="user" onClick={() => { setMenu(null); nav("customers", { create: true }); }}>Shareholder account</MenuItem>
                <MenuItem icon="layers" onClick={() => { setMenu(null); nav("customers", { sell: true }); }}>Share sale (cash / bank)</MenuItem>
                <MenuItem icon="wallet" onClick={() => { setMenu(null); nav("payments", { create: true }); }}>Payment record</MenuItem>
                <MenuItem icon="briefcase" onClick={() => { setMenu(null); nav("careers", { create: true }); }}>Job circular</MenuItem>
                <MenuItem icon="layers" onClick={() => { setMenu(null); nav("content"); }}>FAQ or page content</MenuItem>
              </Menu>
            )}
          </div>

          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === "bell" ? null : "bell")} aria-label={`Notifications (${alerts.length})`} className="relative flex h-9 w-9 items-center justify-center rounded-lg text-[#3D4A44] hover:bg-[#F0F2EF]">
              <AdminIcon icon="bell" className="h-[1.125rem] w-[1.125rem]" />
              {alerts.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />}
            </button>
            {menu === "bell" && (
              <Menu wide>
                <p className="px-3 pb-2 pt-1 text-xs font-semibold text-[#14201B]">Needs attention</p>
                {alerts.length === 0 ? (
                  <p className="px-3 pb-2 text-xs text-[#8A948E]">All clear — nothing waiting on you.</p>
                ) : (
                  alerts.map((a) => (
                    <button key={a.text} type="button" onClick={() => { a.go(); setMenu(null); }} className="flex w-full items-start gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem] text-[#24312B] hover:bg-[#F4F6F2]">
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", a.tone)} />
                      {a.text}
                    </button>
                  ))
                )}
              </Menu>
            )}
          </div>

          <div className="relative">
            <button type="button" onClick={() => setMenu(menu === "user" ? null : "user")} className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-[#F0F2EF]" aria-label="Account menu">
              <Avatar name={adminName} className="h-8 w-8 text-[0.6875rem]" />
              <span className="hidden text-[0.8125rem] font-medium text-[#24312B] md:inline">{adminName}</span>
            </button>
            {menu === "user" && (
              <Menu>
                <MenuItem icon="overview" onClick={() => { setMenu(null); window.open("/", "_blank"); }}>View website</MenuItem>
                <MenuItem icon="user" onClick={() => { setMenu(null); setPasswordOpen(true); }}>Change password</MenuItem>
                <MenuItem icon="logout" onClick={logout}>Sign out</MenuItem>
              </Menu>
            )}
          </div>
        </div>
      </div>
      <Modal open={passwordOpen} onClose={() => setPasswordOpen(false)} title="Change your password">
        <ChangePasswordForm tone="light" />
      </Modal>
    </header>
  );
}

function Menu({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("absolute right-0 top-11 z-40 rounded-xl border border-[#E3E7E1] bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(16,24,20,0.35)]", wide ? "w-80" : "w-52")}
    >
      {children}
    </motion.div>
  );
}

function MenuItem({ icon, onClick, children }: { icon: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem] text-[#24312B] hover:bg-[#F4F6F2]">
      <AdminIcon icon={icon} className="h-4 w-4 text-[#8A948E]" />
      {children}
    </button>
  );
}

/* --------------------------------------------------------- command palette */

type Result = { type: "lead" | "customer" | "application" | "payment"; id: string; title: string; subtitle: string; customerId?: string };

function CommandPalette({ open, onClose, nav }: { open: boolean; onClose: () => void; nav: AdminNav }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const t = setTimeout(() => {
      fetch(`/api/admin/search?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((j) => {
          setResults(j.results ?? []);
          setSel(0);
        })
        .catch(() => setResults([]));
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const commands = ADMIN_TABS.filter((t) => !q.trim() || t.label.toLowerCase().includes(q.trim().toLowerCase())).map((t) => ({
    key: `go-${t.id}`,
    title: `Go to ${t.label}`,
    subtitle: t.group,
    icon: t.icon,
    run: () => nav(t.id),
  }));
  const found = (q.trim().length >= 2 ? results : []).map((r) => ({
    key: `${r.type}-${r.id}`,
    title: r.title,
    subtitle: r.subtitle,
    icon: r.type === "lead" ? "users" : r.type === "customer" ? "user" : r.type === "application" ? "invoice" : "wallet",
    run: () =>
      r.type === "lead"
        ? nav("leads", { id: r.id })
        : r.type === "customer"
          ? nav("customers", { id: r.id })
          : r.type === "application"
            ? nav("applications", { id: r.id })
            : nav("customers", { id: r.customerId }),
  }));
  const items = [...found, ...commands];

  function close() {
    setQ("");
    setResults([]);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center p-4 pt-[12vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0B1511]/40 backdrop-blur-sm" onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-[#EEF0EC] px-4">
              <AdminIcon icon="search" className="h-5 w-5 text-[#8A948E]" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") close();
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setSel((s) => Math.min(items.length - 1, s + 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setSel((s) => Math.max(0, s - 1));
                  }
                  if (e.key === "Enter" && items[sel]) {
                    items[sel].run();
                    close();
                  }
                }}
                placeholder="Search a name, phone, NID, TrxID — or jump to a page"
                aria-label="Search"
                className="h-14 flex-1 bg-transparent text-[0.9375rem] outline-none placeholder:text-[#9AA39E]"
              />
              <kbd className="rounded border border-[#DDE1DB] px-1.5 py-0.5 text-[0.625rem] text-[#6B756F]">Esc</kbd>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-[#8A948E]">No matches.</li>}
              {items.map((it, i) => (
                <li key={it.key}>
                  <button
                    type="button"
                    onMouseEnter={() => setSel(i)}
                    onClick={() => {
                      it.run();
                      close();
                    }}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left", sel === i ? "bg-forest-50" : "hover:bg-[#F7F8F6]")}
                  >
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", sel === i ? "bg-forest-600 text-white" : "bg-[#F0F2EF] text-[#6B756F]")}>
                      <AdminIcon icon={it.icon} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[0.8125rem] font-medium text-[#14201B]">{it.title}</span>
                      <span className="block truncate text-[0.6875rem] text-[#8A948E]">{it.subtitle}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
