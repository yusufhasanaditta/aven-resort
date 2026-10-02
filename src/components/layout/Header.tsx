"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { navigation, primaryCta, site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button, ArrowRight } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { easeOutExpo } from "@/lib/motion";
import type { Announcement } from "@/data/cms-defaults";
import { LangSwitch } from "@/components/layout/LangSwitch";
import { ApplyChooser } from "@/components/sections/ApplyChooser";
import { navBn, ui, type Lang } from "@/lib/i18n";

/**
 * Transparent over the hero, then condenses into a cream bar once scrolled —
 * matching the floating navigation in the UI mockups.
 */
type SessionState = { name: string; role: "SHAREHOLDER" | "ADMIN" } | null;

export function Header({
  announcement = null,
  phone = site.contact.phone,
  lang = "en",
}: {
  announcement?: Announcement | null;
  /** From admin → Website content → Contact & social. */
  phone?: string;
  lang?: Lang;
}) {
  const t = ui[lang];
  const label = (href: string, en: string) => (lang === "bn" ? navBn[href]?.label ?? en : en);
  const describe = (href: string, en?: string) => (lang === "bn" ? navBn[href]?.description ?? en : en);
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // "Apply now" asks first: contact me, or apply for shares. A new key opens it fresh.
  const [chooser, setChooser] = useState(0);
  const [chooserOpen, setChooserOpen] = useState(false);
  const openChooser = (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    setChooser((n) => n + 1);
    setChooserOpen(true);
  };
  const [session, setSession] = useState<SessionState>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setSession(json?.user ? { name: json.user.name, role: json.user.role } : null))
      .catch(() => setSession(null));
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onHero = pathname === "/" || pathname === "/masterplan";
  // Light-on-dark over the hero, and over the (dark) mobile menu when it's open.
  const light = (onHero && !scrolled) || open;

  return (
    <>
      <header
        translate="no"
        className={cn(
          lang === "bn" && "font-bangla",
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] print:hidden",
          (scrolled || !onHero) && !open
            ? "border-b border-forest-600/10 bg-cream-100/85 backdrop-blur-xl"
            : open
              ? "bg-transparent"
            : "bg-gradient-to-b from-forest-950/45 to-transparent",
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        {announcement && (
          <div className="flex h-[var(--announce-height)] items-center justify-center gap-3 bg-forest-950 px-4 text-[0.75rem] text-cream-100">
            <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-gold-400" aria-hidden="true" />
            <span className="truncate">{announcement.text}</span>
            {announcement.linkLabel && announcement.href && (
              <Link href={announcement.href} className="shrink-0 font-semibold text-gold-300 underline-offset-2 hover:underline">
                {announcement.linkLabel} →
              </Link>
            )}
          </div>
        )}
        <div className="mx-auto flex h-[var(--nav-height)] max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label={`${site.name} home`}>
            <Logo tone={light ? "light" : "brand"} />
          </Link>

          <nav className="hidden items-center gap-0.5 xl:flex">
            {navigation.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative whitespace-nowrap rounded-full px-3 py-2 text-[0.8125rem] font-medium transition-colors duration-300 xl:px-3.5",
                    light
                      ? "text-cream-100/85 hover:text-cream-50"
                      : "text-forest-800/75 hover:text-forest-700",
                    active && (light ? "text-cream-50" : "text-forest-700"),
                  )}
                >
                  {label(item.href, item.label)}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className={cn(
                        "absolute inset-x-3.5 -bottom-0.5 h-px",
                        light ? "bg-gold-400" : "bg-forest-600",
                      )}
                      transition={{ duration: 0.5, ease: easeOutExpo }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <LangSwitch lang={lang} tone={light ? "light" : "brand"} />
            {session ? (
              <Button
                href={session.role === "ADMIN" ? "/admin" : "/account"}
                variant={light ? "light" : "primary"}
                size="sm"
                className="max-sm:hidden"
              >
                {session.role === "ADMIN" ? t.adminPanel : `${t.hi}, ${session.name.split(" ")[0]}`}
                <ArrowRight />
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[0.8125rem] font-medium transition-colors max-sm:hidden",
                    light ? "text-cream-50 hover:bg-cream-50/12" : "text-forest-800 hover:bg-forest-600/8",
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
                    <circle cx="12" cy="8" r="3.5" />
                    <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
                  </svg>
                  {t.signIn}
                </Link>
                <Button href="/apply" onClick={openChooser} variant={light ? "light" : "primary"} size="sm" className="whitespace-nowrap max-sm:hidden">
                  {t.signUp}
                  <ArrowRight />
                </Button>
              </>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t.closeMenu : t.openMenu}
              aria-expanded={open}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors xl:hidden",
                light
                  ? "text-cream-50 hover:bg-cream-50/12"
                  : "text-forest-700 hover:bg-forest-600/8",
              )}
            >
              <span className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    "absolute left-0 block h-px w-full bg-current transition-all duration-300",
                    open ? "top-1.5 rotate-45" : "top-0",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 top-1.5 block h-px w-full bg-current transition-opacity duration-200",
                    open ? "opacity-0" : "opacity-100",
                  )}
                />
                <span
                  className={cn(
                    "absolute left-0 block h-px w-full bg-current transition-all duration-300",
                    open ? "top-1.5 -rotate-45" : "top-3",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            translate="no"
            className={cn("fixed inset-0 z-40 bg-forest-950 xl:hidden", lang === "bn" && "font-bangla")}
          >
            <div
              className="flex h-full flex-col overflow-y-auto px-6 pb-10"
              style={{
                paddingTop: "calc(var(--header-height) + env(safe-area-inset-top, 0px) + 1.5rem)",
              }}
            >
              <nav className="flex flex-col">
                {navigation.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.06 * i,
                      duration: 0.5,
                      ease: easeOutExpo,
                    }}
                  >
                    <Link
                      href={item.href}
                      className="group flex items-baseline justify-between border-b border-cream-50/10 py-4"
                    >
                      <span className={cn("text-3xl text-cream-50", lang === "bn" ? "font-bangla font-medium" : "font-display")}>
                        {label(item.href, item.label)}
                      </span>
                      <span className="max-w-[45%] text-right text-xs text-cream-200/50">
                        {describe(item.href, item.description)}
                      </span>
                    </Link>
                  </motion.div>
                ))}
                <Link href="/careers" className="flex items-baseline justify-between py-4 text-cream-200/70 hover:text-cream-50">
                  <span className="text-lg">{t.careers}</span>
                  <span className="text-xs text-cream-200/50">{describe("/careers", "Job circulars & how to apply")}</span>
                </Link>
              </nav>

              <div className="mt-auto space-y-3 pt-10">
                {session ? (
                  <Button
                    href={session.role === "ADMIN" ? "/admin" : "/account"}
                    variant="light"
                    size="lg"
                    className="w-full"
                  >
                    {session.role === "ADMIN" ? t.adminPanel : t.myAccount}
                    <ArrowRight />
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <Button href="/login" variant="outline-light" size="lg" className="w-full">
                      {t.signIn}
                    </Button>
                    <Button href="/apply" onClick={openChooser} variant="light" size="lg" className="w-full">
                      {t.signUp}
                    </Button>
                  </div>
                )}
                <Button href={primaryCta.href} variant="outline-light" size="lg" className="w-full">
                  {t.requestDetails}
                  <ArrowRight />
                </Button>
                <p className="mt-6 text-center text-xs text-cream-200/45">
                  {phone} · {site.location.label}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ApplyChooser key={chooser} open={chooserOpen} onClose={() => setChooserOpen(false)} lang={lang} />
    </>
  );
}
