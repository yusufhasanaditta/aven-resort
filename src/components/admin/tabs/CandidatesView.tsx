"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Badge,
  Btn,
  Card,
  DefinitionGrid,
  Drawer,
  Empty,
  ErrorNote,
  LoadingRows,
  SearchInput,
  SelectInput,
  TextArea,
  firstError,
  relTime,
  send,
  useAdminFetch,
  useToast,
} from "../kit";
import { CANDIDATE_STAGES, GENERAL_APPLICATION, type Candidate, type CandidateStatus, type JobWithCounts } from "@/lib/careers";
import { cn } from "@/lib/utils";

/** "all", a circular's id, or "general" for CVs sent without a vacancy. */
export type PositionFilter = string;

const stage = (s: CandidateStatus) => CANDIDATE_STAGES.find((x) => x.value === s)!;

function fileSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** 01712-345678 → 8801712345678, for a WhatsApp link. */
function whatsapp(phone: string) {
  const d = phone.replace(/\D/g, "");
  return d.startsWith("880") ? d : d.startsWith("0") ? `88${d}` : d;
}

function csvCell(v: unknown) {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Admin → Careers → Applications: everyone who applied on the website, with
 * their CV. A pipeline strip counts each stage; a candidate opens in a drawer
 * with the CV beside their details, a stage picker, a rating and notes.
 */
export function CandidatesView({
  jobs,
  position,
  onPosition,
  onChanged,
}: {
  jobs: JobWithCounts[];
  position: PositionFilter;
  onPosition: (p: PositionFilter) => void;
  onChanged: () => void;
}) {
  const { data, error, loading, reload } = useAdminFetch<{ candidates: Candidate[] }>("/api/admin/careers/applications");
  const [stageFilter, setStageFilter] = useState<CandidateStatus | "ALL">("ALL");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const all = useMemo(() => data?.candidates ?? [], [data]);
  const ofPosition = useMemo(
    () => all.filter((c) => position === "all" || (position === "general" ? !c.jobId && c.jobTitle === GENERAL_APPLICATION : c.jobId === position)),
    [all, position],
  );
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ofPosition.filter(
      (c) =>
        (stageFilter === "ALL" || c.status === stageFilter) &&
        (!needle || [c.name, c.email, c.phone, c.jobTitle, c.currentPosition ?? "", c.education ?? ""].some((v) => v.toLowerCase().includes(needle))),
    );
  }, [ofPosition, stageFilter, q]);
  const open = all.find((c) => c.id === openId) ?? null;

  // Positions that have applications, even if the circular has since been deleted.
  const orphanTitles = [...new Set(all.filter((c) => !c.jobId && c.jobTitle !== GENERAL_APPLICATION).map((c) => c.jobTitle))];

  function exportCsv() {
    const head = ["Applied", "Position", "Name", "Email", "Phone", "Stage", "Rating", "Current position", "Experience", "Education", "Expected salary", "Can join", "Address", "Profile", "Notes"];
    const rows = shown.map((c) => [
      c.createdAt.slice(0, 10),
      c.jobTitle,
      c.name,
      c.email,
      c.phone,
      stage(c.status).label,
      c.rating ?? "",
      c.currentPosition,
      c.experience,
      c.education,
      c.expectedSalary,
      c.noticePeriod,
      c.address,
      c.profileUrl,
      c.notes,
    ]);
    const csv = [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
    a.download = `aven-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SelectInput value={position} onChange={(e) => onPosition(e.target.value)} aria-label="Position" className="w-full sm:w-80">
          <option value="all">All positions ({all.length})</option>
          {jobs
            .filter((j) => j.status !== "DRAFT" || j.applicationCount)
            .map((j) => (
              <option key={j.id} value={j.id}>
                {j.title} ({j.applicationCount ?? 0})
              </option>
            ))}
          <option value="general">General CVs — future openings ({all.filter((c) => !c.jobId && c.jobTitle === GENERAL_APPLICATION).length})</option>
        </SelectInput>
        <SearchInput value={q} onChange={setQ} placeholder="Search name, email, phone…" className="w-full sm:w-72" />
        <Btn icon="download" className="sm:ml-auto" onClick={exportCsv} disabled={!shown.length}>
          Export CSV
        </Btn>
      </div>
      {orphanTitles.length > 0 && position === "all" && (
        <p className="mb-3 text-xs text-[#8A948E]">Includes applications for deleted circulars: {orphanTitles.join(", ")}.</p>
      )}

      {/* Pipeline strip: every stage with its count, click to filter */}
      <div className="mb-4 grid grid-cols-4 gap-1.5 sm:grid-cols-8">
        {[{ value: "ALL" as const, label: "All", tone: "gray" as const }, ...CANDIDATE_STAGES].map((s) => {
          const n = s.value === "ALL" ? ofPosition.length : ofPosition.filter((c) => c.status === s.value).length;
          const active = stageFilter === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => setStageFilter(s.value)}
              aria-pressed={active}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-left transition-colors",
                active ? "border-forest-600 bg-forest-700 text-white" : "border-[#E6E8E3] bg-white text-[#14201B] hover:bg-[#F7F8F6]",
              )}
            >
              <span className="block text-lg font-semibold tabular-nums leading-none">{n}</span>
              <span className={cn("mt-1 block truncate text-[0.6875rem]", active ? "text-white/80" : "text-[#6B756F]")}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {loading && !data ? (
        <Card>
          <LoadingRows rows={5} />
        </Card>
      ) : shown.length === 0 ? (
        <Card>
          <Empty icon="users" title={all.length ? "No applications match" : "No applications yet"}>
            {all.length
              ? "Try another position, stage or search."
              : "When someone applies on a circular — or sends a CV from the Careers page — it appears here with their CV."}
          </Empty>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y divide-[#EEF0EC]">
            {shown.map((c) => {
              const st = stage(c.status);
              return (
                <li key={c.id}>
                  <button type="button" onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-[#F7F8F6]">
                    <Avatar name={c.name} />
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-[0.875rem] text-[#14201B]", c.status === "NEW" ? "font-semibold" : "font-medium")}>{c.name}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                        {!!c.rating && <span className="text-xs text-gold-500" aria-label={`${c.rating} of 5 stars`}>{"★".repeat(c.rating)}</span>}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-[#6B756F]">
                        {c.jobTitle}
                        {c.experience && ` · ${c.experience}`}
                        {c.currentPosition && ` · ${c.currentPosition}`}
                      </span>
                    </span>
                    <span className="hidden shrink-0 text-right sm:block">
                      <span className="block text-xs text-[#6B756F]">{relTime(c.createdAt)}</span>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-[0.6875rem] font-medium text-[#8A948E]">
                        <span className="rounded bg-[#EEF1EC] px-1.5 py-0.5 uppercase">{c.cvName.split(".").pop()}</span>
                        CV
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {open && (
        <CandidateDrawer
          key={open.id}
          candidate={open}
          onClose={() => setOpenId(null)}
          onChanged={() => {
            reload();
            onChanged();
          }}
          onDeleted={() => {
            setOpenId(null);
            reload();
            onChanged();
          }}
        />
      )}
    </>
  );
}

function CandidateDrawer({
  candidate: c,
  onClose,
  onChanged,
  onDeleted,
}: {
  candidate: Candidate;
  onClose: () => void;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const toast = useToast();
  const [notes, setNotes] = useState(c.notes ?? "");
  const [busy, setBusy] = useState(false);
  const cvUrl = `/api/admin/careers/applications/${c.id}/cv`;
  const pdf = c.cvType === "application/pdf";

  async function patch(body: Record<string, unknown>, done?: string) {
    setBusy(true);
    const { ok, json } = await send(`/api/admin/careers/applications/${c.id}`, "PATCH", body);
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    if (done) toast(done);
    onChanged();
  }

  // Opening a new application marks it as being reviewed, so "New" means unread.
  useEffect(() => {
    if (c.status !== "NEW") return;
    send(`/api/admin/careers/applications/${c.id}`, "PATCH", { status: "REVIEWING" }).then(({ ok }) => ok && onChanged());
    // Once, when the drawer opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove() {
    if (!window.confirm(`Delete ${c.name}'s application and CV? This can't be undone.`)) return;
    setBusy(true);
    const { ok, json } = await send(`/api/admin/careers/applications/${c.id}`, "DELETE");
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    toast("Application deleted");
    onDeleted();
  }

  const current = c.status === "NEW" ? "REVIEWING" : c.status;

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-3xl"
      title={c.name}
      subtitle={`${c.jobTitle} · applied ${new Date(c.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}`}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Btn variant="danger" disabled={busy} onClick={remove}>
            Delete
          </Btn>
          <div className="flex flex-wrap gap-2">
            <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Your application — ${c.jobTitle}`)}`} className="inline-flex h-9 items-center rounded-lg border border-[#DDE1DB] bg-white px-3.5 text-[0.8125rem] font-medium text-[#24312B] hover:bg-[#F5F7F3]">
              Email
            </a>
            <a href={`${cvUrl}?download`} className="inline-flex h-9 items-center rounded-lg bg-forest-700 px-3.5 text-[0.8125rem] font-medium text-white hover:bg-forest-800">
              Download CV
            </a>
          </div>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Stage + rating */}
        <section className="rounded-2xl border border-[#E6E8E3] bg-white p-4">
          <p className="mb-2.5 text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {CANDIDATE_STAGES.filter((s) => s.value !== "NEW").map((s) => (
              <button
                key={s.value}
                type="button"
                disabled={busy}
                onClick={() => s.value !== current && patch({ status: s.value }, `${c.name}: ${s.label}`)}
                aria-pressed={s.value === current}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-60",
                  s.value === current
                    ? s.value === "REJECTED"
                      ? "bg-red-600 text-white"
                      : "bg-forest-700 text-white"
                    : "bg-[#F0F2EF] text-[#3D4A44] hover:bg-[#E6E9E4]",
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">Rating</p>
            <div className="flex" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={c.rating === n}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                  disabled={busy}
                  onClick={() => patch({ rating: c.rating === n ? 0 : n })}
                  className={cn("px-0.5 text-xl leading-none transition-colors", (c.rating ?? 0) >= n ? "text-gold-500" : "text-[#D5DAD3] hover:text-gold-300")}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="flex flex-wrap gap-2">
          <a href={`mailto:${c.email}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F0F2EF] px-3 text-[0.8125rem] text-[#24312B] hover:bg-[#E6E9E4]">
            ✉ {c.email}
          </a>
          <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#F0F2EF] px-3 text-[0.8125rem] text-[#24312B] hover:bg-[#E6E9E4]">
            ☎ {c.phone}
          </a>
          <a href={`https://wa.me/${whatsapp(c.phone)}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center rounded-lg bg-emerald-50 px-3 text-[0.8125rem] font-medium text-emerald-700 hover:bg-emerald-100">
            WhatsApp ↗
          </a>
        </section>

        <section className="rounded-2xl border border-[#E6E8E3] bg-white p-4">
          <DefinitionGrid
            items={[
              { k: "Position", v: c.jobSlug ? <a href={`/careers/${c.jobSlug}`} target="_blank" rel="noopener noreferrer" className="text-forest-700 hover:underline">{c.jobTitle} ↗</a> : c.jobTitle },
              { k: "Current / last position", v: c.currentPosition },
              { k: "Experience", v: c.experience },
              { k: "Education", v: c.education },
              { k: "Expected salary", v: c.expectedSalary },
              { k: "Can join", v: c.noticePeriod },
              { k: "Address", v: c.address },
              { k: "LinkedIn / portfolio", v: c.profileUrl && <a href={c.profileUrl} target="_blank" rel="noopener noreferrer" className="break-all text-forest-700 hover:underline">{c.profileUrl}</a> },
            ]}
          />
          {c.coverLetter && (
            <div className="mt-5 border-t border-[#EEF0EC] pt-4">
              <p className="text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">Cover letter</p>
              <p className="mt-1.5 whitespace-pre-line text-[0.8125rem] leading-relaxed text-[#24312B]">{c.coverLetter}</p>
            </div>
          )}
        </section>

        {/* CV */}
        <section className="overflow-hidden rounded-2xl border border-[#E6E8E3] bg-white">
          <div className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className={cn("flex h-10 w-9 items-center justify-center rounded-md text-[0.625rem] font-bold uppercase text-white", pdf ? "bg-red-600" : "bg-sky-700")}>{c.cvName.split(".").pop()}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.8125rem] font-medium text-[#14201B]">{c.cvName}</span>
              <span className="text-xs text-[#8A948E]">{fileSize(c.cvSize)}</span>
            </span>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-forest-700 hover:underline">
              Open in new tab ↗
            </a>
          </div>
          {pdf ? (
            <iframe src={`${cvUrl}#view=FitH`} title={`${c.name} — CV`} className="h-[70vh] w-full border-t border-[#EEF0EC] bg-[#F5F7F3]" />
          ) : (
            <p className="border-t border-[#EEF0EC] bg-[#FAFBF9] px-4 py-6 text-center text-xs text-[#6B756F]">Word files can&apos;t be previewed here — download the CV to read it.</p>
          )}
        </section>

        {/* Notes */}
        <section className="rounded-2xl border border-[#E6E8E3] bg-white p-4">
          <p className="mb-2 text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">Hiring team notes (never shown to the applicant)</p>
          <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interview impressions, references checked, salary discussed…" />
          <div className="mt-2 flex justify-end">
            <Btn size="sm" variant="primary" disabled={busy || notes === (c.notes ?? "")} onClick={() => patch({ notes }, "Notes saved")}>
              Save notes
            </Btn>
          </div>
        </section>
      </div>
    </Drawer>
  );
}
