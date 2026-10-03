"use client";

import { useMemo, useRef, useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import {
  Badge,
  Btn,
  Card,
  Drawer,
  Empty,
  ErrorNote,
  Field,
  LoadingRows,
  PageHeader,
  SearchInput,
  Segmented,
  SelectInput,
  Stat,
  TextArea,
  TextInput,
  Toggle,
  firstError,
  relTime,
  send,
  uploadImage,
  useAdminFetch,
  useToast,
  type BadgeTone,
} from "../kit";
import type { TabFocus } from "@/lib/admin-tabs";
import {
  DEPARTMENTS,
  EMPLOYMENT_TYPES,
  JOB_LEVELS,
  LINK_PRESETS,
  UPDATE_PRESETS,
  daysLeft,
  deadlineNote,
  isOpen,
  type Job,
  type JobWithCounts,
  type JobLink,
  type JobUpdate,
  type JobStatus,
} from "@/lib/careers";
import { cn } from "@/lib/utils";
import { CandidatesView } from "./CandidatesView";

type Filter = "ALL" | "OPEN" | "DRAFT" | "CLOSED";

/** What the public sees for a circular, as a badge. */
function jobBadge(job: Job): [BadgeTone, string] {
  if (job.status === "DRAFT") return ["gray", "Draft"];
  if (job.status === "CLOSED" || !isOpen(job)) return ["red", job.status === "CLOSED" ? "Closed" : "Deadline passed"];
  const left = daysLeft(job.deadline);
  return left !== null && left <= 3 ? ["amber", "Closing soon"] : ["green", "Live"];
}

/**
 * Admin → Careers: job circulars for the public Careers page. Each one has
 * its details, as many images as needed (the first is the cover; a scanned
 * printed circular can go in too) and buttons that take applicants to an
 * application form, a registration page, an email or a phone number.
 */
type Counts = { applicationCount: number; newApplicationCount: number };

export function CareersTab({ focus, onChanged }: { focus?: TabFocus; onChanged?: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ jobs: JobWithCounts[]; general: Counts }>("/api/admin/careers");
  const [view, setView] = useState<"circulars" | "applications">(focus?.filter === "applications" ? "applications" : "circulars");
  const [position, setPosition] = useState("all");
  const [filter, setFilter] = useState<Filter>("ALL");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Job | "new" | null>(focus?.create ? "new" : null);
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();

  const all = useMemo(() => data?.jobs ?? [], [data]);
  const applied = all.reduce((n, j) => n + (j.applicationCount ?? 0), data?.general.applicationCount ?? 0);
  const unread = all.reduce((n, j) => n + (j.newApplicationCount ?? 0), data?.general.newApplicationCount ?? 0);
  const counts = {
    open: all.filter((j) => isOpen(j)).length,
    draft: all.filter((j) => j.status === "DRAFT").length,
    closed: all.filter((j) => j.status !== "DRAFT" && !isOpen(j)).length,
    soon: all.filter((j) => isOpen(j) && (daysLeft(j.deadline) ?? 99) <= 7).length,
  };
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((j) => {
      if (filter === "OPEN" && !isOpen(j)) return false;
      if (filter === "DRAFT" && j.status !== "DRAFT") return false;
      if (filter === "CLOSED" && (j.status === "DRAFT" || isOpen(j))) return false;
      return !needle || [j.title, j.department, j.location, j.employmentType].some((v) => v.toLowerCase().includes(needle));
    });
  }, [all, filter, q]);

  async function setStatus(job: Job, status: JobStatus, done: string) {
    setBusy(job.id);
    const { ok, json } = await send(`/api/admin/careers/${job.id}`, "PATCH", { status });
    setBusy(null);
    if (!ok) return toast(firstError(json), "error");
    toast(done);
    reload();
  }

  async function remove(job: Job) {
    if (!window.confirm(`Delete the circular “${job.title}”? This can't be undone.`)) return;
    setBusy(job.id);
    const { ok, json } = await send(`/api/admin/careers/${job.id}`, "DELETE");
    setBusy(null);
    if (!ok) return toast(firstError(json), "error");
    toast("Circular deleted");
    reload();
  }

  return (
    <>
      <PageHeader
        title="Careers"
        description="Job circulars on the website's Careers page, and everyone who applied — with their CVs."
        actions={
          <>
            <a href="/careers" target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DDE1DB] bg-white px-3.5 text-[0.8125rem] font-medium text-[#24312B] hover:bg-[#F5F7F3]">
              View Careers page ↗
            </a>
            <Btn variant="primary" icon="briefcase" onClick={() => setEditing("new")}>
              New job circular
            </Btn>
          </>
        }
      />

      <Segmented<"circulars" | "applications">
        className="mb-5"
        value={view}
        onChange={setView}
        options={[
          { value: "circulars", label: "Job circulars", count: all.length },
          { value: "applications", label: unread ? `Applications · ${unread} new` : "Applications", count: applied },
        ]}
      />

      {view === "applications" ? (
        <CandidatesView
          jobs={all}
          position={position}
          onPosition={setPosition}
          onChanged={() => {
            reload();
            onChanged?.();
          }}
        />
      ) : (
      <>
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Open positions" value={counts.open} icon="briefcase" sub="Live on the website" onClick={() => setFilter("OPEN")} />
        <Stat label="Closing within 7 days" value={counts.soon} icon="calendar" tone="gold" sub="Deadline coming up" onClick={() => setFilter("OPEN")} />
        <Stat label="Drafts" value={counts.draft} icon="invoice" tone="sky" sub="Not published yet" onClick={() => setFilter("DRAFT")} />
        <Stat label="Closed" value={counts.closed} icon="check" tone="violet" sub="Closed or past deadline" onClick={() => setFilter("CLOSED")} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: "All", count: all.length },
            { value: "OPEN", label: "Open", count: counts.open },
            { value: "DRAFT", label: "Drafts", count: counts.draft },
            { value: "CLOSED", label: "Closed", count: counts.closed },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search title, department, place…" className="w-full sm:w-72" />
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {loading && !data ? (
        <Card>
          <LoadingRows rows={4} />
        </Card>
      ) : shown.length === 0 ? (
        <Card>
          <Empty icon="briefcase" title={all.length ? "Nothing here" : "No job circulars yet"}>
            {all.length ? (
              "Try another filter."
            ) : (
              <>
                Post your first opening — it appears on the Careers page as soon as you publish it.
                <span className="mt-4 block">
                  <Btn variant="primary" icon="briefcase" onClick={() => setEditing("new")}>
                    New job circular
                  </Btn>
                </span>
              </>
            )}
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((job) => {
            const [tone, label] = jobBadge(job);
            const cover = job.images[0];
            return (
              <Card key={job.id} className="flex overflow-hidden">
                <button type="button" onClick={() => setEditing(job)} className="relative hidden w-36 shrink-0 bg-[#EEF1EC] sm:block" aria-label={`Edit ${job.title}`}>
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail
                    <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-forest-700 to-forest-900 text-gold-300">
                      <AdminIcon icon="briefcase" className="h-8 w-8" />
                    </span>
                  )}
                </button>
                <div className="flex min-w-0 flex-1 flex-col p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={tone}>{label}</Badge>
                    {job.featured && <Badge tone="amber">Featured</Badge>}
                    <span className="text-[0.6875rem] text-[#8A948E]">Edited {relTime(job.updatedAt)}</span>
                  </div>
                  <button type="button" onClick={() => setEditing(job)} className="mt-2 text-left text-[0.9375rem] font-semibold text-[#14201B] hover:text-forest-700">
                    {job.title}
                  </button>
                  <p className="mt-0.5 truncate text-xs text-[#6B756F]">
                    {job.reference && <span className="font-medium text-[#3D4A44]">{job.reference} · </span>}
                    {job.department} · {job.employmentType} · {job.location}
                    {job.vacancies ? ` · ${job.vacancies} vacanc${job.vacancies > 1 ? "ies" : "y"}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-[#6B756F]">
                    {job.status === "DRAFT" ? "Not on the website" : deadlineNote(job)}
                    {job.links.length > 0 && ` · ${job.links.length} button${job.links.length > 1 ? "s" : ""}`}
                    {job.images.length > 0 && ` · ${job.images.length} image${job.images.length > 1 ? "s" : ""}`}
                    {job.circularUrl && " · PDF"}
                    {job.updates.length > 0 && ` · ${job.updates.length} update${job.updates.length > 1 ? "s" : ""}`}
                  </p>
                  {!!job.applicationCount && (
                    <button
                      type="button"
                      onClick={() => {
                        setPosition(job.id);
                        setView("applications");
                      }}
                      className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg bg-[#F0F2EF] px-2.5 py-1 text-xs font-medium text-[#24312B] hover:bg-[#E6E9E4]"
                    >
                      <AdminIcon icon="users" className="h-3.5 w-3.5" />
                      {job.applicationCount} application{job.applicationCount > 1 ? "s" : ""}
                      {!!job.newApplicationCount && <span className="rounded-full bg-amber-100 px-1.5 text-[0.625rem] font-semibold text-amber-800">{job.newApplicationCount} new</span>}
                    </button>
                  )}
                  <div className="mt-auto flex flex-wrap gap-2 pt-3">
                    <Btn size="sm" onClick={() => setEditing(job)}>
                      Edit
                    </Btn>
                    <a
                      href={`/careers/${job.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-8 items-center rounded-lg border border-[#DDE1DB] bg-white px-3 text-xs font-medium text-[#24312B] hover:bg-[#F5F7F3]"
                    >
                      {job.status === "DRAFT" ? "Preview ↗" : "View ↗"}
                    </a>
                    {job.status !== "PUBLISHED" ? (
                      <Btn size="sm" variant="primary" disabled={busy === job.id} onClick={() => setStatus(job, "PUBLISHED", `“${job.title}” is live`)}>
                        Publish
                      </Btn>
                    ) : (
                      <>
                        <Btn size="sm" disabled={busy === job.id} onClick={() => setStatus(job, "CLOSED", `“${job.title}” closed`)}>
                          Close
                        </Btn>
                        <Btn size="sm" variant="ghost" disabled={busy === job.id} onClick={() => setStatus(job, "DRAFT", `“${job.title}” taken off the website`)}>
                          Unpublish
                        </Btn>
                      </>
                    )}
                    <Btn size="sm" variant="danger" disabled={busy === job.id} onClick={() => remove(job)} aria-label={`Delete ${job.title}`}>
                      Delete
                    </Btn>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      </>
      )}

      {editing && (
        <JobEditor
          key={editing === "new" ? "new" : editing.id}
          job={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ editor */

type Draft = {
  title: string;
  reference: string;
  level: string;
  department: string;
  employmentType: string;
  location: string;
  vacancies: string;
  salary: string;
  experience: string;
  education: string;
  deadline: string;
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  howToApply: string;
  images: string[];
  links: JobLink[];
  updates: JobUpdate[];
  circularUrl: string;
  circularName: string;
  contactEmail: string;
  contactPhone: string;
  featured: boolean;
  applyOnline: boolean;
};

function toDraft(job: Job | null): Draft {
  return {
    title: job?.title ?? "",
    reference: job?.reference ?? "",
    level: job?.level ?? "",
    department: job?.department ?? "",
    employmentType: job?.employmentType ?? "Full-time",
    location: job?.location ?? "Sreemangal, Moulvibazar",
    vacancies: job?.vacancies ? String(job.vacancies) : "",
    salary: job?.salary ?? "",
    experience: job?.experience ?? "",
    education: job?.education ?? "",
    // Stored at noon UTC, so the UTC date is the day that was picked.
    deadline: job?.deadline ? job.deadline.slice(0, 10) : "",
    summary: job?.summary ?? "",
    description: job?.description ?? "",
    responsibilities: job?.responsibilities ?? "",
    requirements: job?.requirements ?? "",
    benefits: job?.benefits ?? "",
    howToApply: job?.howToApply ?? "",
    images: job?.images ?? [],
    links: job?.links ?? [],
    updates: job?.updates ?? [],
    circularUrl: job?.circularUrl ?? "",
    circularName: job?.circularName ?? "",
    contactEmail: job?.contactEmail ?? "",
    contactPhone: job?.contactPhone ?? "",
    featured: job?.featured ?? false,
    applyOnline: job?.applyOnline ?? true,
  };
}

/** Today's date on the admin's own clock, as the date picker wants it. */
function today() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function JobEditor({ job, onClose, onSaved }: { job: Job | null; onClose: () => void; onSaved: () => void }) {
  const [d, setD] = useState<Draft>(() => toDraft(job));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<JobStatus | null>(null);
  const [uploading, setUploading] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const toast = useToast();
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 12 - d.images.length);
    setUploading(list.length);
    for (const file of list) {
      const r = await uploadImage(file);
      if (r.ok) setD((x) => ({ ...x, images: [...x.images, r.url] }));
      else toast(`${file.name}: ${r.error}`, "error");
      setUploading((n) => n - 1);
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function moveImage(i: number, to: number) {
    setD((x) => {
      const images = [...x.images];
      const [img] = images.splice(i, 1);
      images.splice(to, 0, img);
      return { ...x, images };
    });
  }

  async function addCircular(file: File | undefined) {
    if (!file) return;
    setPdfBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/careers/upload", { method: "POST", body: fd });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) toast(json.error ?? "Upload failed.", "error");
      else setD((x) => ({ ...x, circularUrl: json.url, circularName: json.name }));
    } catch {
      toast("Upload failed. Please try again.", "error");
    }
    setPdfBusy(false);
    if (pdfRef.current) pdfRef.current.value = "";
  }

  function setUpdate(i: number, patch: Partial<JobUpdate>) {
    setD((x) => ({ ...x, updates: x.updates.map((u, k) => (k === i ? { ...u, ...patch } : u)) }));
  }

  function setLink(i: number, patch: Partial<JobLink>) {
    setD((x) => ({ ...x, links: x.links.map((l, k) => (k === i ? { ...l, ...patch } : l)) }));
  }

  async function save(status: JobStatus) {
    setSaving(status);
    setErrors({});
    const body = {
      ...d,
      vacancies: d.vacancies ? Number(d.vacancies) : null,
      links: d.links.filter((l) => l.label.trim() || l.url.trim()),
      updates: d.updates.filter((u) => u.title.trim() || u.body.trim() || u.url.trim()),
      status,
    };
    const { ok, json } = job ? await send(`/api/admin/careers/${job.id}`, "PATCH", body) : await send("/api/admin/careers", "POST", body);
    setSaving(null);
    if (!ok) {
      setErrors(json.errors ?? {});
      return toast(firstError(json), "error");
    }
    toast(status === "PUBLISHED" ? "Circular published on the Careers page" : status === "CLOSED" ? "Circular saved as closed" : "Draft saved");
    onSaved();
  }

  const current = job?.status ?? "DRAFT";
  const section = "rounded-2xl border border-[#E6E8E3] bg-white p-5";
  const heading = "mb-4 text-[0.8125rem] font-semibold text-[#14201B]";

  return (
    <Drawer
      open
      onClose={onClose}
      width="max-w-3xl"
      title={job ? job.title : "New job circular"}
      subtitle={job ? `Web address: /careers/${job.slug}` : "Write it once — save as a draft to come back to it, or publish straight away."}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-[#6B756F]">
            {current === "PUBLISHED" ? "Live on the website — saving updates it at once." : current === "CLOSED" ? "Shown on the website as closed." : "Drafts are only visible to admins."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Btn onClick={onClose}>Cancel</Btn>
            {current !== "PUBLISHED" && (
              <Btn disabled={!!saving || uploading > 0 || pdfBusy} onClick={() => save(current)}>
                {saving === current ? "Saving…" : current === "CLOSED" ? "Save" : "Save draft"}
              </Btn>
            )}
            <Btn variant="primary" icon="check" disabled={!!saving || uploading > 0 || pdfBusy} onClick={() => save("PUBLISHED")}>
              {saving === "PUBLISHED" ? "Publishing…" : current === "PUBLISHED" ? "Save changes" : "Publish"}
            </Btn>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* The position */}
        <section className={section}>
          <h3 className={heading}>The position</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Job title" error={errors.title} className="sm:col-span-2">
              {(id) => <TextInput id={id} value={d.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Front Office Executive" />}
            </Field>
            <Field label="Circular / memo no." error={errors.reference} hint="Optional — as printed on the circular">
              {(id) => <TextInput id={id} value={d.reference} onChange={(e) => set("reference", e.target.value)} placeholder="e.g. AVEN/HR/2026/014" />}
            </Field>
            <Field label="Job level" error={errors.level}>
              {(id) => (
                <SelectInput id={id} value={d.level} onChange={(e) => set("level", e.target.value)}>
                  <option value="">Not specified</option>
                  {JOB_LEVELS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </SelectInput>
              )}
            </Field>
            <Field label="Department" error={errors.department}>
              {(id) => (
                <>
                  <TextInput id={id} list="aven-departments" value={d.department} onChange={(e) => set("department", e.target.value)} placeholder="Choose or type" />
                  <datalist id="aven-departments">
                    {DEPARTMENTS.map((x) => (
                      <option key={x} value={x} />
                    ))}
                  </datalist>
                </>
              )}
            </Field>
            <Field label="Employment type" error={errors.employmentType}>
              {(id) => (
                <SelectInput id={id} value={d.employmentType} onChange={(e) => set("employmentType", e.target.value)}>
                  {EMPLOYMENT_TYPES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </SelectInput>
              )}
            </Field>
            <Field label="Job location" error={errors.location}>
              {(id) => <TextInput id={id} value={d.location} onChange={(e) => set("location", e.target.value)} />}
            </Field>
            <Field label="Vacancies" error={errors.vacancies} hint="Leave empty if not fixed">
              {(id) => <TextInput id={id} inputMode="numeric" value={d.vacancies} onChange={(e) => set("vacancies", e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder="e.g. 2" />}
            </Field>
            <Field label="Salary" error={errors.salary} hint="e.g. ৳25,000 – ৳35,000 / month, or Negotiable">
              {(id) => <TextInput id={id} value={d.salary} onChange={(e) => set("salary", e.target.value)} placeholder="Negotiable" />}
            </Field>
            <Field label="Application deadline" error={errors.deadline} hint="Empty = open until filled">
              {(id) => <TextInput id={id} type="date" value={d.deadline} onChange={(e) => set("deadline", e.target.value)} />}
            </Field>
            <Field label="Experience" error={errors.experience}>
              {(id) => <TextInput id={id} value={d.experience} onChange={(e) => set("experience", e.target.value)} placeholder="e.g. At least 2 years in a hotel or resort" />}
            </Field>
            <Field label="Education" error={errors.education}>
              {(id) => <TextInput id={id} value={d.education} onChange={(e) => set("education", e.target.value)} placeholder="e.g. Bachelor's in Hospitality or any discipline" />}
            </Field>
          </div>
        </section>

        {/* The circular */}
        <section className={section}>
          <h3 className={heading}>The circular</h3>
          <div className="grid gap-4">
            <Field label="Summary" error={errors.summary} hint="One or two sentences — shown on the job card and at the top of the circular.">
              {(id) => <TextArea id={id} rows={2} value={d.summary} onChange={(e) => set("summary", e.target.value)} />}
            </Field>
            <Field label="About the role" error={errors.description} hint="Optional. Leave a blank line between paragraphs.">
              {(id) => <TextArea id={id} rows={5} value={d.description} onChange={(e) => set("description", e.target.value)} />}
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Responsibilities" error={errors.responsibilities} hint="One point per line">
                {(id) => <TextArea id={id} rows={6} value={d.responsibilities} onChange={(e) => set("responsibilities", e.target.value)} placeholder={"Welcome guests on arrival\nHandle check-in and check-out"} />}
              </Field>
              <Field label="Requirements" error={errors.requirements} hint="One point per line">
                {(id) => <TextArea id={id} rows={6} value={d.requirements} onChange={(e) => set("requirements", e.target.value)} placeholder={"Fluent in Bangla and English\nComfortable with computers"} />}
              </Field>
              <Field label="Salary & benefits" error={errors.benefits} hint="One point per line">
                {(id) => <TextArea id={id} rows={5} value={d.benefits} onChange={(e) => set("benefits", e.target.value)} placeholder={"Two festival bonuses\nMeals and accommodation on site"} />}
              </Field>
              <Field label="How to apply" error={errors.howToApply} hint="Optional instructions shown next to the buttons">
                {(id) => <TextArea id={id} rows={5} value={d.howToApply} onChange={(e) => set("howToApply", e.target.value)} placeholder="Apply online, or send your CV with a recent photo to…" />}
              </Field>
            </div>
          </div>
        </section>

        {/* The official circular */}
        <section className={section}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-[0.8125rem] font-semibold text-[#14201B]">Official circular (PDF)</h3>
              <p className="mt-1 max-w-md text-xs text-[#6B756F]">Optional. Visitors get a “Download circular” button and can read it on the page. PDF, under 4 MB.</p>
            </div>
            <input ref={pdfRef} type="file" accept="application/pdf" hidden onChange={(e) => addCircular(e.target.files?.[0])} />
            {!d.circularUrl && (
              <Btn size="sm" icon="invoice" disabled={pdfBusy} onClick={() => pdfRef.current?.click()}>
                {pdfBusy ? "Uploading…" : "Upload PDF"}
              </Btn>
            )}
          </div>
          {errors.circularUrl && <p className="mt-3 text-xs text-red-600">{errors.circularUrl}</p>}
          {d.circularUrl && (
            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-[#E6E8E3] bg-[#F7F8F6] px-4 py-3">
              <span className="flex h-10 w-9 items-center justify-center rounded-md bg-red-600 text-[0.625rem] font-bold text-white">PDF</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8125rem] font-medium text-[#14201B]">{d.circularName || "Circular.pdf"}</span>
                <a href={d.circularUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-forest-700 hover:underline">
                  Open ↗
                </a>
              </span>
              <Btn size="sm" disabled={pdfBusy} onClick={() => pdfRef.current?.click()}>
                {pdfBusy ? "Uploading…" : "Replace"}
              </Btn>
              <Btn size="sm" variant="ghost" onClick={() => setD((x) => ({ ...x, circularUrl: "", circularName: "" }))}>
                Remove
              </Btn>
            </div>
          )}
        </section>

        {/* Recruitment updates */}
        <section className={section}>
          <h3 className="text-[0.8125rem] font-semibold text-[#14201B]">Recruitment updates</h3>
          <p className="mb-4 mt-1 text-xs text-[#6B756F]">
            Notices after the circular goes up — shortlisted candidates, written test or interview schedule, final result. They show on the circular, newest first, and on the Careers page.
          </p>
          {errors.updates && <p className="mb-3 text-xs text-red-600">{errors.updates}</p>}
          <datalist id="aven-update-presets">
            {UPDATE_PRESETS.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
          <ul className="space-y-3">
            {d.updates.map((u, i) => (
              <li key={i} className="rounded-xl border border-[#E6E8E3] p-3">
                <div className="grid gap-2 sm:grid-cols-[9.5rem_1fr_auto]">
                  <TextInput type="date" value={u.date} onChange={(e) => setUpdate(i, { date: e.target.value })} aria-label={`Update ${i + 1} date`} />
                  <TextInput list="aven-update-presets" value={u.title} onChange={(e) => setUpdate(i, { title: e.target.value })} placeholder="e.g. Interview schedule" aria-label={`Update ${i + 1} title`} />
                  <Btn variant="ghost" onClick={() => set("updates", d.updates.filter((_, k) => k !== i))} aria-label={`Remove update ${i + 1}`}>
                    Remove
                  </Btn>
                </div>
                <TextArea className="mt-2" rows={2} value={u.body} onChange={(e) => setUpdate(i, { body: e.target.value })} placeholder="Details (optional): date, time, venue, what to bring…" aria-label={`Update ${i + 1} details`} />
                <TextInput className="mt-2" value={u.url} onChange={(e) => setUpdate(i, { url: e.target.value })} placeholder="Link (optional): a list, a form, a PDF…" aria-label={`Update ${i + 1} link`} />
              </li>
            ))}
          </ul>
          <Btn
            size="sm"
            className={d.updates.length ? "mt-3" : ""}
            onClick={() => set("updates", [{ date: today(), title: "", body: "", url: "" }, ...d.updates])}
          >
            + Post an update
          </Btn>
        </section>

        {/* Images */}
        <section className={section}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-[0.8125rem] font-semibold text-[#14201B]">Images</h3>
            <Btn size="sm" icon="image" disabled={uploading > 0 || d.images.length >= 12} onClick={() => fileRef.current?.click()}>
              {uploading > 0 ? `Uploading ${uploading}…` : "Add images"}
            </Btn>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden onChange={(e) => addImages(e.target.files)} />
          </div>
          {errors.images && <p className="mb-3 text-xs text-red-600">{errors.images}</p>}
          {d.images.length === 0 ? (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#DDE1DB] px-4 py-8 text-center hover:border-forest-500 hover:bg-[#F7F8F6]"
            >
              <AdminIcon icon="image" className="h-6 w-6 text-[#8A948E]" />
              <span className="mt-2 text-[0.8125rem] font-medium text-[#24312B]">Add a cover photo and any other images</span>
              <span className="mt-1 text-xs text-[#8A948E]">The first image is the cover. You can also add a photo or scan of the printed circular.</span>
            </button>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {d.images.map((src, i) => (
                <li key={src} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-[#EEF1EC] ring-1 ring-[#E6E8E3]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-forest-700 px-2 py-0.5 text-[0.625rem] font-semibold text-white">Cover</span>}
                  <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-gradient-to-t from-black/70 to-transparent p-1.5 pt-6">
                    {i > 0 && (
                      <button type="button" onClick={() => moveImage(i, 0)} className="rounded-md bg-white/90 px-2 py-1 text-[0.625rem] font-semibold text-[#14201B]">
                        Make cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => set("images", d.images.filter((_, k) => k !== i))}
                      className="ml-auto rounded-md bg-white/90 px-2 py-1 text-[0.625rem] font-semibold text-red-600"
                      aria-label={`Remove image ${i + 1}`}
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Buttons */}
        <section className={section}>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F5F7F3] p-4">
            <div className="max-w-md">
              <p className="text-[0.8125rem] font-semibold text-[#14201B]">Take applications on the website</p>
              <p className="mt-0.5 text-xs text-[#6B756F]">
                An “Apply online” form on the circular: applicants fill in their details and upload a CV, and you read them under Careers → Applications.
              </p>
            </div>
            <Toggle checked={d.applyOnline} onChange={(v) => set("applyOnline", v)} label={d.applyOnline ? "On" : "Off"} />
          </div>
          <h3 className="text-[0.8125rem] font-semibold text-[#14201B]">{d.applyOnline ? "Other buttons (optional)" : "Apply, register & contact buttons"}</h3>
          <p className="mb-4 mt-1 text-xs text-[#6B756F]">
            Each becomes a button on the circular. The link can be a web address (a Google Form, a registration page), an email or a phone number. The first is the main button.
          </p>
          {errors.links && <p className="mb-3 text-xs text-red-600">{errors.links}</p>}
          <datalist id="aven-link-presets">
            {LINK_PRESETS.map((x) => (
              <option key={x} value={x} />
            ))}
          </datalist>
          <ul className="space-y-2.5">
            {d.links.map((l, i) => (
              <li key={i} className="grid gap-2 sm:grid-cols-[12rem_1fr_auto]">
                <TextInput list="aven-link-presets" value={l.label} onChange={(e) => setLink(i, { label: e.target.value })} placeholder="Button name" aria-label={`Button ${i + 1} name`} />
                <TextInput value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="https://forms.gle/…  ·  hr@avenresort.com  ·  01XXXXXXXXX" aria-label={`Button ${i + 1} link`} />
                <Btn variant="ghost" onClick={() => set("links", d.links.filter((_, k) => k !== i))} aria-label={`Remove button ${i + 1}`}>
                  Remove
                </Btn>
              </li>
            ))}
          </ul>
          {d.links.length < 6 && (
            <Btn size="sm" className="mt-3" onClick={() => set("links", [...d.links, { label: "", url: "" }])}>
              + Add a button
            </Btn>
          )}
          <div className="mt-5 grid gap-4 border-t border-[#EEF0EC] pt-4 sm:grid-cols-2">
            <Field label="HR email (optional)" error={errors.contactEmail}>
              {(id) => <TextInput id={id} type="email" value={d.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} placeholder="hr@…" />}
            </Field>
            <Field label="HR phone (optional)" error={errors.contactPhone}>
              {(id) => <TextInput id={id} value={d.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} placeholder="01XXXXXXXXX" />}
            </Field>
          </div>
        </section>

        <section className={cn(section, "flex flex-wrap items-center justify-between gap-3")}>
          <div>
            <p className="text-[0.8125rem] font-semibold text-[#14201B]">Feature this circular</p>
            <p className="text-xs text-[#6B756F]">Featured openings are shown first, with a highlight.</p>
          </div>
          <Toggle checked={d.featured} onChange={(v) => set("featured", v)} label={d.featured ? "Featured" : "Not featured"} />
        </section>
      </div>
    </Drawer>
  );
}
