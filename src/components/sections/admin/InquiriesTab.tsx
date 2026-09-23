"use client";

import { useEffect, useState } from "react";
import type { AdminInquiry } from "@/lib/admin-types";

export function InquiriesTab() {
  const [inquiries, setInquiries] = useState<AdminInquiry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/inquiries")
      .then((r) => r.json())
      .then((json) => (json.error ? setError(json.error) : setInquiries(json.inquiries)))
      .catch(() => setError("Could not load enquiries."));
  }, []);

  if (error) return <p className="text-sm text-gold-600">{error}</p>;
  if (!inquiries) return <p className="text-sm text-forest-900/50">Loading…</p>;
  if (inquiries.length === 0) {
    return <p className="text-sm text-forest-900/45">No enquiries yet.</p>;
  }

  return (
    <div className="space-y-4">
      {inquiries.map((i) => (
        <article key={i.id} className="rounded-2xl border border-forest-600/10 bg-cream-100 p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <span className="rounded-full bg-forest-600/8 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-wider text-forest-700">
                {i.type}
              </span>
              <p className="mt-2 font-display text-lg text-forest-900">
                {i.subject || "General enquiry"}
              </p>
              <p className="text-xs text-forest-900/50">
                {i.name} · {i.email} · {i.phone}
              </p>
            </div>
            <p className="text-xs text-forest-900/40">
              {new Date(i.createdAt).toLocaleString("en-GB")}
            </p>
          </div>
          <p className="mt-3 text-[0.8125rem] leading-relaxed text-forest-900/70">{i.message}</p>
        </article>
      ))}
    </div>
  );
}
