"use client";

import { useRef, useState } from "react";
import { CV_ACCEPT, CV_MAX_BYTES, EXPERIENCE_BANDS } from "@/lib/careers";
import { cn } from "@/lib/utils";

const inputCls =
  "h-12 w-full rounded-xl border border-forest-600/15 bg-white px-4 text-[0.9375rem] text-forest-900 outline-none transition-shadow placeholder:text-forest-900/35 focus:border-forest-500 focus:ring-4 focus:ring-forest-500/10";

const FIELD_ORDER = ["name", "email", "phone", "currentPosition", "experience", "education", "expectedSalary", "noticePeriod", "address", "profileUrl", "coverLetter", "cv", "consent"];

function size(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * The online application: contact details, a few facts about experience,
 * an optional cover letter and the CV (PDF or Word). Sent straight to the
 * hiring team in admin → Careers → Applications. Without a job it sends a
 * CV for future openings; `collapsed` starts it as a single button.
 */
export function ApplyForm({ jobId, jobTitle, collapsed = false }: { jobId?: string; jobTitle: string; collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ reference: string; name: string; email: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function choose(f: File | undefined | null) {
    if (!f) return;
    const okType = /\.(pdf|docx?)$/i.test(f.name);
    setErrors((e) => ({
      ...e,
      cv: !okType ? "Choose a PDF or Word file (.pdf, .docx or .doc)." : f.size > CV_MAX_BYTES ? `This file is ${size(f.size)} — your CV must be under 4 MB.` : "",
    }));
    setFile(okType && f.size <= CV_MAX_BYTES ? f : null);
  }

  function show(errs: Record<string, string>) {
    setErrors(errs);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (!file) return show({ cv: "Attach your CV." });
    fd.set("cv", file);
    if (jobId) fd.set("jobId", jobId);

    setSending(true);
    try {
      const r = await fetch("/api/careers/apply", { method: "POST", body: fd });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (json.errors) show(json.errors);
        else setServerError(json.error ?? "Something went wrong. Please try again.");
      } else {
        setDone({ reference: json.reference, name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? "") });
        form.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } catch {
      setServerError("Couldn't send your application. Check your connection and try again.");
    }
    setSending(false);
  }

  if (done) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-lift ring-1 ring-forest-600/8 sm:p-10" role="status">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/12 text-3xl text-emerald-600" aria-hidden="true">
          ✓
        </span>
        <p className="mt-5 font-display text-3xl text-forest-900">Thank you, {done.name.split(" ")[0]}.</p>
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] leading-relaxed text-forest-900/65">
          Your application for <strong className="font-semibold text-forest-900">{jobTitle}</strong> has reached our HR team.
        </p>
        <p className="mx-auto mt-5 inline-flex rounded-full bg-cream-100 px-4 py-2 font-numeral text-sm text-forest-900">Reference {done.reference}</p>
        <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-[0.8125rem] text-forest-900/65">
          <li>• A confirmation is on its way to {done.email}.</li>
          <li>• If you are shortlisted, we will call or email you.</li>
          <li>• Interview schedules and results are posted on the circular.</li>
        </ul>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-forest-700 px-6 text-sm font-semibold text-cream-50 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-forest-800"
      >
        Send us your CV <span aria-hidden="true">→</span>
      </button>
    );
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-forest-600/8 sm:p-8">
      {/* Honeypot — hidden from people, filled in by bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <Group title="About you">
        <Input label="Full name" required field="name" error={errors.name} className="sm:col-span-2">
          <input name="name" className={inputCls} autoComplete="name" />
        </Input>
        <Input label="Email" required field="email" error={errors.email}>
          <input name="email" type="email" className={inputCls} autoComplete="email" />
        </Input>
        <Input label="Mobile number" required field="phone" error={errors.phone}>
          <input name="phone" className={inputCls} autoComplete="tel" inputMode="tel" placeholder="01XXXXXXXXX" />
        </Input>
        <Input label="Present address" field="address" error={errors.address} className="sm:col-span-2">
          <input name="address" className={inputCls} autoComplete="street-address" placeholder="Area, district" />
        </Input>
      </Group>

      <Group title="Experience">
        <Input label="Current or last position" field="currentPosition" error={errors.currentPosition}>
          <input name="currentPosition" className={inputCls} placeholder="e.g. Front Desk Officer, Hotel X" />
        </Input>
        <Input label="Total experience" field="experience" error={errors.experience}>
          <span className="relative block">
            <select name="experience" defaultValue="" className={cn(inputCls, "appearance-none pr-10")}>
              <option value="">Choose…</option>
              {EXPERIENCE_BANDS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-forest-900/45" aria-hidden="true">
              ▾
            </span>
          </span>
        </Input>
        <Input label="Highest education" field="education" error={errors.education}>
          <input name="education" className={inputCls} placeholder="e.g. BBA in Tourism & Hospitality" />
        </Input>
        <Input label="Expected salary" field="expectedSalary" error={errors.expectedSalary}>
          <input name="expectedSalary" className={inputCls} placeholder="e.g. ৳30,000 / month" />
        </Input>
        <Input label="Can join" field="noticePeriod" error={errors.noticePeriod}>
          <input name="noticePeriod" className={inputCls} placeholder="e.g. Immediately, or in 1 month" />
        </Input>
        <Input label="LinkedIn or portfolio" field="profileUrl" error={errors.profileUrl}>
          <input name="profileUrl" type="url" className={inputCls} placeholder="https://…" />
        </Input>
        <Input label="Cover letter" field="coverLetter" error={errors.coverLetter} hint="Optional — a few lines on why this role suits you." className="sm:col-span-2">
          <textarea name="coverLetter" rows={4} className={cn(inputCls, "h-auto py-3 leading-relaxed")} />
        </Input>
      </Group>

      <Group title="Your CV">
        <div className="sm:col-span-2" data-field="cv">
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              choose(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-5 py-8 text-center transition-colors",
              drag ? "border-forest-500 bg-forest-600/5" : errors.cv ? "border-red-300 bg-red-50/40" : file ? "border-forest-500/50 bg-cream-50" : "border-forest-600/20 hover:border-forest-500/60 hover:bg-cream-50",
            )}
          >
            <input type="file" accept={CV_ACCEPT} className="sr-only" onChange={(e) => choose(e.target.files?.[0])} />
            {file ? (
              <>
                <span className="flex h-12 w-10 items-center justify-center rounded-md bg-forest-700 text-[0.625rem] font-bold uppercase text-cream-50" aria-hidden="true">
                  {file.name.split(".").pop()}
                </span>
                <span className="mt-3 max-w-full truncate text-[0.9375rem] font-medium text-forest-900">{file.name}</span>
                <span className="mt-0.5 text-xs text-forest-900/50">{size(file.size)} · click to choose another file</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-forest-600/60" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
                </svg>
                <span className="mt-3 text-[0.9375rem] font-medium text-forest-900">
                  Drop your CV here or <span className="text-forest-600 underline underline-offset-4">browse</span>
                </span>
                <span className="mt-1 text-xs text-forest-900/50">PDF or Word (.pdf, .docx, .doc) · up to 4 MB</span>
              </>
            )}
          </label>
          {errors.cv && <p className="mt-1.5 text-xs text-red-600">{errors.cv}</p>}
        </div>
      </Group>

      <label className="mt-6 flex items-start gap-3 text-[0.8125rem] leading-relaxed text-forest-900/70" data-field="consent">
        <input type="checkbox" name="consent" value="yes" className="mt-0.5 h-4 w-4 shrink-0 rounded accent-forest-700" />
        <span>
          The information I have given is true, and Aven may keep my application and CV to consider me for this and future openings. See our{" "}
          <a href="/privacy" target="_blank" className="font-medium text-forest-700 underline underline-offset-2">
            privacy policy
          </a>
          .
        </span>
      </label>
      {errors.consent && <p className="mt-1.5 text-xs text-red-600">{errors.consent}</p>}

      {serverError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-6 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-forest-700 text-[0.9375rem] font-semibold text-cream-50 shadow-lift transition-all hover:-translate-y-0.5 hover:bg-forest-800 disabled:translate-y-0 disabled:opacity-60"
      >
        {sending ? "Sending your application…" : jobId ? "Submit application" : "Send my CV"}
      </button>
      <p className="mt-3 text-center text-[0.6875rem] text-forest-900/45">Aven never asks for money at any stage of recruitment.</p>
    </form>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-7 first-of-type:mt-0">
      <legend className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-forest-600/70">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Input({
  label,
  field,
  required,
  error,
  hint,
  className,
  children,
}: {
  label: string;
  field: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)} data-field={field}>
      <span className="mb-1.5 block text-xs font-medium text-forest-900/60">
        {label}
        {required && <span className="text-[#C2410C]"> *</span>}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : hint ? <span className="mt-1 block text-xs text-forest-900/45">{hint}</span> : null}
    </label>
  );
}
