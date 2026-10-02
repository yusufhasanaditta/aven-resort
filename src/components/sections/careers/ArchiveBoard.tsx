"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { circularYear, deadlineNote, isOpen, shortDate, type Job } from "@/lib/careers";
import { PdfBadge } from "@/components/sections/careers/CareersBoard";
import { cn } from "@/lib/utils";

/**
 * Every circular ever published, grouped by year and newest first — the
 * record of past recruitment, like a university's vacancy archive. Each row
 * keeps its deadline, circular PDF and page, so old links still lead
 * somewhere useful.
 */
export function ArchiveBoard({ jobs, now }: { jobs: Job[]; now: number }) {
  const [q, setQ] = useState("");

  const years = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hits = jobs.filter(
      (j) => !needle || [j.title, j.department, j.reference ?? "", j.level ?? "", String(circularYear(j))].some((v) => v.toLowerCase().includes(needle)),
    );
    const byYear = new Map<number, Job[]>();
    for (const j of hits) byYear.set(circularYear(j), [...(byYear.get(circularYear(j)) ?? []), j]);
    return [...byYear.entries()].sort((a, b) => b[0] - a[0]);
  }, [jobs, q]);

  if (jobs.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-forest-600/20 bg-white/60 px-6 py-14 text-center text-sm text-forest-900/60">
        No circulars have been published yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-forest-900/60">
          <strong className="font-semibold text-forest-900">{jobs.length}</strong> circular{jobs.length === 1 ? "" : "s"} since {Math.min(...jobs.map(circularYear))}
        </p>
        <label className="relative w-full sm:w-80">
          <span className="sr-only">Search the archive</span>
          <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-900/40" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 16-5.6-5.6" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search the archive…"
            className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-sm text-forest-900 ring-1 ring-forest-600/12 outline-none placeholder:text-forest-900/40 focus:ring-2 focus:ring-forest-600/40"
          />
        </label>
      </div>

      {years.length === 0 ? (
        <p className="mt-8 rounded-2xl bg-white/70 px-6 py-10 text-center text-sm text-forest-900/60">Nothing in the archive matches that search.</p>
      ) : (
        <div className="mt-8 space-y-4">
          {years.map(([year, list], i) => (
            // Searching opens every year with a match; otherwise only the latest starts open.
            <details key={`${year}-${q ? "q" : ""}`} open={i === 0 || !!q} className="group overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-forest-600/8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 hover:bg-forest-600/[0.03]">
                <span className="flex items-baseline gap-3">
                  <span className="font-display text-3xl text-forest-900">{year}</span>
                  <span className="text-xs text-forest-900/50">
                    {list.length} circular{list.length === 1 ? "" : "s"}
                  </span>
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest-600/7 text-forest-700 transition-transform group-open:rotate-180" aria-hidden="true">
                  ▾
                </span>
              </summary>
              <ol className="divide-y divide-forest-600/8 border-t border-forest-600/8">
                {list.map((j) => {
                  const open = isOpen(j, now);
                  return (
                    <li key={j.id} className="grid gap-3 px-6 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link href={`/careers/${j.slug}`} className="font-medium text-forest-900 hover:text-forest-700 hover:underline">
                            {j.title}
                          </Link>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em]",
                              open ? "bg-emerald-50 text-emerald-700" : "bg-forest-600/7 text-forest-900/50",
                            )}
                          >
                            {open ? "Open" : "Closed"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-forest-900/50">
                          {[j.reference && `No. ${j.reference}`, j.department, `Published ${shortDate(j.publishedAt)}`, j.deadline ? `Deadline ${shortDate(j.deadline)}` : "Open until filled"]
                            .filter(Boolean)
                            .join(" · ")}
                          {open && <span className="font-medium text-forest-600"> · {deadlineNote(j, now)}</span>}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {j.circularUrl && (
                          <a
                            href={j.circularUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-medium text-forest-800 ring-1 ring-forest-600/15 hover:bg-forest-600/5"
                          >
                            <PdfBadge /> Circular
                          </a>
                        )}
                        <Link href={`/careers/${j.slug}`} className="inline-flex h-9 items-center rounded-full bg-forest-600/8 px-3.5 text-xs font-semibold text-forest-800 hover:bg-forest-600/14">
                          {open ? "View & apply" : "View"}
                        </Link>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
