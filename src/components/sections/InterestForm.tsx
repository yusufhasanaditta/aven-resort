"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ownershipTiers } from "@/data/ownership";
import { PLACEHOLDER_UNIT_PRICE_BDT } from "@/data/planFallback";
import { formatBDT } from "@/lib/shares";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-xl border border-forest-600/15 bg-white px-4 text-[0.9375rem] text-forest-900 outline-none transition-shadow placeholder:text-forest-900/35 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10";

function tierFor(units: number) {
  return ownershipTiers.find((t) => units >= t.minUnits && (t.maxUnits === null || units <= t.maxUnits)) ?? ownershipTiers[0];
}

/**
 * "Register your interest" — the lead-capture form. Picking a package or a
 * share count keeps the two in step and suggests a budget, so what lands in
 * the CRM is a qualified lead the team can call with a real conversation.
 */
export function InterestForm({ source = "interest-form", tone = "light" }: { source?: string; tone?: "light" | "dark" }) {
  const [f, setF] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    packageSlug: "",
    units: "",
    investmentBDT: "",
    paymentPref: "UNDECIDED",
    message: "",
    company: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (k: keyof typeof f, v: string) => setF((x) => ({ ...x, [k]: v }));

  function pickPackage(slug: string) {
    const t = ownershipTiers.find((x) => x.id === slug);
    setF((x) => ({
      ...x,
      packageSlug: slug,
      units: t ? String(t.minUnits) : x.units,
      investmentBDT: t ? String(Math.round(t.minUnits * PLACEHOLDER_UNIT_PRICE_BDT * (1 - t.discountPercent / 100))) : x.investmentBDT,
    }));
  }

  function setUnits(v: string) {
    const n = Number(v);
    const t = n > 0 ? tierFor(n) : null;
    setF((x) => ({
      ...x,
      units: v,
      packageSlug: t ? t.id : x.packageSlug,
      investmentBDT: t ? String(Math.round(n * PLACEHOLDER_UNIT_PRICE_BDT * (1 - t.discountPercent / 100))) : x.investmentBDT,
    }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setServerError(null);
    try {
      const r = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...f,
          units: f.units || undefined,
          investmentBDT: f.investmentBDT || undefined,
          packageSlug: f.packageSlug || undefined,
          source,
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors(json.errors ?? {});
        setServerError(json.error ?? (json.errors ? null : "Something went wrong."));
        setState("idle");
        return;
      }
      setState("sent");
    } catch {
      setServerError("Could not reach the server. Please try again.");
      setState("idle");
    }
  }

  const dark = tone === "dark";

  return (
    <AnimatePresence mode="wait">
      {state === "sent" ? (
        <motion.div
          key="sent"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn("rounded-3xl p-10 text-center", dark ? "bg-cream-50/5 text-cream-50" : "bg-cream-50 text-forest-900 shadow-lift")}
        >
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-2xl text-emerald-500">✓</span>
          <p className="mt-5 font-display text-3xl">Thank you, {f.name.split(" ")[0]}.</p>
          <p className={cn("mx-auto mt-2 max-w-sm text-sm", dark ? "text-cream-200/70" : "text-forest-900/60")}>
            The Aven team has your details and will call you within one working day to talk through {f.packageSlug ? `the ${ownershipTiers.find((t) => t.id === f.packageSlug)?.name} plan` : "the plans"}.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={submit}
          noValidate
          className={cn("rounded-3xl p-6 sm:p-8", dark ? "bg-cream-50 shadow-float" : "bg-cream-50 shadow-lift ring-1 ring-forest-600/8")}
        >
          <input type="text" name="company" tabIndex={-1} autoComplete="off" value={f.company} onChange={(e) => set("company", e.target.value)} className="hidden" aria-hidden="true" />

          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-forest-600/60">Preferred package</p>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ownershipTiers.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => pickPackage(t.id)}
                aria-pressed={f.packageSlug === t.id}
                className={cn(
                  "rounded-xl border px-2 py-2.5 text-center transition-all",
                  f.packageSlug === t.id ? "border-forest-600 bg-forest-600 text-cream-50 shadow-lift" : "border-forest-600/15 bg-white text-forest-900 hover:border-forest-600/40",
                )}
              >
                <span className="block text-[0.8125rem] font-semibold">{t.name}</span>
                <span className={cn("block text-[0.625rem]", f.packageSlug === t.id ? "text-cream-100/80" : "text-forest-900/45")}>
                  {t.maxUnits ? `${t.minUnits}–${t.maxUnits}` : `${t.minUnits}+`} sh
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Input label="Full name" error={errors.name}>
              <input className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" />
            </Input>
            <Input label="Phone" error={errors.phone}>
              <input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" inputMode="tel" placeholder="+880 1…" />
            </Input>
            <Input label="Email" error={errors.email}>
              <input className={inputCls} type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
            </Input>
            <Input label="City / country">
              <input className={inputCls} value={f.location} onChange={(e) => set("location", e.target.value)} autoComplete="address-level2" placeholder="Dhaka" />
            </Input>
            <Input label="Number of shares">
              <input className={inputCls} inputMode="numeric" value={f.units} onChange={(e) => setUnits(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 5" />
            </Input>
            <Input label="Investment amount (৳)" hint={f.investmentBDT ? `≈ ${formatBDT(Number(f.investmentBDT))} · indicative` : undefined}>
              <input className={inputCls} inputMode="numeric" value={f.investmentBDT} onChange={(e) => set("investmentBDT", e.target.value.replace(/\D/g, ""))} placeholder="e.g. 2500000" />
            </Input>
          </div>

          <p className="mt-6 text-xs font-medium text-forest-900/60">How would you like to pay?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              ["FULL", "In full"],
              ["INSTALLMENT", "Instalments"],
              ["UNDECIDED", "Not sure yet"],
            ].map(([v, l]) => (
              <button
                key={v}
                type="button"
                onClick={() => set("paymentPref", v)}
                aria-pressed={f.paymentPref === v}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-medium transition-colors",
                  f.paymentPref === v ? "bg-forest-900 text-cream-50" : "bg-forest-600/8 text-forest-800 hover:bg-forest-600/14",
                )}
              >
                {l}
              </button>
            ))}
          </div>

          <Input label="Anything else? (optional)" className="mt-5">
            <textarea className={cn(inputCls, "h-auto py-3")} rows={3} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Best time to call, questions about the resort…" />
          </Input>

          {serverError && <p className="mt-4 text-sm text-red-600">{serverError}</p>}

          <button
            type="submit"
            disabled={state === "sending"}
            className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-forest-600 text-[0.9375rem] font-medium text-cream-50 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-forest-700 disabled:opacity-60"
          >
            {state === "sending" ? "Sending…" : "Register my interest"}
          </button>
          <p className="mt-3 text-center text-[0.6875rem] text-forest-900/45">
            No obligation. By submitting you agree to be contacted about Aven — see our{" "}
            <a href="/privacy" className="underline">privacy policy</a>.
          </p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

function Input({ label, error, hint, className, children }: { label: string; error?: string; hint?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-forest-900/60">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-forest-900/45">{hint}</span> : null}
    </label>
  );
}
