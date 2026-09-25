"use client";

import { Logo } from "@/components/ui/Logo";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { LogoutButton } from "@/components/sections/AccountActions";
import { cn } from "@/lib/utils";

export const adminTabs = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "shareholders", label: "Shareholders", icon: "users" },
  { id: "inquiries", label: "Enquiries", icon: "mail" },
  { id: "plans", label: "Membership plans", icon: "tag" },
  { id: "assets", label: "Site media", icon: "image" },
] as const;

export type AdminTabId = (typeof adminTabs)[number]["id"];

/** Persistent dark sidebar nav for the admin control room, desktop and drawer variants share this. */
export function AdminSidebar({
  active,
  onSelect,
  adminName,
  counts,
  onClose,
}: {
  active: AdminTabId;
  onSelect: (id: AdminTabId) => void;
  adminName: string;
  counts?: Partial<Record<AdminTabId, number>>;
  onClose?: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-forest-950 text-cream-100">
      <div className="flex items-center justify-between px-6 pb-6 pt-7">
        <Logo tone="light" />
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin menu"
            className="flex h-8 w-8 items-center justify-center rounded-full text-cream-100/70 hover:bg-cream-50/10 lg:hidden"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <p className="px-6 pb-4 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-gold-400/80">
        Control room
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {adminTabs.map((tab) => {
          const isActive = active === tab.id;
          const count = counts?.[tab.id];
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              aria-current={isActive}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors",
                isActive
                  ? "bg-cream-50 text-forest-900"
                  : "text-cream-100/75 hover:bg-cream-50/8 hover:text-cream-50",
              )}
            >
              <AdminIcon
                icon={tab.icon}
                className={cn("h-4.5 w-4.5", isActive ? "text-forest-700" : "text-cream-200/60")}
              />
              <span className="flex-1 font-medium">{tab.label}</span>
              {typeof count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold tabular-nums",
                    isActive ? "bg-forest-600/10 text-forest-700" : "bg-cream-50/10 text-cream-200/70",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-cream-50/10 px-6 py-5">
        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/40">
          Signed in as
        </p>
        <p className="mt-1 truncate text-sm font-medium text-cream-50">{adminName}</p>
        <div className="mt-3">
          <LogoutButton tone="light" />
        </div>
      </div>
    </div>
  );
}
