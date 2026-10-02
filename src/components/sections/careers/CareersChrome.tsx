import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Section";
import { hrefFor } from "@/lib/careers";
import type { CareersContent } from "@/data/cms-defaults";
import { cn } from "@/lib/utils";

export type CareersTab = "vacancies" | "why" | "archive";

const TABS: { id: CareersTab; label: string; href: string }[] = [
  { id: "vacancies", label: "Vacancy announcements", href: "/careers" },
  { id: "why", label: "Why join Aven", href: "/careers/why-join-aven" },
  { id: "archive", label: "Circular archive", href: "/careers/archive" },
];

/**
 * The Careers section's own navigation — vacancy announcements, why join,
 * and the archive of every circular — kept in view as the page scrolls.
 */
export function CareersNav({ active, openCount, archiveCount }: { active: CareersTab; openCount?: number; archiveCount?: number }) {
  const count = (id: CareersTab) => (id === "vacancies" ? openCount : id === "archive" ? archiveCount : undefined);
  return (
    <nav aria-label="Careers" className="sticky top-[var(--header-height)] z-20 border-b border-forest-600/10 bg-cream-50/90 backdrop-blur-md">
      <Container>
        <ul className="-mx-1 flex gap-1 overflow-x-auto py-2.5 [scrollbar-width:none]">
          {TABS.map((t) => {
            const on = t.id === active;
            const n = count(t.id);
            return (
              <li key={t.id} className="shrink-0">
                <Link
                  href={t.href}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                    on ? "bg-forest-700 text-cream-50" : "text-forest-800/75 hover:bg-forest-600/7 hover:text-forest-900",
                  )}
                >
                  {t.label}
                  {typeof n === "number" && (
                    <span className={cn("rounded-full px-1.5 text-[0.6875rem] tabular-nums", on ? "bg-cream-50/20" : "bg-forest-600/8")}>{n}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </nav>
  );
}

/** A compact dark header for the Careers sub-pages. */
export function CareersHeader({
  eyebrow,
  title,
  accent,
  lede,
  image,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lede?: string;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-forest-950 pb-14 pt-[calc(var(--header-height)+3rem)] text-cream-50 sm:pb-16">
      {image && (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" unoptimized={image.startsWith("http")} className="object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-950/30" />
        </>
      )}
      <div className="bg-leaf-swirl-light pointer-events-none absolute inset-0 opacity-25" aria-hidden="true" />
      <Container className="relative">
        <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-cream-200/60">
          <Link href="/" className="hover:text-cream-50">
            Home
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <Link href="/careers" className="hover:text-cream-50">
            Careers
          </Link>
          <span className="mx-2" aria-hidden="true">
            /
          </span>
          <span className="text-cream-100">{eyebrow}</span>
        </nav>
        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,4.25rem)] leading-[1.03] text-balance">
          {title} {accent && <span className="italic text-gold-300">{accent}</span>}
        </h1>
        {lede && <p className="mt-5 max-w-2xl text-pretty text-[1.0625rem] leading-relaxed text-cream-100/80">{lede}</p>}
        {children}
      </Container>
    </section>
  );
}

/** "Aven never charges for recruitment" — on every Careers page while the CMS has text for it. */
export function FraudNotice({ text, className }: { text: string; className?: string }) {
  if (!text.trim()) return null;
  return (
    <div role="note" className={cn("flex gap-4 rounded-2xl border border-[#E8C9A6] bg-[#FBF3E8] px-5 py-4", className)}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E07A3A] text-sm font-bold text-white" aria-hidden="true">
        !
      </span>
      <div>
        <p className="text-sm font-semibold text-[#7A3D12]">Beware of recruitment fraud</p>
        <p className="mt-1 text-[0.8125rem] leading-relaxed text-[#7A3D12]/85">{text}</p>
      </div>
    </div>
  );
}

/** Who to talk to about jobs: HR email, phone and hours from the Careers CMS section. */
export function HrContact({ content, tone = "light", className }: { content: CareersContent; tone?: "light" | "dark"; className?: string }) {
  const dark = tone === "dark";
  const rows = [
    content.hrEmail && { k: "Email", v: content.hrEmail, href: hrefFor(content.hrEmail) },
    content.hrPhone && { k: "Phone", v: content.hrPhone, href: hrefFor(content.hrPhone) },
    content.hrHours && { k: "Hours", v: content.hrHours, href: null },
  ].filter((r): r is { k: string; v: string; href: string | null } => !!r);
  if (!rows.length) return null;
  return (
    <dl className={cn("grid gap-3 text-[0.8125rem]", className)}>
      {rows.map((r) => (
        <div key={r.k} className="flex gap-3">
          <dt className={cn("w-14 shrink-0", dark ? "text-cream-200/55" : "text-forest-900/50")}>{r.k}</dt>
          <dd className={cn("min-w-0 break-words font-medium", dark ? "text-cream-50" : "text-forest-900")}>
            {r.href ? (
              <a href={r.href} className={cn("hover:underline", dark ? "text-gold-300" : "text-forest-700")}>
                {r.v}
              </a>
            ) : (
              r.v
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
