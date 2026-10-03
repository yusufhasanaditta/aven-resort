/**
 * Job circulars for the Careers page. Shared by the admin panel and the public
 * pages, so nothing here touches the database (see careers-server.ts).
 */

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type JobLink = { label: string; url: string };

/** A notice posted on a circular after it went up: shortlist, interview schedule, result… */
export type JobUpdate = { date: string; title: string; body: string; url: string };

export type Job = {
  id: string;
  slug: string;
  title: string;
  /** Memo / reference number printed on the circular. */
  reference: string | null;
  department: string;
  /** Management, Executive, Staff, Internship… */
  level: string | null;
  employmentType: string;
  location: string;
  vacancies: number | null;
  salary: string | null;
  experience: string | null;
  education: string | null;
  /** ISO date, the last day applications are taken. */
  deadline: string | null;
  summary: string;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  howToApply: string | null;
  /** Image URLs; the first is the cover. */
  images: string[];
  /** Buttons on the circular; the first is the main call to action. */
  links: JobLink[];
  /** Recruitment notices, newest first. */
  updates: JobUpdate[];
  /** The official circular as a PDF, and its file name. */
  circularUrl: string | null;
  circularName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  status: JobStatus;
  featured: boolean;
  /** Takes applications, with a CV, through the form on the circular. */
  applyOnline: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Applications received, for the admin list (not sent to the public). */
export type JobWithCounts = Job & { applicationCount?: number; newApplicationCount?: number };

export type CandidateStatus = "NEW" | "REVIEWING" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "HIRED" | "REJECTED";

/** The hiring pipeline, in order, with the admin badge colour of each stage. */
export const CANDIDATE_STAGES: { value: CandidateStatus; label: string; tone: "gray" | "blue" | "violet" | "amber" | "green" | "red" | "teal" }[] = [
  { value: "NEW", label: "New", tone: "amber" },
  { value: "REVIEWING", label: "Reviewing", tone: "gray" },
  { value: "SHORTLISTED", label: "Shortlisted", tone: "blue" },
  { value: "INTERVIEW", label: "Interview", tone: "violet" },
  { value: "OFFERED", label: "Offered", tone: "teal" },
  { value: "HIRED", label: "Hired", tone: "green" },
  { value: "REJECTED", label: "Not selected", tone: "red" },
];

/** A job application as the admin sees it (the CV itself is fetched on its own). */
export type Candidate = {
  id: string;
  jobId: string | null;
  jobTitle: string;
  jobSlug: string | null;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  currentPosition: string | null;
  experience: string | null;
  education: string | null;
  expectedSalary: string | null;
  noticePeriod: string | null;
  profileUrl: string | null;
  coverLetter: string | null;
  cvName: string;
  cvType: string;
  cvSize: number;
  status: CandidateStatus;
  rating: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** What an applicant can attach as a CV. */
export const CV_MAX_BYTES = 4 * 1024 * 1024;
export const CV_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Experience bands for the application form. */
export const EXPERIENCE_BANDS = ["Fresher", "Less than 1 year", "1–2 years", "3–5 years", "6–10 years", "More than 10 years"];

/** The job title on a CV sent without a particular vacancy. */
export const GENERAL_APPLICATION = "General application (future openings)";

/** Job levels, so a board can be read like a university's vacancy announcements. */
export const JOB_LEVELS = ["Management", "Executive / Officer", "Staff", "Internship / Trainee"] as const;

/** Addresses under /careers that are pages, never circulars. */
export const RESERVED_SLUGS = ["archive", "why-join-aven"];

/** Ready-made notice titles for the recruitment updates on a circular. */
export const UPDATE_PRESETS = ["Shortlisted candidates", "Written test schedule", "Interview schedule", "Final result", "Deadline extended", "Corrigendum"];

export const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"] as const;

/** Suggestions for the department field; any other name can be typed. */
export const DEPARTMENTS = [
  "Front Office & Guest Relations",
  "Food & Beverage",
  "Housekeeping",
  "Wellness & Spa",
  "Sales & Investor Relations",
  "Finance & Accounts",
  "Administration & HR",
  "Engineering & Maintenance",
  "Construction & Projects",
  "Landscape, Tea & Farm",
  "Security",
  "IT & Digital",
];

/** Ready-made button names for the links on a circular. */
export const LINK_PRESETS = ["Apply online", "Registration form", "Download circular", "Contact HR", "Send your CV"];

/** A text field written one point per line, as a list. Leading bullets are dropped. */
export function lines(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-•*·]|\d+[.)])\s*/, "").trim())
    .filter(Boolean);
}

/** A free-text field split into paragraphs at blank lines. */
export function paragraphs(text: string | null | undefined): string[] {
  return (text ?? "")
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const DAY = 86_400_000;

/** Bangladesh time, UTC+6: a deadline runs to the end of its day there, wherever the server is. */
const DHAKA_OFFSET = 6 * 3_600_000;

/** Whole days until the end of the deadline day: 0 on the day itself, negative once it has passed. */
export function daysLeft(deadline: string | null, now = Date.now()): number | null {
  if (!deadline) return null;
  const d = new Date(deadline);
  const end = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 23, 59, 59, 999) - DHAKA_OFFSET;
  return Math.floor((end - now) / DAY);
}

/** Open = published and not past its deadline. */
export function isOpen(job: Pick<Job, "status" | "deadline">, now = Date.now()) {
  if (job.status !== "PUBLISHED") return false;
  const left = daysLeft(job.deadline, now);
  return left === null || left >= 0;
}

/** "Closes today", "3 days left", "Closed". */
export function deadlineNote(job: Pick<Job, "status" | "deadline">, now = Date.now()) {
  if (job.status === "CLOSED") return "Closed";
  const left = daysLeft(job.deadline, now);
  if (left === null) return "Open until filled";
  if (left < 0) return "Closed";
  if (left === 0) return "Closes today";
  if (left === 1) return "Closes tomorrow";
  return `${left} days left`;
}

export function formatDeadline(deadline: string | null) {
  if (!deadline) return "Open until filled";
  // Deadlines are stored at noon UTC, so the UTC date is the day the admin picked.
  return new Date(deadline).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

/** When a circular went up, as a date in Bangladesh. */
export function formatPublished(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Dhaka" });
}

/** mailto:/tel: for bare addresses and numbers, so a link can be typed either way. */
export function hrefFor(url: string) {
  const u = url.trim();
  if (/^(https?:|mailto:|tel:|\/(?!\/))/i.test(u)) return u;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(u)) return `mailto:${u}`;
  if (/^\+?[\d\s-]{7,}$/.test(u)) return `tel:${u.replace(/[^\d+]/g, "")}`;
  return `https://${u}`;
}

export function isExternal(url: string) {
  return /^https?:/i.test(hrefFor(url));
}

/** The year a circular belongs to in the archive: when it was published, else when it closed. */
export function circularYear(job: Pick<Job, "publishedAt" | "deadline" | "createdAt">) {
  return new Date(job.publishedAt ?? job.deadline ?? job.createdAt).getUTCFullYear();
}

/** "Title — detail" lines from the Careers CMS section, as pairs. Also splits at " - " or ": ". */
export function pairs(text: string, sep: RegExp = /\s+[—–-]\s+|:\s+/) {
  return lines(text).map((l) => {
    const m = l.match(sep);
    return m && m.index ? { title: l.slice(0, m.index).trim(), detail: l.slice(m.index + m[0].length).trim() } : { title: l, detail: "" };
  });
}

/** "14 Oct 2026" — compact dates for tables and the archive. */
export function shortDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "Asia/Dhaka" });
}

/** Every notice across the board, newest first, with the circular it belongs to. */
export function latestUpdates(jobs: Job[], limit = 6) {
  return jobs
    .flatMap((job) => job.updates.map((u) => ({ ...u, job })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
}
