"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { daysLeft, deadlineNote, isOpen, shortDate, type Job } from "@/lib/careers";
import { cn } from "@/lib/utils";

type View = "cards" | "table";

/**
 * The vacancy announcements: department chips, a level filter and a search,
 * then the open circulars as cards or as a notice-board table (the way
 * circulars are usually listed — published, deadline, circular PDF).
 * Closed circulars live in the archive.
 */
export function CareersBoard({ jobs, now, noVacancy, archiveCount }: { jobs: Job[]; now: number; noVacancy: string; archiveCount: number }) {
  const open = useMemo(() => jobs.filter((j) => isOpen(j, now)), [jobs, now]);
  const departments = useMemo(() => [...new Set(open.map((j) => j.department))].sort(), [open]);
  const levels = useMemo(() => [...new Set(open.map((j) => j.level).filter((l): l is string => !!l))], [open]);
  const [dept, setDept] = useState<string | null>(null);
  const [level, setLevel] = useState("");
  const [q, setQ] = useState("");
  const [view, setView] = useState<View>("cards");

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return open.filter(
      (j) =>
        (!dept || j.department === dept) &&
        (!level || j.level === level) &&
        (!needle || [j.title, j.department, j.location, j.employmentType, j.summary, j.reference ?? ""].some((v) => v.toLowerCase().includes(needle))),
    );
  }, [open, dept, level, q]);

  return (
    <div>
      {open.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by department">
              {[null, ...departments].map((d) => {
                const count = d ? open.filter((j) => j.department === d).length : open.length;
                const active = dept === d;
                return (
                  <button
                    key={d ?? "all"}
                    type="button"
                    onClick={() => setDept(d)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                      active ? "bg-forest-700 text-cream-50" : "bg-white text-forest-800 ring-1 ring-forest-600/12 hover:bg-forest-600/5",
                    )}
                  >
                    {d ?? "All departments"}
                    <span className={cn("rounded-full px-1.5 text-[0.6875rem] tabular-nums", active ? "bg-cream-50/20" : "bg-forest-600/8")}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div className="inline-flex rounded-full bg-white p-1 ring-1 ring-forest-600/12" role="group" aria-label="Layout">
              {(["cards", "table"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  className={cn("rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors", view === v ? "bg-forest-700 text-cream-50" : "text-forest-800/70 hover:text-forest-900")}
                >
                  {v === "cards" ? "Cards" : "Notice board"}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <label className="relative min-w-0 flex-1 sm:max-w-sm">
              <span className="sr-only">Search openings</span>
              <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forest-900/40" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Zm10 16-5.6-5.6" strokeLinecap="round" />
              </svg>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search openings or circular no…"
                className="h-11 w-full rounded-full bg-white pl-10 pr-4 text-sm text-forest-900 ring-1 ring-forest-600/12 outline-none placeholder:text-forest-900/40 focus:ring-2 focus:ring-forest-600/40"
              />
            </label>
            {levels.length > 1 && (
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                aria-label="Filter by job level"
                className="h-11 rounded-full bg-white px-4 pr-8 text-sm text-forest-900 ring-1 ring-forest-600/12 outline-none focus:ring-2 focus:ring-forest-600/40"
              >
                <option value="">All levels</option>
                {levels.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            )}
          </div>
        </>
      )}

      {open.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-forest-600/20 bg-white/60 px-6 py-14 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600/8 text-forest-700">
            <BriefcaseIcon className="h-7 w-7" />
          </span>
          <p className="mt-5 font-display text-2xl text-forest-900">No open positions right now</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-forest-900/60">{noVacancy}</p>
        </div>
      ) : shown.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white/70 px-6 py-10 text-center text-sm text-forest-900/60">No openings match that search.</p>
      ) : view === "table" ? (
        <NoticeTable jobs={shown} now={now} />
      ) : (
        <motion.ul layout className="mt-8 grid gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {shown.map((job) => (
              <motion.li
                key={job.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.35 }}
              >
                <JobCard job={job} now={now} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      {archiveCount > 0 && (
        <Link
          href="/careers/archive"
          className="group mt-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/70 px-6 py-4 ring-1 ring-forest-600/10 transition-colors hover:bg-white"
        >
          <span className="text-sm text-forest-900/70">
            <strong className="font-semibold text-forest-900">Circular archive</strong> — every circular we have published, by year ({archiveCount})
          </span>
          <span className="text-[0.8125rem] font-semibold text-forest-700">
            Browse the archive <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span>
          </span>
        </Link>
      )}
    </div>
  );
}

/** The circulars as a printed notice board: one row each, with the circular PDF to hand. */
function NoticeTable({ jobs, now }: { jobs: Job[]; now: number }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-3xl bg-white shadow-lift ring-1 ring-forest-600/8">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        <caption className="sr-only">Open job circulars</caption>
        <thead>
          <tr className="bg-gradient-to-r from-forest-900 to-forest-700 text-cream-50">
            {["#", "Position", "Department", "Published", "Deadline", "Circular", ""].map((h, i) => (
              <th key={i} scope="col" className="px-5 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.1em]">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.map((j, i) => {
            const left = daysLeft(j.deadline, now);
            return (
              <tr key={j.id} className={cn("border-t border-forest-600/8 align-top", i % 2 && "bg-cream-50/60")}>
                <td className="px-5 py-4 font-numeral text-forest-900/50">{String(i + 1).padStart(2, "0")}</td>
                <td className="px-5 py-4">
                  <Link href={`/careers/${j.slug}`} className="font-semibold text-forest-900 hover:text-forest-700 hover:underline">
                    {j.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-forest-900/50">
                    {[j.reference, j.level, j.employmentType, j.vacancies ? `${j.vacancies} vacanc${j.vacancies > 1 ? "ies" : "y"}` : null].filter(Boolean).join(" · ")}
                  </p>
                </td>
                <td className="px-5 py-4 text-forest-900/75">{j.department}</td>
                <td className="whitespace-nowrap px-5 py-4 text-forest-900/75">{shortDate(j.publishedAt)}</td>
                <td className="whitespace-nowrap px-5 py-4">
                  <span className="text-forest-900/75">{j.deadline ? shortDate(j.deadline) : "Until filled"}</span>
                  <span className={cn("mt-0.5 block text-xs font-medium", left !== null && left <= 3 ? "text-[#B4541E]" : "text-forest-600")}>{deadlineNote(j, now)}</span>
                </td>
                <td className="px-5 py-4">
                  {j.circularUrl ? (
                    <a href={j.circularUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-forest-700 hover:underline">
                      <PdfBadge /> Download
                    </a>
                  ) : (
                    <span className="text-forest-900/35">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  <Link href={`/careers/${j.slug}`} className="inline-flex h-9 items-center whitespace-nowrap rounded-full bg-forest-700 px-4 text-xs font-semibold text-cream-50 hover:bg-forest-800">
                    View &amp; apply
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function JobCard({ job, now }: { job: Job; now: number }) {
  const cover = job.images[0];
  const left = daysLeft(job.deadline, now);
  const urgent = left !== null && left <= 3;
  return (
    <Link
      href={`/careers/${job.slug}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-forest-600/8 transition-all duration-500 hover:-translate-y-1 hover:shadow-float",
        job.featured && "ring-2 ring-gold-400/70",
      )}
    >
      <div className="relative aspect-[16/8] shrink-0 overflow-hidden bg-forest-900">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw"
            unoptimized={cover.startsWith("http")}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest-700 via-forest-800 to-forest-950">
            <div className="bg-leaf-swirl-light absolute inset-0 opacity-40" aria-hidden="true" />
            <BriefcaseIcon className="relative h-10 w-10 text-gold-300" />
          </div>
        )}
        {job.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-forest-950">Featured</span>
        )}
        {job.updates.length > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-cream-50/95 px-2.5 py-1 text-[0.625rem] font-semibold text-forest-800">New update · {job.updates[0].title}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/70">
          {job.department}
          {job.level && <span className="text-forest-900/35"> · {job.level}</span>}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight text-forest-900 transition-colors group-hover:text-forest-700">{job.title}</h3>
        {job.reference && <p className="mt-1 font-numeral text-[0.6875rem] text-forest-900/45">Circular no. {job.reference}</p>}
        <p className="mt-2 line-clamp-2 text-[0.8125rem] leading-relaxed text-forest-900/60">{job.summary}</p>
        <ul className="mb-5 mt-4 flex flex-wrap gap-1.5 text-[0.6875rem] text-forest-800/80">
          <li className="rounded-full bg-forest-600/7 px-2.5 py-1">{job.employmentType}</li>
          <li className="rounded-full bg-forest-600/7 px-2.5 py-1">{job.location}</li>
          {job.vacancies && (
            <li className="rounded-full bg-forest-600/7 px-2.5 py-1">
              {job.vacancies} vacanc{job.vacancies > 1 ? "ies" : "y"}
            </li>
          )}
          {job.circularUrl && (
            <li className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-red-700">
              <PdfBadge small /> Circular
            </li>
          )}
        </ul>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-forest-600/8 pt-4">
          <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-medium", urgent ? "text-[#B4541E]" : "text-forest-900/55")}>
            <span className={cn("h-1.5 w-1.5 rounded-full", urgent ? "bg-[#E07A3A]" : "bg-forest-500")} aria-hidden="true" />
            {deadlineNote(job, now)}
            {job.deadline && <span className="font-normal text-forest-900/40">· {shortDate(job.deadline)}</span>}
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap text-[0.8125rem] font-semibold text-forest-700">
            View circular
            <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}

export function PdfBadge({ small = false }: { small?: boolean }) {
  return (
    <span aria-hidden="true" className={cn("inline-flex items-center justify-center rounded-[3px] bg-red-600 font-bold text-white", small ? "h-3.5 px-0.5 text-[0.4375rem]" : "h-4 px-1 text-[0.5rem]")}>
      PDF
    </span>
  );
}

export function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 8h16v11H4V8Zm5-3h6v3H9V5Zm-5 8h16" />
    </svg>
  );
}
