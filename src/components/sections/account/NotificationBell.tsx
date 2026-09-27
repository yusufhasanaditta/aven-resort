"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type AccountNotification = {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  read: boolean;
  createdAt: string;
};

const kindTone: Record<string, string> = {
  OVERDUE: "bg-red-400",
  DUE_TODAY: "bg-gold-400",
  DUE_SOON: "bg-sky-300",
  REMINDER: "bg-gold-400",
  PAYMENT_RECEIVED: "bg-emerald-300",
};

function ago(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.round(h / 24);
  return d === 1 ? "yesterday" : `${d} days ago`;
}

/**
 * The shareholder's inbox: installment reminders and payment receipts, the
 * same messages that are emailed. Opening it marks everything read.
 */
export function NotificationBell({ initial }: { initial: AccountNotification[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  function toggle() {
    const next = !open;
    setOpen(next);
    if (next && unread) {
      fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "read-all" }) }).catch(() => {});
      // Keep the dots visible while the panel is open; they clear next time.
      setTimeout(() => setItems((xs) => xs.map((n) => ({ ...n, read: true }))), 2500);
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-cream-100 transition-colors hover:bg-white/10"
      >
        <AdminIcon icon="bell" className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-400 px-1 text-[0.625rem] font-bold text-forest-950 ring-2 ring-[#03130e]">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: easeOutExpo }}
            className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(24rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-3xl border border-white/10 bg-[#071d16]/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-3.5">
              <p className="text-sm font-semibold text-cream-50">Notifications</p>
              <p className="text-[0.6875rem] text-cream-200/45">Also sent to your email</p>
            </div>
            {items.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-cream-200/55">
                No notifications yet. Installment reminders and payment receipts will appear here.
              </p>
            ) : (
              <ul className="max-h-[26rem] divide-y divide-white/6 overflow-y-auto">
                {items.map((n) => {
                  const inner = (
                    <>
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read ? "bg-white/15" : kindTone[n.kind] ?? "bg-gold-400")} />
                      <span className="min-w-0">
                        <span className={cn("block text-[0.8125rem]", n.read ? "text-cream-100/80" : "font-semibold text-cream-50")}>{n.title}</span>
                        <span className="mt-0.5 block whitespace-pre-line text-xs leading-relaxed text-cream-200/55">{n.body}</span>
                        <span className="mt-1 block text-[0.625rem] text-cream-200/35">{ago(n.createdAt)}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={n.id}>
                      {n.href ? (
                        <Link href={n.href} onClick={() => setOpen(false)} className="flex gap-3 px-5 py-3.5 transition-colors hover:bg-white/[0.04]">
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex gap-3 px-5 py-3.5">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
