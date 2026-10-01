"use client";

/**
 * The admin design kit. One light, calm system — white cards on a soft
 * paper field, forest-green primary, gold for attention — so every tab reads
 * as the same product. Status is always a word plus a dot, never colour alone.
 */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { cn } from "@/lib/utils";
import { shrinkImage } from "@/lib/shrink-image";

/* ------------------------------------------------------------------ data */

/** GET a JSON endpoint with loading/error state and a `reload()`. */
export function useAdminFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!url) return;
    let alive = true;
    fetch(url)
      .then(async (r) => {
        const json = await r.json().catch(() => ({}));
        if (!alive) return;
        if (!r.ok) setError(json.error ?? "Could not load data.");
        else {
          setData(json as T);
          setError(null);
        }
      })
      .catch(() => alive && setError("Could not reach the server."))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [url, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading, reload };
}

/** POST/PATCH/PUT/DELETE JSON; resolves with `{ ok, json }` and never throws. */
export async function send(url: string, method: "POST" | "PATCH" | "PUT" | "DELETE", body?: unknown) {
  try {
    const r = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await r.json().catch(() => ({}));
    return { ok: r.ok, json } as { ok: boolean; json: Record<string, unknown> & { error?: string; errors?: Record<string, string> } };
  } catch {
    return { ok: false, json: { error: "Could not reach the server." } };
  }
}

export function firstError(json: { error?: string; errors?: Record<string, string> }) {
  return json.error ?? Object.values(json.errors ?? {})[0] ?? "Something went wrong.";
}

/* ----------------------------------------------------------------- toast */

type Toast = { id: number; text: string; tone: "success" | "error" };
const ToastCtx = createContext<(text: string, tone?: Toast["tone"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast["tone"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[80] flex flex-col gap-2" aria-live="polite">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-[0_12px_30px_-10px_rgba(4,26,20,0.35)]",
                t.tone === "success" ? "bg-forest-950 text-cream-50" : "bg-red-600 text-white",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", t.tone === "success" ? "bg-emerald-400" : "bg-white")} />
              {t.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

/* --------------------------------------------------------------- surfaces */

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-[#E6E8E3] bg-white shadow-[0_1px_2px_rgba(16,24,20,0.04)]", className)}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-3 border-b border-[#EEF0EC] px-5 py-4", className)}>
      <div>
        <h3 className="text-[0.9375rem] font-semibold text-[#14201B]">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-[#6B756F]">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[1.625rem] font-semibold tracking-tight text-[#14201B]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-[#6B756F]">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  icon,
  tone = "forest",
  onClick,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: string;
  tone?: "forest" | "gold" | "sky" | "red" | "violet";
  onClick?: () => void;
}) {
  const tones = {
    forest: "bg-emerald-50 text-emerald-700",
    gold: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    red: "bg-red-50 text-red-600",
    violet: "bg-violet-50 text-violet-700",
  };
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "group flex h-full w-full flex-col rounded-2xl border border-[#E6E8E3] bg-white p-5 text-left shadow-[0_1px_2px_rgba(16,24,20,0.04)] transition-all",
        onClick && "hover:-translate-y-0.5 hover:border-[#D5DAD3] hover:shadow-[0_10px_24px_-14px_rgba(16,24,20,0.25)]",
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-[#6B756F]">{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tones[tone])}>
          <AdminIcon icon={icon} className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-tight text-[#14201B] tabular-nums">{value}</p>
      {sub && <p className="mt-1 truncate text-xs text-[#6B756F]">{sub}</p>}
    </Tag>
  );
}

/* --------------------------------------------------------------- controls */

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "gold";

export function Btn({
  variant = "secondary",
  size = "md",
  icon,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: "sm" | "md";
  icon?: string;
}) {
  const variants: Record<BtnVariant, string> = {
    primary: "bg-forest-700 text-white hover:bg-forest-800 shadow-sm",
    gold: "bg-gold-400 text-forest-950 hover:bg-gold-300 shadow-sm",
    secondary: "border border-[#DDE1DB] bg-white text-[#24312B] hover:bg-[#F5F7F3]",
    ghost: "text-[#3D4A44] hover:bg-[#EEF1EC]",
    danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        size === "sm" ? "h-8 px-3 text-xs" : "h-9 px-3.5 text-[0.8125rem]",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {icon && <AdminIcon icon={icon} className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />}
      {children}
    </button>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-1 rounded-xl bg-[#EEF1EC] p-1", className)} role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
            value === o.value ? "bg-white text-[#14201B] shadow-sm" : "text-[#5C6862] hover:text-[#14201B]",
          )}
        >
          {o.label}
          {typeof o.count === "number" && (
            <span className={cn("rounded-full px-1.5 text-[0.625rem] tabular-nums", value === o.value ? "bg-[#EEF1EC]" : "bg-white/70")}>
              {o.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={cn("relative block", className)}>
      <span className="sr-only">{placeholder}</span>
      <AdminIcon icon="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A948E]" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-[#DDE1DB] bg-white pl-9 pr-3 text-[0.8125rem] text-[#14201B] outline-none transition-shadow placeholder:text-[#9AA39E] focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10"
      />
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border border-[#DDE1DB] bg-white px-3 text-[0.8125rem] text-[#14201B] outline-none transition-shadow placeholder:text-[#9AA39E] focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10 disabled:bg-[#F5F7F3]";

export function Field({
  label,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: (id: string) => React.ReactNode;
}) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#3D4A44]">
        {label}
      </label>
      {children(id)}
      {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1 text-xs text-[#8A948E]">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, "h-9", props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "py-2 leading-relaxed", props.className)} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputCls, "h-9 pr-8", props.className)} />;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2.5 text-[0.8125rem] text-[#24312B]"
    >
      <span className={cn("relative h-5 w-9 rounded-full transition-colors", checked ? "bg-forest-600" : "bg-[#D5DAD3]")}>
        <span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all", checked ? "left-[1.125rem]" : "left-0.5")} />
      </span>
      {label}
    </button>
  );
}

/* ----------------------------------------------------------------- badges */

const badgeTones = {
  gray: "bg-[#F0F2EF] text-[#4B5751] ring-[#E1E5DF]",
  blue: "bg-sky-50 text-sky-700 ring-sky-200/70",
  violet: "bg-violet-50 text-violet-700 ring-violet-200/70",
  amber: "bg-amber-50 text-amber-700 ring-amber-200/70",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
  red: "bg-red-50 text-red-600 ring-red-200/70",
  teal: "bg-teal-50 text-teal-700 ring-teal-200/70",
} as const;
const dotTones: Record<keyof typeof badgeTones, string> = {
  gray: "bg-[#8A948E]",
  blue: "bg-sky-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  green: "bg-emerald-500",
  red: "bg-red-500",
  teal: "bg-teal-500",
};
export type BadgeTone = keyof typeof badgeTones;

export function Badge({ tone = "gray", children, className }: { tone?: BadgeTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.6875rem] font-medium ring-1 ring-inset",
        badgeTones[tone],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotTones[tone])} />
      {children}
    </span>
  );
}

/** Shared vocabularies so a status looks the same on every screen. */
export const leadStages = [
  { value: "NEW", label: "New", tone: "blue" },
  { value: "CONTACTED", label: "Contacted", tone: "violet" },
  { value: "INTERESTED", label: "Interested", tone: "teal" },
  { value: "FOLLOW_UP", label: "Follow-up", tone: "amber" },
  { value: "CONVERTED", label: "Converted", tone: "green" },
  { value: "CLOSED", label: "Closed", tone: "gray" },
] as const satisfies readonly { value: string; label: string; tone: BadgeTone }[];

export function LeadBadge({ status }: { status: string }) {
  const s = leadStages.find((x) => x.value === status) ?? leadStages[0];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

const paymentTone: Record<string, [BadgeTone, string]> = {
  SUCCESS: ["green", "Paid"],
  PENDING: ["amber", "Pending"],
  FAILED: ["red", "Failed"],
  CANCELLED: ["gray", "Void"],
  UPCOMING: ["gray", "Upcoming"],
  OVERDUE: ["red", "Overdue"],
  ACTIVE: ["green", "Active"],
  PENDING_PAYMENT: ["amber", "Awaiting payment"],
  SUBMITTED: ["blue", "Submitted"],
  UNDER_REVIEW: ["violet", "Under review"],
  APPROVED: ["green", "Approved"],
  REJECTED: ["red", "Rejected"],
};

export function StatusBadge({ status }: { status: string }) {
  const [tone, label] = paymentTone[status] ?? ["gray", status];
  return <Badge tone={tone}>{label}</Badge>;
}

/* --------------------------------------------------------------- overlays */

export function Drawer({
  open,
  onClose,
  title,
  subtitle,
  width = "max-w-2xl",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  width?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-[#0B1511]/40 backdrop-blur-[2px]"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-modal="true"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 36 }}
            className={cn("fixed inset-y-0 right-0 z-[61] flex w-full flex-col bg-[#F7F8F6] shadow-2xl", width)}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#E6E8E3] bg-white px-6 py-5">
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold text-[#14201B]">{title}</div>
                {subtitle && <div className="mt-1 text-xs text-[#6B756F]">{subtitle}</div>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close panel"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#6B756F] hover:bg-[#EEF1EC]"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="border-t border-[#E6E8E3] bg-white px-6 py-4">{footer}</div>}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEscape(open, onClose);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0B1511]/45 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="border-b border-[#EEF0EC] px-6 py-4">
              <h2 className="text-base font-semibold text-[#14201B]">{title}</h2>
            </div>
            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-[#EEF0EC] bg-[#FAFBF9] px-6 py-3.5">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/** Open overlays, newest last — Escape closes only the top one (a modal over a drawer, not both). */
const overlayStack: symbol[] = [];

function useEscape(open: boolean, onClose: () => void) {
  const ref = useRef(onClose);
  useEffect(() => {
    ref.current = onClose;
  });
  useEffect(() => {
    if (!open) return;
    const me = Symbol("overlay");
    overlayStack.push(me);
    const h = (e: KeyboardEvent) => e.key === "Escape" && overlayStack[overlayStack.length - 1] === me && ref.current();
    window.addEventListener("keydown", h);
    return () => {
      window.removeEventListener("keydown", h);
      overlayStack.splice(overlayStack.indexOf(me), 1);
    };
  }, [open]);
}

/* ------------------------------------------------------------------ misc */

export function Empty({ icon = "search", title, children }: { icon?: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF1EC] text-[#6B756F]">
        <AdminIcon icon={icon} className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-semibold text-[#14201B]">{title}</p>
      {children && <div className="mt-1 max-w-sm text-xs text-[#6B756F]">{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-lg bg-[#ECEFEA]", className)} />;
}

export function LoadingRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5 p-5">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-10" />
      ))}
    </div>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{children}</p>;
}

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element -- small avatar from /media, no optimisation needed
    return <img src={src} alt="" aria-hidden="true" className={cn("h-9 w-9 shrink-0 rounded-full object-cover", className)} />;
  }
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
  // Stable hue from the name, kept in the calm green/teal/amber band.
  const hues = ["#D8EBDF", "#DCEBF0", "#F1E6CF", "#E6E1F1", "#DDEEE9"];
  const inks = ["#1E5A3C", "#1E5367", "#7A5A17", "#4B3D7A", "#1F5F53"];
  const i = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % hues.length;
  return (
    <span
      className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", className)}
      style={{ background: hues[i], color: inks[i] }}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}

export function DefinitionGrid({ items, cols = 2 }: { items: { k: string; v: React.ReactNode }[]; cols?: 2 | 3 }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-4", cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2")}>
      {items.map((i) => (
        <div key={i.k} className="min-w-0">
          <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">{i.k}</dt>
          <dd className="mt-0.5 break-words text-[0.8125rem] text-[#14201B]">{i.v || <span className="text-[#9AA39E]">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Relative time, e.g. "3h ago", "in 2 days". */
export function relTime(iso: string, now = Date.now()) {
  const diff = new Date(iso).getTime() - now;
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [86_400_000 * 30, "mo"],
    [86_400_000, "d"],
    [3_600_000, "h"],
    [60_000, "m"],
  ];
  for (const [ms, u] of units) {
    if (abs >= ms) {
      const n = Math.round(abs / ms);
      return diff < 0 ? `${n}${u} ago` : `in ${n}${u}`;
    }
  }
  return "just now";
}

/** Downloads a CSV from an /api/admin/export route (a file response, so not a client-side route). */
export function ExportButton({ kind, label = "Export CSV" }: { kind: "leads" | "customers" | "payments" | "dues"; label?: string }) {
  return (
    <Btn icon="download" onClick={() => downloadFile(`/api/admin/export/${kind}`)}>
      {label}
    </Btn>
  );
}

function downloadFile(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  a.click();
}

/* ---------------------------------------------------------------- uploads */

/** Uploads an image to the media library; resolves with its URL or an error message. */
export async function uploadImage(file: File): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    const fd = new FormData();
    fd.append("file", await shrinkImage(file));
    const r = await fetch("/api/admin/assets/upload", { method: "POST", body: fd });
    const json = await r.json().catch(() => ({}));
    return r.ok ? { ok: true, url: json.url } : { ok: false, error: json.error ?? "Upload failed." };
  } catch {
    return { ok: false, error: "Upload failed. Please try again." };
  }
}
