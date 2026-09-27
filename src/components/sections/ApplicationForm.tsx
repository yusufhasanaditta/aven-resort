"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MembershipCard, type MembershipCardData } from "@/components/ui/MembershipCard";
import { calculate, formatBDT, ownershipPercent, stayDays } from "@/lib/shares";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

type Plan = MembershipCardData & { id: string };
type Prefill = { name: string; email: string; phone: string; location: string };

const STEPS = ["Package", "Your details", "Nominee", "Review"] as const;

const inputCls =
  "h-12 w-full rounded-xl border border-forest-600/15 bg-white px-4 text-[0.9375rem] text-forest-900 outline-none transition-shadow placeholder:text-forest-900/35 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10";

/**
 * The four-step share-purchase application. The quote is computed with the
 * same `calculate()` the server uses, and the server recomputes it on submit,
 * so the figure shown here is the figure the admin approves.
 */
export function ApplicationForm({ plans, prefill, initialPlan }: { plans: Plan[]; prefill: Prefill; initialPlan?: string }) {
  const start = plans.find((p) => p.slug === initialPlan);
  const [step, setStep] = useState(0);
  const [f, setF] = useState({
    units: start?.minUnits ?? 1,
    paymentPlan: "FULL" as "FULL" | "INSTALLMENT",
    fullName: prefill.name,
    fatherName: "",
    email: prefill.email,
    phone: prefill.phone,
    nid: "",
    dateOfBirth: "",
    address: prefill.location,
    occupation: "",
    nomineeName: "",
    nomineeRelation: "",
    nomineePhone: "",
    notes: "",
    agree: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const quote = useMemo(
    () => calculate(plans, f.units, f.paymentPlan),
    [plans, f.units, f.paymentPlan],
  );
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));

  function validate(s: number) {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (f.fullName.trim().length < 2) e.fullName = "Enter your full name as on your NID.";
      if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address.";
      if (!/^[0-9+\s()-]{7,20}$/.test(f.phone)) e.phone = "Enter a valid phone number.";
      if (!/^(\d{10}|\d{13}|\d{17})$/.test(f.nid.trim())) e.nid = "NID must be 10, 13 or 17 digits.";
      if (f.address.trim().length < 8) e.address = "Enter your full address.";
    }
    if (s === 3 && !f.agree) e.agree = "Please accept the terms to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    if (!validate(3)) return;
    setBusy(true);
    setServerError(null);
    try {
      const r = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, planSlug: quote.plan.slug, units: quote.units }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErrors(json.errors ?? {});
        setServerError(json.error ?? (json.errors ? "Please check the highlighted fields." : "Something went wrong."));
        if (json.errors && ["fullName", "email", "phone", "nid", "address"].some((k) => k in json.errors)) setStep(1);
        setBusy(false);
        return;
      }
      setDone(true);
    } catch {
      setServerError("Could not reach the server. Please try again.");
    }
    setBusy(false);
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl bg-cream-50 p-10 text-center shadow-lift">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl text-emerald-600">✓</span>
        <h2 className="mt-6 font-display text-4xl text-forest-900">Application submitted.</h2>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-forest-900/60">
          Your {quote.plan.name} application for {quote.units} share{quote.units > 1 ? "s" : ""} ({formatBDT(quote.totalBDT)}) is with the
          Aven team. You&rsquo;ll see its status on your dashboard, and your payment schedule appears there as soon as it&rsquo;s approved.
        </p>
        <Link href="/account?tab=applications" className="mt-8 inline-flex h-12 items-center rounded-full bg-forest-600 px-7 text-sm font-medium text-cream-50 hover:bg-forest-700">
          Track my application
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {/* Stepper */}
        <ol className="mb-8 grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="w-full text-left disabled:cursor-default"
              >
                <span className={cn("block h-1.5 rounded-full transition-colors", i <= step ? "bg-forest-600" : "bg-forest-600/12")} />
                <span className={cn("mt-2 block text-xs font-medium", i === step ? "text-forest-900" : "text-forest-900/45")}>
                  {i + 1}. {s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.35, ease: easeOutExpo }}
            className="rounded-3xl bg-cream-50 p-6 shadow-lift ring-1 ring-forest-600/8 sm:p-8"
          >
            {step === 0 && (
              <div>
                <h2 className="font-display text-3xl text-forest-900">Choose your package</h2>
                <p className="mt-1 text-sm text-forest-900/55">Your plan follows the number of shares you apply for.</p>
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {plans.map((p) => (
                    <button
                      key={p.slug}
                      type="button"
                      onClick={() => set("units", p.minUnits)}
                      aria-pressed={quote.plan.slug === p.slug}
                      className={cn(
                        "rounded-2xl border p-4 text-left transition-all",
                        quote.plan.slug === p.slug ? "border-forest-600 bg-forest-600/6 ring-2 ring-forest-600/20" : "border-forest-600/12 bg-white hover:border-forest-600/35",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accentColor }} />
                        <span className="font-display text-xl text-forest-900">{p.name}</span>
                      </span>
                      <span className="mt-1 block text-xs text-forest-900/55">
                        {p.maxUnits ? `${p.minUnits}–${p.maxUnits}` : `${p.minUnits}+`} shares · {stayDays(p.freeStayNights)} free days a year
                      </span>
                    </button>
                  ))}
                </div>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-forest-900/60">Number of shares</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => set("units", Math.max(1, f.units - 1))} className="h-12 w-12 rounded-xl border border-forest-600/15 bg-white text-xl" aria-label="Fewer shares">−</button>
                      <input className={cn(inputCls, "text-center font-numeral text-lg")} inputMode="numeric" value={f.units} onChange={(e) => set("units", Math.max(1, Math.min(500, Number(e.target.value.replace(/\D/g, "")) || 1)))} aria-label="Shares" />
                      <button type="button" onClick={() => set("units", Math.min(500, f.units + 1))} className="h-12 w-12 rounded-xl border border-forest-600/15 bg-white text-xl" aria-label="More shares">+</button>
                    </div>
                  </label>
                  <div>
                    <span className="mb-1.5 block text-xs font-medium text-forest-900/60">Payment plan</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(["FULL", "INSTALLMENT"] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => set("paymentPlan", p)}
                          aria-pressed={f.paymentPlan === p}
                          className={cn("h-12 rounded-xl border text-sm font-medium", f.paymentPlan === p ? "border-forest-600 bg-forest-600 text-cream-50" : "border-forest-600/15 bg-white text-forest-800")}
                        >
                          {p === "FULL" ? "Full payment" : "Installments"}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {f.paymentPlan === "INSTALLMENT" && quote.installments && (
                  <p className="mt-4 rounded-xl bg-gold-500/10 px-4 py-3 text-xs leading-relaxed text-forest-900/75">
                    {quote.plan.name} installment terms: <strong>{formatBDT(quote.downPaymentBDT ?? 0)}</strong> down payment, then{" "}
                    <strong>{quote.monthlyCount} monthly installments</strong> of about <strong>{formatBDT(quote.monthlyBDT ?? 0)}</strong>.
                  </p>
                )}
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="font-display text-3xl text-forest-900">Your details</h2>
                <p className="mt-1 text-sm text-forest-900/55">As they appear on your National ID — they go on your share documents.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Text label="Full name (as on NID)" error={errors.fullName} value={f.fullName} onChange={(v) => set("fullName", v)} className="sm:col-span-2" autoComplete="name" />
                  <Text label="Father's / husband's name" value={f.fatherName} onChange={(v) => set("fatherName", v)} />
                  <Text label="National ID number" error={errors.nid} value={f.nid} onChange={(v) => set("nid", v.replace(/\D/g, ""))} inputMode="numeric" />
                  <Text label="Date of birth" type="date" value={f.dateOfBirth} onChange={(v) => set("dateOfBirth", v)} />
                  <Text label="Occupation" value={f.occupation} onChange={(v) => set("occupation", v)} />
                  <Text label="Phone" error={errors.phone} value={f.phone} onChange={(v) => set("phone", v)} autoComplete="tel" />
                  <Text label="Email" error={errors.email} value={f.email} onChange={(v) => set("email", v)} type="email" autoComplete="email" />
                  <Text label="Full address" error={errors.address} value={f.address} onChange={(v) => set("address", v)} className="sm:col-span-2" autoComplete="street-address" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="font-display text-3xl text-forest-900">Nominee</h2>
                <p className="mt-1 text-sm text-forest-900/55">Who your shares pass to. Optional now — you can add it before approval.</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Text label="Nominee name" value={f.nomineeName} onChange={(v) => set("nomineeName", v)} className="sm:col-span-2" />
                  <Text label="Relationship" value={f.nomineeRelation} onChange={(v) => set("nomineeRelation", v)} placeholder="e.g. Spouse" />
                  <Text label="Nominee phone" value={f.nomineePhone} onChange={(v) => set("nomineePhone", v)} />
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-medium text-forest-900/60">Anything the team should know? (optional)</span>
                    <textarea className={cn(inputCls, "h-auto py-3")} rows={3} value={f.notes} onChange={(e) => set("notes", e.target.value)} />
                  </label>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="font-display text-3xl text-forest-900">Review & submit</h2>
                <dl className="mt-6 grid gap-x-8 gap-y-4 text-sm sm:grid-cols-2">
                  {[
                    ["Package", `${quote.plan.name} · ${quote.units} shares`],
                    ["Payment", f.paymentPlan === "INSTALLMENT" ? `${formatBDT(quote.downPaymentBDT ?? 0)} down + ${quote.monthlyCount} monthly` : "Full payment"],
                    ["Name", f.fullName],
                    ["NID", f.nid],
                    ["Phone", f.phone],
                    ["Email", f.email],
                    ["Address", f.address],
                    ["Nominee", f.nomineeName ? `${f.nomineeName}${f.nomineeRelation ? ` (${f.nomineeRelation})` : ""}` : "Not given"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-forest-900/45">{k}</dt>
                      <dd className="mt-0.5 text-forest-900">{v}</dd>
                    </div>
                  ))}
                </dl>
                <label className="mt-8 flex items-start gap-3 rounded-2xl bg-forest-600/5 p-4 text-sm text-forest-900/75">
                  <input type="checkbox" checked={f.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-0.5 h-4 w-4 accent-forest-600" />
                  <span>
                    I confirm these details are correct and accept the{" "}
                    <a href="/terms" target="_blank" className="font-medium text-forest-700 underline">terms &amp; conditions</a>. I understand
                    pricing is indicative until Aven Limited confirms it.
                  </span>
                </label>
                {errors.agree && <p className="mt-2 text-xs text-red-600">{errors.agree}</p>}
              </div>
            )}

            {serverError && <p className="mt-5 text-sm text-red-600">{serverError}</p>}

            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => setStep((s) => Math.max(0, s - 1))} className={cn("text-sm font-medium text-forest-700 hover:underline", step === 0 && "invisible")}>
                ← Back
              </button>
              {step < 3 ? (
                <button type="button" onClick={next} className="inline-flex h-12 items-center rounded-full bg-forest-600 px-7 text-sm font-medium text-cream-50 shadow-lift hover:bg-forest-700">
                  Continue →
                </button>
              ) : (
                <button type="button" onClick={submit} disabled={busy} className="inline-flex h-12 items-center rounded-full bg-gold-400 px-7 text-sm font-semibold text-forest-950 shadow-lift hover:bg-gold-300 disabled:opacity-60">
                  {busy ? "Submitting…" : "Submit application"}
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Live summary */}
      <aside className="lg:sticky lg:top-[calc(var(--header-height)+1.5rem)] lg:self-start">
        <div className="rounded-3xl bg-forest-950 p-6 text-cream-50">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">Your application</p>
          <div className="relative mt-4 h-[9.9rem] w-full">
            <div className="absolute left-0 top-0 origin-top-left scale-[0.64]">
              <MembershipCard plan={quote.plan} className="w-[25rem] sm:w-[25rem]" />
            </div>
          </div>
          <dl className="mt-2 space-y-2.5 text-sm">
            <Row k={`${quote.units} × ${formatBDT(quote.pricePerShareBDT)}`} v={formatBDT(quote.totalBDT)} />
            <Row k="Free stay" v={`${stayDays(quote.freeStayNights)} days / year`} />
            <Row k="Of the resort" v={`${ownershipPercent(quote.units).toFixed(2)}%`} />
            <div className="flex items-baseline justify-between border-t border-cream-50/10 pt-3">
              <dt className="font-semibold">Total</dt>
              <dd className="font-numeral text-2xl">{formatBDT(quote.totalBDT)}</dd>
            </div>
            {quote.installments && (
              <>
                <Row k="Down payment" v={formatBDT(quote.downPaymentBDT ?? 0)} />
                <Row k={`${quote.monthlyCount} × monthly`} v={`≈ ${formatBDT(quote.monthlyBDT ?? 0)}`} />
              </>
            )}
          </dl>
          <p className="mt-4 text-[0.6875rem] text-cream-200/45">Indicative until confirmed by Aven Limited. Nothing is charged when you apply.</p>
        </div>
      </aside>
    </div>
  );
}

function Row({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-cream-200/60">{k}</dt>
      <dd className={cn("font-numeral", accent ? "text-emerald-300" : "text-cream-100")}>{v}</dd>
    </div>
  );
}

function Text({
  label,
  error,
  value,
  onChange,
  className,
  ...rest
}: {
  label: string;
  error?: string;
  value: string;
  onChange: (v: string) => void;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-forest-900/60">{label}</span>
      <input className={cn(inputCls, error && "border-red-400")} value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}
