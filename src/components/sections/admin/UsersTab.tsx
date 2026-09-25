"use client";

import { useEffect, useState } from "react";
import { formatBDT } from "@/lib/shares";
import { IconTile } from "@/components/ui/IconTile";
import type { AdminUser } from "@/lib/admin-types";

const AVATAR_COLORS = ["#0F8A5F", "#1D93BC", "#D9A441", "#8FBF4D"];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UsersTab() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((json) => (json.error ? setError(json.error) : setUsers(json.users)))
      .catch(() => setError("Could not load shareholders."));
  }, []);

  if (error) return <p className="text-sm text-gold-600">{error}</p>;
  if (!users) return <p className="text-sm text-forest-900/50">Loading…</p>;

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.phone}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email or phone…"
        className="w-full max-w-sm rounded-xl border border-forest-600/15 bg-cream-50 px-4 py-2.5 text-sm outline-none focus:border-forest-600/45"
      />

      <div className="mt-6 space-y-4">
        {filtered.length === 0 && (
          <p className="text-sm text-forest-900/45">No shareholders match.</p>
        )}
        {filtered.map((u, i) => (
          <div key={u.id} className="rounded-2xl border border-forest-600/10 bg-cream-50 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <IconTile color={AVATAR_COLORS[i % AVATAR_COLORS.length]} size="md">
                  <span className="text-sm font-semibold">{initials(u.name)}</span>
                </IconTile>
                <div>
                  <p className="font-display text-xl text-forest-900">{u.name}</p>
                  <p className="text-xs text-forest-900/50">
                    {u.email} · {u.phone} · {u.location}
                  </p>
                </div>
              </div>
              <p className="text-xs text-forest-900/40">
                Joined {new Date(u.createdAt).toLocaleDateString("en-GB")}
              </p>
            </div>

            {u.holdings.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {u.holdings.map((h) => (
                  <li
                    key={h.id}
                    className="rounded-full bg-forest-600/7 px-3 py-1.5 text-xs text-forest-800"
                  >
                    {h.plan.name} · {h.units} unit(s) · {formatBDT(h.totalAmountBDT)} ·{" "}
                    <span className="font-medium">{h.status}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-forest-900/35">No holdings yet.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
