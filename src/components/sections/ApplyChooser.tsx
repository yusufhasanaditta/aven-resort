"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { Lang } from "@/lib/i18n";

const copy = {
  en: {
    title: "How can we help?",
    lede: "Ask us anything first, or go straight to your share application.",
    contactTitle: "Contact me for more information",
    contactText: "Leave your name, phone and email — our team will call or email you back.",
    applyTitle: "Apply for shares",
    applyText: "Choose your package and submit your application with your NID details.",
    formTitle: "We'll get back to you",
    formLede: "Just your details — no commitment. The Aven team usually replies within one working day.",
    name: "Full name",
    phone: "Phone number",
    email: "Email address",
    message: "Anything you'd like to ask? (optional)",
    send: "Send my details",
    sending: "Sending…",
    back: "← Back",
    doneTitle: "Thank you!",
    doneText: "We've got your details. Someone from the Aven team will contact you shortly.",
    close: "Close",
    failed: "Could not send. Please check your connection and try again.",
  },
  bn: {
    title: "আমরা কীভাবে সাহায্য করতে পারি?",
    lede: "আগে প্রশ্ন করুন, অথবা সরাসরি শেয়ারের জন্য আবেদন করুন।",
    contactTitle: "আরও তথ্যের জন্য যোগাযোগ করুন",
    contactText: "আপনার নাম, ফোন ও ইমেইল দিন — আমাদের টিম আপনাকে কল বা ইমেইল করবে।",
    applyTitle: "শেয়ারের জন্য আবেদন",
    applyText: "প্যাকেজ বেছে নিন এবং এনআইডি তথ্যসহ আবেদন জমা দিন।",
    formTitle: "আমরা আপনার সাথে যোগাযোগ করব",
    formLede: "শুধু আপনার তথ্য — কোনো বাধ্যবাধকতা নেই। সাধারণত এক কর্মদিবসের মধ্যে উত্তর দেওয়া হয়।",
    name: "পূর্ণ নাম",
    phone: "ফোন নম্বর",
    email: "ইমেইল",
    message: "কিছু জানতে চান? (ঐচ্ছিক)",
    send: "তথ্য পাঠান",
    sending: "পাঠানো হচ্ছে…",
    back: "← ফিরে যান",
    doneTitle: "ধন্যবাদ!",
    doneText: "আপনার তথ্য পেয়েছি। অ্যাভেন টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।",
    close: "বন্ধ করুন",
    failed: "পাঠানো যায়নি। আবার চেষ্টা করুন।",
  },
} as const;

const field =
  "w-full rounded-xl border border-forest-600/15 bg-white px-4 py-3 text-sm text-forest-900 outline-none transition-colors placeholder:text-forest-900/35 focus:border-forest-600/45";

type Step = "choose" | "contact" | "done";
const noop = () => () => {};

/**
 * "Apply now": a link to /apply that, with JavaScript, first asks what the
 * visitor wants — to be contacted for more information (name, phone, email;
 * lands in admin → Contact requests) or to apply for shares.
 */
export function ApplyNowButton({
  lang = "en",
  ...button
}: { lang?: Lang } & Omit<React.ComponentProps<typeof Button>, "href">) {
  const [open, setOpen] = useState(false);
  // A fresh chooser (back on its first step) each time it opens.
  const [opened, setOpened] = useState(0);
  return (
    <>
      <Button
        {...button}
        href="/apply"
        onClick={(e) => {
          e.preventDefault();
          setOpened((n) => n + 1);
          setOpen(true);
        }}
      />
      <ApplyChooser key={opened} open={open} onClose={() => setOpen(false)} lang={lang} />
    </>
  );
}

export function ApplyChooser({ open, onClose, lang = "en" }: { open: boolean; onClose: () => void; lang?: Lang }) {
  const t = copy[lang === "bn" ? "bn" : "en"];
  const [step, setStep] = useState<Step>("choose");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  // Parents pass a new onClose each render; the open/close effect only follows `open`.
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close.current();
    window.addEventListener("keydown", onKey);
    const overflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    panel.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = overflow;
    };
  }, [open]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setFailed(false);
    try {
      const r = await fetch("/api/contact-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await r.json().catch(() => ({}));
      if (r.ok) setStep("done");
      else if (json.errors) setErrors(json.errors);
      else setFailed(true);
    } catch {
      setFailed(true);
    }
    setBusy(false);
  }

  // The portal needs document.body, so it only renders after hydration.
  const client = useSyncExternalStore(noop, () => true, () => false);
  if (!client) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-forest-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
          data-lenis-prevent
        >
          <motion.div
            ref={panel}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="apply-chooser-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
            className={cn(
              "relative max-h-[92svh] w-full overflow-y-auto rounded-t-3xl bg-cream-50 p-6 text-forest-900 shadow-lift-lg outline-none sm:max-w-2xl sm:rounded-3xl sm:p-8",
              lang === "bn" && "font-bangla",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={t.close}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-forest-900/50 hover:bg-forest-600/8 hover:text-forest-900"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            {step === "choose" && (
              <div>
                <h2 id="apply-chooser-title" className="pr-10 font-display text-display-sm text-forest-900">{t.title}</h2>
                <p className="mt-2 text-sm text-forest-900/60">{t.lede}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Option
                    onClick={() => setStep("contact")}
                    icon={<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />}
                    title={t.contactTitle}
                    text={t.contactText}
                  />
                  <Option
                    href="/apply"
                    onClick={onClose}
                    tone="dark"
                    icon={<path d="M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6" />}
                    title={t.applyTitle}
                    text={t.applyText}
                  />
                </div>
              </div>
            )}

            {step === "contact" && (
              <form
                onSubmit={submit}
                noValidate
                // A field's error clears as soon as it's edited.
                onInput={(e) => {
                  const name = (e.target as HTMLInputElement).name;
                  if (errors[name]) setErrors((all) => Object.fromEntries(Object.entries(all).filter(([k]) => k !== name)));
                }}
              >
                <h2 id="apply-chooser-title" className="pr-10 font-display text-display-sm text-forest-900">{t.formTitle}</h2>
                <p className="mt-2 text-sm text-forest-900/60">{t.formLede}</p>
                {/* Honeypot */}
                <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" />
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Input name="name" label={t.name} error={errors.name} autoComplete="name" className="sm:col-span-2" autoFocus />
                  <Input name="phone" label={t.phone} error={errors.phone} type="tel" autoComplete="tel" />
                  <Input name="email" label={t.email} error={errors.email} type="email" autoComplete="email" />
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-forest-900/70">{t.message}</span>
                    <textarea name="message" rows={3} maxLength={1000} className={cn(field, "resize-y")} />
                  </label>
                </div>
                {failed && <p className="mt-4 text-sm text-red-600" role="alert">{t.failed}</p>}
                <div className="mt-6 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => setStep("choose")} className="text-sm font-medium text-forest-700 hover:underline">
                    {t.back}
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="inline-flex h-12 items-center rounded-full bg-forest-600 px-7 text-sm font-medium text-cream-50 shadow-lift transition-colors hover:bg-forest-700 disabled:opacity-60"
                  >
                    {busy ? t.sending : t.send}
                  </button>
                </div>
              </form>
            )}

            {step === "done" && (
              <div className="py-6 text-center" role="status">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600">✓</span>
                <h2 id="apply-chooser-title" className="mt-5 font-display text-display-sm text-forest-900">{t.doneTitle}</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-forest-900/60">{t.doneText}</p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 inline-flex h-11 items-center rounded-full bg-forest-600 px-7 text-sm font-medium text-cream-50 hover:bg-forest-700"
                >
                  {t.close}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function Option({
  icon,
  title,
  text,
  href,
  onClick,
  tone = "light",
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
  href?: string;
  onClick?: () => void;
  tone?: "light" | "dark";
}) {
  const className = cn(
    "group flex h-full flex-col rounded-2xl p-5 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift",
    tone === "dark" ? "bg-forest-700 text-cream-50 hover:bg-forest-800" : "bg-white ring-1 ring-forest-600/12 hover:ring-forest-600/30",
  );
  const body = (
    <>
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl",
          tone === "dark" ? "bg-gold-400 text-forest-950" : "bg-forest-600/10 text-forest-700",
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <span className="mt-4 block font-display text-xl leading-snug">{title}</span>
      <span className={cn("mt-1.5 block text-[0.8125rem] leading-relaxed", tone === "dark" ? "text-cream-100/70" : "text-forest-900/60")}>{text}</span>
      <span className={cn("mt-auto pt-4 text-lg transition-transform group-hover:translate-x-1", tone === "dark" ? "text-gold-300" : "text-forest-600")} aria-hidden="true">
        →
      </span>
    </>
  );
  return href ? (
    <Link href={href} onClick={onClick} className={className}>
      {body}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {body}
    </button>
  );
}

function Input({
  label,
  error,
  className,
  ...rest
}: { label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-forest-900/70">{label}</span>
      <input className={cn(field, error && "border-red-400")} aria-invalid={!!error} {...rest} />
      {error && <span className="mt-1 block text-xs text-red-600" role="alert">{error}</span>}
    </label>
  );
}
