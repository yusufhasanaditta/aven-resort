import Link from "next/link";
import type { Lang } from "@/data/ownYourShare";
import { cn } from "@/lib/utils";

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

/**
 * English ⇄ Bangla switch. The language lives in the URL (`?lang=bn`) so the
 * page renders on the server in the chosen language — no flash of the other
 * one, and a Bangla link can be shared as-is.
 */
export function LanguageToggle({
  lang,
  path,
  variant = "segmented",
}: {
  lang: Lang;
  path: string;
  variant?: "segmented" | "floating";
}) {
  const href = (l: Lang) => (l === "en" ? path : `${path}?lang=${l}`);

  if (variant === "floating") {
    const next: Lang = lang === "en" ? "bn" : "en";
    return (
      <Link
        href={href(next)}
        scroll={false}
        replace
        hrefLang={next}
        aria-label={next === "bn" ? "বাংলায় পড়ুন (Switch to Bangla)" : "Switch to English"}
        className="fixed bottom-5 left-5 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-forest-600 px-5 text-sm font-medium text-cream-50 shadow-lift-lg ring-1 ring-cream-50/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-forest-700 print:hidden"
      >
        <GlobeIcon className="h-4.5 w-4.5" />
        <span className={next === "bn" ? "font-bangla text-[0.9375rem]" : undefined}>{next === "bn" ? "বাংলা" : "English"}</span>
      </Link>
    );
  }

  return (
    <div
      role="group"
      aria-label="Language / ভাষা"
      className="inline-flex items-center gap-1 rounded-full bg-cream-50/10 p-1 ring-1 ring-cream-50/20 backdrop-blur-md"
    >
      <GlobeIcon className="ml-2 h-4 w-4 text-cream-100/70" />
      {(["en", "bn"] as const).map((l) => (
        <Link
          key={l}
          href={href(l)}
          scroll={false}
          replace
          hrefLang={l}
          aria-current={lang === l ? "true" : undefined}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors",
            l === "bn" && "font-bangla",
            lang === l ? "bg-cream-50 text-forest-800" : "text-cream-100/80 hover:text-cream-50",
          )}
        >
          {l === "en" ? "English" : "বাংলা"}
        </Link>
      ))}
    </div>
  );
}
