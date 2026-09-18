import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "light" | "outline-light";
type Size = "sm" | "md" | "lg";

const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-forest-600 text-cream-50 shadow-lift hover:bg-forest-700 hover:shadow-lift-lg hover:-translate-y-0.5",
  secondary:
    "bg-cream-50 text-forest-700 ring-1 ring-forest-600/15 shadow-lift hover:bg-white hover:ring-forest-600/30 hover:-translate-y-0.5",
  ghost: "text-forest-700 hover:bg-forest-600/8",
  light:
    "bg-cream-50/95 text-forest-700 backdrop-blur hover:bg-white hover:-translate-y-0.5 shadow-lift",
  "outline-light":
    "text-cream-50 ring-1 ring-cream-50/45 backdrop-blur-sm hover:bg-cream-50/12 hover:ring-cream-50/70",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-[0.9375rem]",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function Button({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps &
  ({ href: string } & Omit<React.ComponentProps<typeof Link>, "href" | "className">)) {
  return (
    <Link
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

export function ButtonAction({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Arrow that slides on hover — used inside most CTAs. */
export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={cn(
        "h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1",
        className,
      )}
    >
      <path
        d="M2.5 8h11m0 0L9 3.5M13.5 8 9 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
