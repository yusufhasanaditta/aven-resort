"use client";

import { useEffect, useState } from "react";
import { formatBDT } from "@/lib/shares";
import type { AdminPlan } from "@/lib/admin-types";

export function PlansTab() {
  const [plans, setPlans] = useState<AdminPlan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Record<string, number>>({});

  function load() {
    fetch("/api/admin/plans")
      .then((r) => r.json())
      .then((json) => (json.error ? setError(json.error) : setPlans(json.plans)))
      .catch(() => setError("Could not load plans."));
  }

  useEffect(load, []);

  async function save(plan: AdminPlan) {
    setSaving(plan.id);
    try {
      const res = await fetch("/api/admin/plans", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plan.id,
          unitPriceBDT: plan.unitPriceBDT,
          freeStayNights: plan.freeStayNights,
          discountPercent: plan.discountPercent,
          minUnits: plan.minUnits,
          maxUnits: plan.maxUnits,
        }),
      });
      if (res.ok) setSavedAt((prev) => ({ ...prev, [plan.id]: Date.now() }));
    } finally {
      setSaving(null);
    }
  }

  function updateField(id: string, field: keyof AdminPlan, value: number | null) {
    setPlans((prev) => prev?.map((p) => (p.id === id ? { ...p, [field]: value } : p)) ?? null);
  }

  if (error) return <p className="text-sm text-gold-600">{error}</p>;
  if (!plans) return <p className="text-sm text-forest-900/50">Loading…</p>;

  return (
    <div className="space-y-6">
      <p className="max-w-2xl text-[0.8125rem] leading-relaxed text-forest-900/55">
        These four rows drive the Share Calculator and Ownership pages
        directly. Unit price is a placeholder until AVEN confirms real
        pricing — update it here the moment you have a figure; every page
        that shows a price reads it live from here.
      </p>

      <div className="space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl border border-forest-600/10 bg-cream-50 p-5"
            style={{ borderLeftWidth: 4, borderLeftColor: plan.accentColor }}
          >
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-xl text-forest-900">{plan.name}</h3>
              <span className="text-xs text-forest-900/45">{plan.subtitle}</span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <label className="text-xs text-forest-900/60">
                Min units
                <input
                  type="number"
                  value={plan.minUnits}
                  onChange={(e) => updateField(plan.id, "minUnits", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-forest-600/15 bg-cream-50 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-forest-900/60">
                Max units (blank = unlimited)
                <input
                  type="number"
                  value={plan.maxUnits ?? ""}
                  onChange={(e) =>
                    updateField(
                      plan.id,
                      "maxUnits",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                  className="mt-1 w-full rounded-lg border border-forest-600/15 bg-cream-50 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-forest-900/60">
                Unit price (BDT)
                <input
                  type="number"
                  value={plan.unitPriceBDT}
                  onChange={(e) => updateField(plan.id, "unitPriceBDT", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-forest-600/15 bg-cream-50 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-forest-900/60">
                Free stay (nights)
                <input
                  type="number"
                  value={plan.freeStayNights}
                  onChange={(e) => updateField(plan.id, "freeStayNights", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-forest-600/15 bg-cream-50 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs text-forest-900/60">
                Discount %
                <input
                  type="number"
                  value={plan.discountPercent}
                  onChange={(e) => updateField(plan.id, "discountPercent", Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-forest-600/15 bg-cream-50 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button
                type="button"
                onClick={() => save(plan)}
                disabled={saving === plan.id}
                className="rounded-full bg-forest-600 px-4 py-2 text-xs font-semibold text-cream-50 transition-colors hover:bg-forest-700 disabled:opacity-50"
              >
                {saving === plan.id ? "Saving…" : "Save changes"}
              </button>
              <p className="text-xs text-forest-900/45">
                Current: {formatBDT(plan.unitPriceBDT)} / unit
              </p>
              {savedAt[plan.id] && (
                <p className="text-xs font-medium text-forest-700">Saved</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
