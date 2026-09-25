"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonAction, Button, ArrowRight } from "@/components/ui/Button";
import { MembershipBadge } from "@/components/ui/MembershipCard";
import { calculate, buildInstallmentSchedule, formatBDT } from "@/lib/shares";
import { fallbackPlans, type FallbackPlan } from "@/data/planFallback";
import { easeOutExpo } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { MembershipPlan } from "@prisma/client";

type Session = { name: string } | null;
type PlanRow = MembershipPlan | FallbackPlan;
type PlansStatus = "loading" | "live" | "fallback";

const INSTALLMENT_OPTIONS = [3, 6, 9, 12, 18, 24];

/**
 * The interactive Share Calculator & Ownership Plan — the "own your share"
 * feature. Loads live, admin-editable plan pricing, computes the category
 * and total automatically from the unit count, and either starts a real
 * SSLCommerz payment (order route) or, for a visitor who isn't signed in,
 * routes them to create an account first.
 *
 * The calculator must never be left with nothing to render: if `/api/plans`
 * is slow, empty or failing (a fresh deploy with no database yet is exactly
 * this), it falls back to the static category data instead of hanging on a
 * loading state forever — a stuck loading state is what actually makes every
 * button in this section look broken.
 */
export function ShareCalculator() {
  const router = useRouter();
  const params = useSearchParams();

  const [plans, setPlans] = useState<PlanRow[]>(fallbackPlans);
  const [plansStatus, setPlansStatus] = useState<PlansStatus>("loading");
  const [units, setUnits] = useState(1);
  const [paymentPlan, setPaymentPlan] = useState<"FULL" | "INSTALLMENT">("FULL");
  const [months, setMonths] = useState(6);
  const [session, setSession] = useState<Session>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function loadPlans() {
    setPlansStatus("loading");
    const requestedSlug = params.get("plan");
    const timeout = setTimeout(() => {
      // /api/plans is taking too long — don't leave the calculator blank.
      setPlansStatus((s) => (s === "loading" ? "fallback" : s));
    }, 4000);

    fetch("/api/plans")
      .then((r) => r.json())
      .then((json) => {
        clearTimeout(timeout);
        const loaded: MembershipPlan[] = json.plans ?? [];
        if (loaded.length === 0) {
          setPlansStatus("fallback");
          return;
        }
        setPlans(loaded);
        setPlansStatus("live");
        // Preselect the plan named in ?plan=, if any, in the same update as
        // the plans themselves land — avoids a second, cascading render.
        const requested = requestedSlug && loaded.find((p) => p.slug === requestedSlug);
        if (requested) setUnits(requested.minUnits);
      })
      .catch(() => {
        clearTimeout(timeout);
        setPlansStatus("fallback");
      });
  }

  useEffect(() => {
    loadPlans();

    fetch("/api/account/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setSession(json?.user ? { name: json.user.name } : null))
      .catch(() => setSession(null));
    // Only ?plan= at mount time is honoured — re-running this on every
    // `params` change would fight the user's own slider input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = useMemo(
    () => calculate(plans, units, paymentPlan, paymentPlan === "INSTALLMENT" ? months : undefined),
    [plans, units, paymentPlan, months],
  );

  const schedule = useMemo(() => {
    if (!result || paymentPlan !== "INSTALLMENT") return null;
    return buildInstallmentSchedule(result.totalBDT, months);
  }, [result, paymentPlan, months]);

  async function purchase() {
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
          paymentPlan,
          installmentMonths: paymentPlan === "INSTALLMENT" ? months : undefined,
        }),
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? Object.values(json.errors ?? {})[0] as string ?? "Something went wrong.");
        setBusy(false);
        return;
      }

      if (json.gatewayUrl) {
        window.location.href = json.gatewayUrl;
        return;
      }

      setNotice(json.notice ?? "Your share reservation has been recorded.");
      setBusy(false);
      router.push("/account");
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  const maxUnitInput = 200;

  return (
    <Container>
      <Reveal className="max-w-2xl">
        <Eyebrow>Share calculator & ownership plan</Eyebrow>
        <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
          See your category before you buy.
        </h2>
        <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
          Enter a unit count to see the category it falls into, the free-stay
          and discount that come with it, and — if you choose instalments —
          exactly what&rsquo;s due and when. Pricing shown is indicative until AVEN
          confirms a final unit price.
        </p>

        {plansStatus === "fallback" && (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-gold-500/12 px-3.5 py-1.5 text-xs text-gold-600">
            <button
              type="button"
              onClick={loadPlans}
              className="font-semibold underline decoration-dotted underline-offset-2"
            >
              Retry
            </button>
            — showing standard categories; live pricing is temporarily
            unavailable.
          </p>
        )}
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Inputs */}
        <Reveal className="rounded-3xl border border-forest-600/10 bg-cream-50 p-6 sm:p-8">
          <label className="block text-xs font-medium text-forest-900/60">
            Unit shares
          </label>
          <div className="mt-3 flex items-center gap-4">
            <input
              type="range"
              min={1}
              max={maxUnitInput}
              value={units}
              onChange={(e) => setUnits(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-forest-600/12 accent-forest-600"
            />
            <input
              type="number"
              min={1}
              max={maxUnitInput}
              value={units}
              onChange={(e) => setUnits(Math.max(1, Math.min(maxUnitInput, Number(e.target.value))))}
              className="w-20 shrink-0 rounded-lg border border-forest-600/15 bg-white px-3 py-2 text-center font-numeral text-sm"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {plans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setUnits(plan.minUnits)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  result?.plan.id === plan.id
                    ? "bg-forest-600 text-cream-50"
                    : "bg-forest-600/7 text-forest-800/70 hover:bg-forest-600/12",
                )}
              >
                {plan.name} ({plan.minUnits}
                {plan.maxUnits ? `–${plan.maxUnits}` : "+"})
              </button>
            ))}
          </div>

          <div className="mt-8 border-t border-forest-600/10 pt-6">
            <p className="text-xs font-medium text-forest-900/60">Payment plan</p>
            <div className="mt-3 flex gap-2">
              {(["FULL", "INSTALLMENT"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPaymentPlan(p)}
                  className={cn(
                    "rounded-full px-4 py-2 text-xs font-medium transition-colors",
                    paymentPlan === p
                      ? "bg-forest-600 text-cream-50"
                      : "bg-forest-600/7 text-forest-800/70 hover:bg-forest-600/12",
                  )}
                >
                  {p === "FULL" ? "Full payment" : "Instalments"}
                </button>
              ))}
            </div>

            {paymentPlan === "INSTALLMENT" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {INSTALLMENT_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      months === m
                        ? "bg-gold-500 text-forest-950"
                        : "bg-forest-600/7 text-forest-800/70 hover:bg-forest-600/12",
                    )}
                  >
                    {m} months
                  </button>
                ))}
              </div>
            )}
          </div>
        </Reveal>

        {/* Result */}
        <Reveal delay={0.08}>
          <div className="rounded-3xl bg-forest-950 p-6 text-cream-50 sm:p-8">
            {result && (
              <>
                <div className="flex items-center justify-between">
                  <MembershipBadge
                    plan={{ name: result.plan.name, accentColor: result.plan.accentColor }}
                    tone="dark"
                  />
                  <span className="text-xs text-cream-200/40">
                    {result.units} unit share{result.units > 1 ? "s" : ""}
                  </span>
                </div>

                <p className="mt-5 text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/40">
                  Estimated total
                </p>
                <motion.p
                  key={result.totalBDT}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: easeOutExpo }}
                  className="mt-1 font-numeral text-4xl"
                >
                  {formatBDT(result.totalBDT)}
                </motion.p>
                <p className="mt-1 text-xs text-cream-200/40">
                  Indicative — final unit price confirmed by AVEN Ltd.
                </p>

                <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-cream-50/10 pt-5">
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                      Free stay / year
                    </dt>
                    <dd className="mt-1 font-numeral text-lg">{result.freeStayNights} nights</dd>
                  </div>
                  <div>
                    <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                      Accommodation discount
                    </dt>
                    <dd className="mt-1 font-numeral text-lg">
                      {result.discountPercent > 0 ? `${result.discountPercent}%` : "—"}
                    </dd>
                  </div>
                </dl>

                {schedule && (
                  <div className="mt-6 border-t border-cream-50/10 pt-5">
                    <p className="text-[0.625rem] uppercase tracking-[0.14em] text-cream-200/40">
                      Instalment schedule
                    </p>
                    <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto pr-1 text-[0.8125rem]">
                      {schedule.map((line) => (
                        <li key={line.index} className="flex items-center justify-between">
                          <span className="text-cream-200/60">
                            {line.label} · {line.dueLabel}
                          </span>
                          <span className="font-numeral text-cream-50">
                            {formatBDT(line.amountBDT)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-7">
                  {session ? (
                    <>
                      <ButtonAction
                        variant="light"
                        size="lg"
                        className="w-full"
                        disabled={busy}
                        onClick={purchase}
                      >
                        {busy
                          ? "Starting…"
                          : `Reserve & pay ${paymentPlan === "INSTALLMENT" ? "first instalment" : "in full"}`}
                      </ButtonAction>
                      <p className="mt-2 text-center text-[0.6875rem] text-cream-200/40">
                        via SSLCommerz — Bangladesh&rsquo;s national payment gateway
                      </p>
                    </>
                  ) : (
                    <Button href={`/register?next=/ownership%23calculator`} variant="light" size="lg" className="w-full">
                      Create an account to purchase
                      <ArrowRight />
                    </Button>
                  )}
                  {error && <p className="mt-3 text-xs text-gold-400">{error}</p>}
                  {notice && <p className="mt-3 text-xs text-cream-200/70">{notice}</p>}
                </div>
              </>
            )}
          </div>

          {session && (
            <p className="mt-4 text-center text-xs text-forest-900/45">
              Signed in as {session.name} ·{" "}
              <Link href="/account" className="font-medium text-forest-700 hover:underline">
                View my account
              </Link>
            </p>
          )}
        </Reveal>
      </div>
    </Container>
  );
}
