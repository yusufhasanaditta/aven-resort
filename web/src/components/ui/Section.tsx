import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[88rem] px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

export function Section({
  className,
  tone = "cream",
  id,
  children,
}: {
  className?: string;
  tone?: "cream" | "white" | "forest" | "none";
  id?: string;
  children: React.ReactNode;
}) {
  const tones = {
    cream: "bg-cream-100 text-forest-900",
    white: "bg-cream-50 text-forest-900",
    forest: "bg-forest-950 text-cream-100",
    none: "",
  };
  return (
    <section
      id={id}
      className={cn("relative py-20 sm:py-28 lg:py-32", tones[tone], className)}
    >
      {children}
    </section>
  );
}

export function Eyebrow({
  className,
  tone = "brand",
  children,
}: {
  className?: string;
  tone?: "brand" | "gold" | "light";
  children: React.ReactNode;
}) {
  const tones = {
    brand: "text-forest-600/70",
    gold: "text-gold-500",
    light: "text-gold-400",
  };
  return (
    <p className={cn("text-eyebrow", tones[tone], className)}>{children}</p>
  );
}

/** Section header: eyebrow + serif title + optional lede. */
export function SectionHeading({
  eyebrow,
  title,
  lede,
  tone = "brand",
  align = "left",
  className,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  tone?: "brand" | "light";
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <Eyebrow tone={tone === "light" ? "light" : "brand"}>{eyebrow}</Eyebrow>
      )}
      <h2
        className={cn(
          "mt-4 font-display text-display-md text-balance",
          tone === "light" ? "text-cream-50" : "text-forest-900",
        )}
      >
        {title}
      </h2>
      {lede && (
        <p
          className={cn(
            "mt-5 text-pretty text-[0.9375rem] leading-relaxed",
            tone === "light" ? "text-cream-200/65" : "text-forest-900/60",
          )}
        >
          {lede}
        </p>
      )}
      {children}
    </div>
  );
}
