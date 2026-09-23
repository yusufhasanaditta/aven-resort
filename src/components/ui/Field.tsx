import { cn } from "@/lib/utils";

export const fieldClass =
  "w-full rounded-xl border border-forest-600/15 bg-cream-50 px-4 py-3 text-sm text-forest-900 outline-none transition-colors placeholder:text-forest-900/35 focus:border-forest-600/45";

/** Label + input/select/textarea slot + inline error, shared by every form on the site. */
export function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.75rem] font-medium text-forest-900/70"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-forest-900/40">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-gold-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function fieldInputClass(hasError?: string) {
  return cn(fieldClass, hasError && "border-gold-500/60");
}
