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

/**
 * Transparent over the hero, then condenses into a cream bar once scrolled —
 * matching the floating navigation in the UI mockups.
 */
type SessionState = { name: string; role: "SHAREHOLDER" | "ADMIN" } | null;

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
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
  const light = onHero && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          scrolled || !onHero
            ? "border-b border-forest-600/10 bg-cream-100/85 backdrop-blur-xl"
            : "bg-gradient-to-b from-forest-950/45 to-transparent",
        )}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mx-auto flex h-[var(--header-height)] max-w-[88rem] items-center justify-between gap-6 px-5 sm:px-8">
          <Link href="/" aria-label={`${site.name} home`}>
            <Logo tone={light ? "light" : "brand"} />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
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
                    "relative rounded-full px-3.5 py-2 text-[0.8125rem] font-medium transition-colors duration-300",
                    light
                      ? "text-cream-100/85 hover:text-cream-50"
                      : "text-forest-800/75 hover:text-forest-700",
                    active && (light ? "text-cream-50" : "text-forest-700"),
                  )}
                >
                  {item.label}
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

          <div className="flex items-center gap-3">
            {session ? (
              <Button
                href={session.role === "ADMIN" ? "/admin" : "/account"}
                variant={light ? "light" : "primary"}
                size="sm"
                className="hidden sm:inline-flex"
              >
                {session.role === "ADMIN" ? "Admin panel" : `Hi, ${session.name.split(" ")[0]}`}
                <ArrowRight />
              </Button>
            ) : (
              <Button
                href={primaryCta.href}
                variant={light ? "light" : "primary"}
                size="sm"
                className="hidden sm:inline-flex"
              >
                {primaryCta.label}
                <ArrowRight />
              </Button>
            )}

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden",
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
            className="fixed inset-0 z-40 bg-forest-950 lg:hidden"
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
                      <span className="font-display text-3xl text-cream-50">
                        {item.label}
                      </span>
                      <span className="max-w-[45%] text-right text-xs text-cream-200/50">
                        {item.description}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="mt-auto space-y-3 pt-10">
                {session ? (
                  <Button
                    href={session.role === "ADMIN" ? "/admin" : "/account"}
                    variant="light"
                    size="lg"
                    className="w-full"
                  >
                    {session.role === "ADMIN" ? "Admin panel" : "My account"}
                    <ArrowRight />
                  </Button>
                ) : (
                  <Button href="/login" variant="outline-light" size="lg" className="w-full">
                    Sign in
                  </Button>
                )}
                <Button href={primaryCta.href} variant="light" size="lg" className="w-full">
                  {primaryCta.label}
                  <ArrowRight />
                </Button>
                <p className="mt-6 text-center text-xs text-cream-200/45">
                  {site.contact.phone} · {site.location.label}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
