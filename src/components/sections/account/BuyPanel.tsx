"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { PayNextButton } from "@/components/sections/AccountActions";
import { Glass, PanelTitle, accentOnDark } from "./ui";
import { formatDate, type DashboardData } from "@/lib/account";
import { calculate, formatBDT, ownershipPercent, stayDays } from "@/lib/shares";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";

const MAX_UNITS = 200;

/**
 * The shareholder's cart. One order is one holding, priced by the plan its
 * own share count falls into — exactly what the order route charges, since
 * both use `calculate()` from `lib/shares`. Installments already due on
 * existing holdings sit alongside, so everything payable is in one place.
 */
export function BuyPanel({
  data,
  paymentMode,
  onOrdered,
}: {
  data: DashboardData;
  paymentMode: "live" | "test" | "offline";
  onOrdered: () => void;
}) {
  const router = useRouter();
  const [units, setUnits] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const plans = data.plans;
  // Shareholders buy online by installments only; full payment is arranged with management.
  const result = useMemo(() => (plans.length ? calculate(plans, units, "INSTALLMENT") : null), [plans, units]);

  const nextPlan = result ? plans.find((p) => p.minUnits > result.units) : undefined;
  const dueItems = data.holdings.filter((h) => h.status !== "CANCELLED" && h.nextDue);

  function setClamped(n: number) {
    setUnits(Math.max(1, Math.min(MAX_UNITS, Math.round(n) || 1)));
  }

  async function checkout() {
    if (!result) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch("/api/shares/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planSlug: result.plan.slug,
          units: result.units,
          paymentPlan: "INSTALLMENT",
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? (Object.values(json.errors ?? {})[0] as string) ?? "Something went wrong.");
        setBusy(false);
        if (json.holdingId) router.refresh();
        return;
      }
      if (json.gatewayUrl) {
        window.location.href = json.gatewayUrl;
        return;
      }
      // Offline mode: the reservation is saved; show it on My holdings with how to pay.
      setNotice(json.notice ?? "Your share reservation has been recorded.");
      router.push("/account?tab=holdings&payment=reserved");
      onOrdered();
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  if (!result) {
    return <Glass><p className="text-sm text-cream-200/60">Membership plans are unavailable right now. Please try again shortly.</p></Glass>;
  }

  const dueToday = result.installments ? result.installments[0].amountBDT : result.totalBDT;

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
      {/* Configure */}
      <div className="space-y-5">
        <Glass>
          <PanelTitle eyebrow="Step 1" title="Choose a plan" />
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {plans.map((p) => {
              const active = result.plan.slug === p.slug;
              return (
                <button
                  key={p.slug}
                  type="button"
                  onClick={() => setClamped(p.minUnits)}
                  aria-pressed={active}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300",
                    active
                      ? "border-gold-300/60 bg-gold-400/10 shadow-[0_0_24px_-6px_rgba(232,207,135,0.45)]"
                      : "border-white/8 bg-white/[0.02] hover:border-white/20",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: accentOnDark(p.accentColor) }} />
                    <span className="font-display text-lg text-cream-50">{p.name}</span>
                  </span>
                  <span className="mt-1 block text-[0.6875rem] text-cream-200/55">
                    {p.maxUnits ? `${p.minUnits}–${p.maxUnits}` : `${p.minUnits}+`} shares · {formatBDT(p.fullPriceBDT)}/share
                  </span>
                  <span className="mt-0.5 block text-[0.6875rem] text-cream-200/40">
                    {stayDays(p.freeStayNights)} days free stay
                  </span>
                </button>
              );
            })}
          </div>
        </Glass>

        <Glass>
          <PanelTitle eyebrow="Step 2" title="How many shares?" />
          <div className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setClamped(units - 1)}
              aria-label="Remove one share"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 text-2xl text-cream-100 transition-colors hover:bg-white/8 disabled:opacity-30"
              disabled={units <= 1}
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={MAX_UNITS}
              value={units}
              onChange={(e) => setClamped(Number(e.target.value))}
              aria-label="Unit shares"
              className="h-12 w-20 rounded-2xl sm:w-24 border border-white/12 bg-white/[0.04] text-center font-numeral text-2xl text-cream-50 outline-none focus:border-gold-300/60"
            />
            <button
              type="button"
              onClick={() => setClamped(units + 1)}
              aria-label="Add one share"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/12 text-2xl text-cream-100 transition-colors hover:bg-white/8"
            >
              +
            </button>
            <p className="text-sm text-cream-200/60 sm:ml-2">
              {formatBDT(result.pricePerShareBDT)} <span className="text-cream-200/40">/ share</span>
            </p>
          </div>
          <input
            type="range"
            min={1}
            max={60}
            value={Math.min(units, 60)}
            onChange={(e) => setClamped(Number(e.target.value))}
            aria-label="Unit shares slider"
            className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-gold-400"
          />

          <AnimatePresence>
            {nextPlan && (
              <motion.p
                key={nextPlan.slug}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-xl bg-gold-400/8 px-3.5 py-2.5 text-xs text-cream-100"
              >
                <button type="button" onClick={() => setClamped(nextPlan.minUnits)} className="font-semibold text-gold-300 hover:underline">
                  Add {nextPlan.minUnits - result.units} more
                </button>{" "}
                to unlock <strong className="font-semibold">{nextPlan.name}</strong> —{" "}
                {formatBDT(nextPlan.unitPriceBDT)} a share and {stayDays(nextPlan.freeStayNights)} free days a year.
              </motion.p>
            )}
          </AnimatePresence>
        </Glass>

        <Glass>
          <PanelTitle eyebrow="Step 3" title="Payment plan" />
          <div className="mt-5 rounded-2xl border border-gold-300/60 bg-gold-400/10 p-4">
            <span className="block text-sm font-semibold text-cream-50">Installments</span>
            <span className="mt-0.5 block text-[0.6875rem] text-cream-200/50">Down payment today, then any amounts, any time</span>
          </div>
          {result.installments && (
            <p className="mt-4 rounded-xl bg-gold-400/8 px-3.5 py-2.5 text-xs leading-relaxed text-cream-100">
              {result.plan.name} terms: <strong className="font-semibold">{formatBDT(result.downPaymentBDT ?? 0)}</strong> down payment today.
              The rest — <strong className="font-semibold">{formatBDT(result.totalBDT - (result.downPaymentBDT ?? 0))}</strong> — you pay in any
              amounts, whenever it suits you; no fixed monthly installments.
            </p>
          )}
        </Glass>
      </div>

      {/* Cart */}
      <div className="space-y-5 xl:sticky xl:top-[calc(var(--header-height)+1.5rem)] xl:self-start">
        <Glass className="overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold-400/10 blur-3xl" />
          <PanelTitle
            eyebrow="Your cart"
            title="Order summary"
            action={<AdminIcon icon="cart" className="h-5 w-5 text-gold-300" />}
          />

          <div className="mt-5 flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center">
            <div className="relative h-[6.9rem] w-[11.2rem] shrink-0">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={result.plan.slug}
                  initial={{ opacity: 0, rotateY: -40, x: 20 }}
                  animate={{ opacity: 1, rotateY: 0, x: 0 }}
                  exit={{ opacity: 0, rotateY: 40, x: -20 }}
                  transition={{ duration: 0.5, ease: easeOutExpo }}
                  className="absolute left-0 top-0 origin-top-left scale-[0.44]"
                >
                  <MembershipCard plan={result.plan} className="w-[25rem] sm:w-[25rem]" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="min-w-0">
              <p className="font-display text-xl text-cream-50">{result.plan.name} membership</p>
              <p className="text-xs text-cream-200/55">
                {result.units} unit share{result.units > 1 ? "s" : ""} · {ownershipPercent(result.units).toFixed(2)}% of the resort
              </p>
            </div>
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-white/8 pt-5 text-[0.8125rem]">
            <div className="flex justify-between">
              <dt className="text-cream-200/60">
                {result.units} × {formatBDT(result.pricePerShareBDT)}
              </dt>
              <dd className="font-numeral text-cream-100">{formatBDT(result.totalBDT)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream-200/60">Free stay included</dt>
              <dd className="text-cream-100">{stayDays(result.freeStayNights)} days / year</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-white/8 pt-3.5">
              <dt className="font-semibold text-cream-50">Total</dt>
              <dd className="font-numeral text-2xl text-cream-50">{formatBDT(result.totalBDT)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cream-200/60">Due today (down payment)</dt>
              <dd className="font-numeral font-semibold text-gold-300">{formatBDT(dueToday)}</dd>
            </div>
          </dl>


          <button
            type="button"
            onClick={checkout}
            disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-300 text-sm font-semibold text-forest-950 shadow-[0_10px_30px_-10px_rgba(232,207,135,0.7)] transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {busy ? "Starting checkout…" : paymentMode === "offline" ? `Reserve · ${formatBDT(dueToday)} due` : `Pay now · ${formatBDT(dueToday)}`}
          </button>
          <p className="mt-2 text-center text-[0.6875rem] text-cream-200/40">
            {paymentMode === "live"
              ? "Secure payment via SSLCommerz — cards, bKash, Nagad, Rocket and net banking"
              : paymentMode === "test"
                ? "Test mode — checkout is simulated until SSLCommerz is connected; no money is charged"
                : "Reserve now and pay by bank transfer or bKash — online payment is coming soon"}
          </p>
          {error && <p className="mt-3 text-center text-xs text-red-300">{error}</p>}
          {notice && <p className="mt-3 text-center text-xs text-emerald-300">{notice}</p>}
        </Glass>

        {dueItems.length > 0 && (
          <Glass>
            <PanelTitle eyebrow="Also payable" title="Due on your holdings" />
            <ul className="mt-4 divide-y divide-white/6">
              {dueItems.map((h) => (
                <li key={h.id} className="flex items-center justify-between gap-3 py-3.5">
                  <span>
                    <span className="block text-[0.8125rem] text-cream-100">
                      {h.plan.name} · {h.paymentPlan === "INSTALLMENT" ? `installment ${h.nextDue!.n} of ${h.steps.length}` : "full payment"}
                    </span>
                    <span className="block text-[0.6875rem] text-cream-200/45">
                      {formatBDT(h.nextDue!.amountBDT)} · due {formatDate(h.nextDue!.dueDate)}
                    </span>
                  </span>
                  <PayNextButton holdingId={h.id} tone="light" label="Pay" />
                </li>
              ))}
            </ul>
          </Glass>
        )}
      </div>
    </div>
  );
}
