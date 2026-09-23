"use client";

import { useEffect, useState } from "react";
import { Num } from "@/components/ui/Number";
import { formatBDT } from "@/lib/shares";
import type { OverviewData } from "@/lib/admin-types";

export function OverviewTab() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((json) => (json.error ? setError(json.error) : setData(json)))
      .catch(() => setError("Could not load overview data."));
  }, []);

  if (error) return <p className="text-sm text-gold-600">{error}</p>;
  if (!data) return <p className="text-sm text-forest-900/50">Loading…</p>;

  const tiles = [
    { label: "Shareholders", value: data.userCount },
    { label: "Total holdings", value: data.holdingCount },
    { label: "Active holdings", value: data.activeHoldings },
    { label: "Pending payment", value: data.pendingHoldings },
    { label: "Unit shares committed", value: data.totalUnits },
    { label: "Enquiries received", value: data.inquiryCount },
  ];

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-forest-600/10 bg-cream-100 p-5">
            <Num size="lg" className="text-forest-700">
              {t.value}
            </Num>
            <p className="mt-1.5 text-[0.6875rem] uppercase tracking-[0.12em] text-forest-900/45">
              {t.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-forest-600/10 bg-forest-950 p-6 text-cream-50">
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/50">
            Total committed
          </p>
          <p className="mt-2 font-numeral text-3xl">{formatBDT(data.totalCommittedBDT)}</p>
          <p className="mt-1 text-xs text-cream-200/40">Across every holding, any status</p>
        </div>
        <div className="rounded-2xl border border-forest-600/10 bg-cream-100 p-6">
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-forest-900/45">
            Confirmed payments collected
          </p>
          <p className="mt-2 font-numeral text-3xl text-forest-700">
            {formatBDT(data.totalCollectedBDT)}
          </p>
          <p className="mt-1 text-xs text-forest-900/40">SSLCommerz-validated only</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-forest-900">By membership category</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead>
              <tr className="border-b border-forest-600/15 text-xs uppercase tracking-wider text-forest-900/45">
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Holdings</th>
                <th className="pb-2 pr-4 font-medium">Units</th>
                <th className="pb-2 font-medium">Committed</th>
              </tr>
            </thead>
            <tbody>
              {data.byPlan.map((p) => (
                <tr key={p.slug} className="border-b border-forest-600/8">
                  <td className="py-2.5 pr-4 font-medium text-forest-900">{p.name}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-forest-900/70">{p.holdings}</td>
                  <td className="py-2.5 pr-4 tabular-nums text-forest-900/70">{p.units}</td>
                  <td className="py-2.5 font-numeral text-forest-800">
                    {formatBDT(p.committedBDT)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
