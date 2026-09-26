"use client";

import { useState } from "react";
import { Avatar, Card, Empty, ErrorNote, LoadingRows, PageHeader, SearchInput, relTime, useAdminFetch } from "../kit";
import type { AdminActivity } from "@/lib/admin-types";

/** The audit trail: who did what, and when, grouped by day. */
export function ActivityTab() {
  const { data, error, loading } = useAdminFetch<{ activity: AdminActivity[] }>("/api/admin/activity");
  const [q, setQ] = useState("");
  const n = q.trim().toLowerCase();
  const rows = (data?.activity ?? []).filter(
    (a) => !n || [a.actor, a.action, a.target ?? "", a.detail ?? ""].some((v) => v.toLowerCase().includes(n)),
  );

  const groups = new Map<string, AdminActivity[]>();
  for (const a of rows) {
    const day = new Date(a.createdAt).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Asia/Dhaka" });
    groups.set(day, [...(groups.get(day) ?? []), a]);
  }

  return (
    <>
      <PageHeader
        title="Activity log"
        description="Every admin action — approvals, payments recorded, content published — for accountability."
        actions={<SearchInput value={q} onChange={setQ} placeholder="Filter activity…" className="w-60" />}
      />
      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : rows.length === 0 ? (
        <Card><Empty icon="overview" title="No activity yet">Actions taken in this panel will be recorded here.</Empty></Card>
      ) : (
        <div className="space-y-5">
          {[...groups.entries()].map(([day, items]) => (
            <Card key={day}>
              <p className="border-b border-[#EEF0EC] px-5 py-3 text-xs font-semibold text-[#6B756F]">{day}</p>
              <ul className="divide-y divide-[#F0F2EF]">
                {items.map((a) => (
                  <li key={a.id} className="flex items-start gap-3 px-5 py-3">
                    <Avatar name={a.actor} className="h-8 w-8 text-[0.6875rem]" />
                    <div className="min-w-0 flex-1 text-[0.8125rem]">
                      <p className="text-[#14201B]">
                        <span className="font-semibold">{a.actor}</span> {a.action.toLowerCase()}
                        {a.target && <span className="font-medium"> · {a.target}</span>}
                      </p>
                      {a.detail && <p className="mt-0.5 truncate text-xs text-[#6B756F]">{a.detail}</p>}
                    </div>
                    <span className="shrink-0 text-[0.6875rem] text-[#9AA39E]">{relTime(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
