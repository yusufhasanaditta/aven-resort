"use client";

import { LANG_COOKIE, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const YEAR = 60 * 60 * 24 * 365;

/**
 * Switches the whole site between English and Bangla: remembers the choice in
 * a cookie, points the automatic translator at the same language for any text
 * not yet written in Bangla, and reloads so every page renders fresh.
 */
export function setLanguage(lang: Lang, goTo?: string) {
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=${YEAR}; samesite=lax`;
  const host = location.hostname;
  const domains = ["", `; domain=${host}`, `; domain=.${host.split(".").slice(-2).join(".")}`];
  for (const d of domains) {
    document.cookie =
      lang === "bn"
        ? `googtrans=/en/bn; path=/${d}`
        : `googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d}`;
  }
  if (goTo) location.href = goTo;
  else location.reload();
}

/** The EN | বাং pill in the header. */
export function LangSwitch({ lang, tone = "brand", className }: { lang: Lang; tone?: "brand" | "light"; className?: string }) {
  const light = tone === "light";
  return (
    <div
      role="group"
      aria-label="Language / ভাষা"
      translate="no"
      className={cn(
        "relative inline-flex h-9 items-center rounded-full p-0.5 text-[0.75rem] font-semibold ring-1 transition-colors",
        light ? "bg-cream-50/10 ring-cream-50/30 backdrop-blur-md" : "bg-forest-600/6 ring-forest-600/15",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          light ? "bg-cream-50" : "bg-forest-600",
          lang === "bn" ? "translate-x-full" : "translate-x-0",
        )}
      />
      {(["en", "bn"] as const).map((l) => {
        const active = lang === l;
        return (
          <button
            key={l}
            type="button"
            onClick={() => !active && setLanguage(l)}
            aria-pressed={active}
            lang={l}
            className={cn(
              "relative z-10 flex h-8 min-w-11 items-center justify-center rounded-full px-2.5 transition-colors",
              l === "bn" && "font-bangla text-[0.8125rem]",
              active
                ? light
                  ? "text-forest-800"
                  : "text-cream-50"
                : light
                  ? "text-cream-100/80 hover:text-cream-50"
                  : "text-forest-800/70 hover:text-forest-800",
            )}
          >
            {l === "en" ? "EN" : "বাং"}
          </button>
        );
      })}
    </div>
  );
}
