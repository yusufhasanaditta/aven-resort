import { cn } from "@/lib/utils";
import type { StepStatus } from "@/lib/account";

/** A frosted panel on the dashboard's dark field. */
export function Glass({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: "div" | "section" | "article";
}) {
  return (
    <Tag
      className={cn(
        "relative border border-white/[0.08] bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl",
        // A caller's padding or radius replaces the default (cn() joins classes, it does not merge them).
        !/(^|\s)p-/.test(className ?? "") && "p-4 sm:p-6",
        !/(^|\s)rounded-/.test(className ?? "") && "rounded-3xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function PanelTitle({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-1 font-display text-2xl text-cream-50">{title}</h2>
      </div>
      {action}
    </div>
  );
}

const chip: Record<StepStatus | "ACTIVE" | "PENDING_PAYMENT" | "OVERDUE", { label: string; className: string; dot: string }> = {
  SUCCESS: { label: "Paid", className: "bg-emerald-400/12 text-emerald-300", dot: "bg-emerald-300" },
  ACTIVE: { label: "Active", className: "bg-emerald-400/12 text-emerald-300", dot: "bg-emerald-300" },
  PENDING: { label: "Processing", className: "bg-gold-400/15 text-gold-300", dot: "bg-gold-300 animate-pulse" },
  PENDING_PAYMENT: { label: "Awaiting payment", className: "bg-gold-400/15 text-gold-300", dot: "bg-gold-300" },
  FAILED: { label: "Failed", className: "bg-red-400/12 text-red-300", dot: "bg-red-300" },
  CANCELLED: { label: "Cancelled", className: "bg-white/8 text-cream-200/60", dot: "bg-cream-200/50" },
  OVERDUE: { label: "Overdue", className: "bg-red-400/12 text-red-300", dot: "bg-red-300 animate-pulse" },
  UPCOMING: { label: "Upcoming", className: "bg-white/6 text-cream-200/60", dot: "bg-cream-200/40" },
};

/** Status with a dot *and* a word — never colour alone. */
export function StatusChip({ status, className }: { status: keyof typeof chip; className?: string }) {
  const c = chip[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold",
        c.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

/**
 * Plan accents like Platinum's charcoal or Royal's midnight vanish on the
 * dashboard's dark field; swap anything that dark for the brand gold.
 */
export function accentOnDark(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 0.06 ? "#E8CF87" : hex;
}
