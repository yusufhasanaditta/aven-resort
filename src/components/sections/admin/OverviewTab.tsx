"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IconTile } from "@/components/ui/IconTile";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { Num } from "@/components/ui/Number";
import { formatBDT } from "@/lib/shares";
import type { OverviewData } from "@/lib/admin-types";

const TILES: {
  key: keyof OverviewData;
  label: string;
  icon: string;
  color: string;
}[] = [
  { key: "userCount", label: "Shareholders", icon: "users", color: "#0F8A5F" },
  { key: "holdingCount", label: "Total holdings", icon: "wallet", color: "#1D93BC" },
  { key: "activeHoldings", label: "Active holdings", icon: "overview", color: "#8FBF4D" },
  { key: "pendingHoldings", label: "Pending payment", icon: "bell", color: "#D9A441" },
  { key: "totalUnits", label: "Units committed", icon: "tag", color: "#0F8A5F" },
  { key: "inquiryCount", label: "Enquiries", icon: "mail", color: "#1D93BC" },
];

export function OverviewTab({ data }: { data: OverviewData | null }) {
  // `data` is the shared fetch AdminDashboard already made for the sidebar
  // badges — only fall back to fetching independently if this tab is ever
  // rendered without it.
  const [fetched, setFetched] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) return;
    fetch("/api/admin/overview")
      .then((r) => r.json())
      .then((json) => (json.error ? setError(json.error) : setFetched(json)))
      .catch(() => setError("Could not load overview data."));
  }, [data]);

  const local = data ?? fetched;

  if (error) return <p className="text-sm text-gold-600">{error}</p>;
  if (!local) return <p className="text-sm text-forest-900/50">Loading…</p>;

  const maxCommitted = Math.max(1, ...local.byPlan.map((p) => p.committedBDT));

  return (
    <div className="space-y-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {TILES.map((tile) => (
          <div
            key={tile.key}
            className="rounded-2xl border border-forest-600/10 bg-cream-50 p-5"
          >
            <IconTile color={tile.color} size="sm">
              <AdminIcon icon={tile.icon} className="h-4.5 w-4.5" />
            </IconTile>
            <Num as="p" size="lg" className="mt-4 text-forest-900">
              {local[tile.key] as number}
            </Num>
            <p className="mt-1 text-[0.6875rem] uppercase tracking-[0.1em] text-forest-900/45">
              {tile.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-forest-600/10 bg-forest-950 p-6 text-cream-50">
          <IconTile color="#D9A441" size="sm">
            <AdminIcon icon="wallet" className="h-4.5 w-4.5" />
          </IconTile>
          <p className="mt-4 text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/50">
            Total committed
          </p>
          <p className="mt-1 font-numeral text-3xl">{formatBDT(local.totalCommittedBDT)}</p>
          <p className="mt-1 text-xs text-cream-200/40">Across every holding, any status</p>
        </div>
        <div className="rounded-2xl border border-forest-600/10 bg-cream-50 p-6">
          <IconTile color="#0F8A5F" size="sm">
            <AdminIcon icon="tag" className="h-4.5 w-4.5" />
          </IconTile>
          <p className="mt-4 text-[0.6875rem] uppercase tracking-[0.14em] text-forest-900/45">
            Confirmed payments collected
          </p>
          <p className="mt-1 font-numeral text-3xl text-forest-700">
            {formatBDT(local.totalCollectedBDT)}
          </p>
          <p className="mt-1 text-xs text-forest-900/40">SSLCommerz-validated only</p>
        </div>
      </div>

      {/* Committed capital by category — one series, one hue, direct labels */}
      <div className="rounded-2xl border border-forest-600/10 bg-cream-50 p-6 sm:p-8">
        <h3 className="text-sm font-semibold text-forest-900">
          Committed capital by category
        </h3>
        <ul className="mt-6 space-y-4">
          {local.byPlan.map((p, i) => (
            <li key={p.slug}>
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[0.8125rem] font-medium text-forest-900/80">
                  {p.name}
                </span>
                <span className="shrink-0 text-xs text-forest-900/50">
                  {p.holdings} holding{p.holdings === 1 ? "" : "s"} ·{" "}
                  <span className="font-numeral font-semibold text-forest-700">
                    {formatBDT(p.committedBDT)}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-forest-600/8">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    width: `${(p.committedBDT / maxCommitted) * 100}%`,
                    transformOrigin: "left",
                  }}
                  className="h-full rounded-full bg-forest-600"
                />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
