import "server-only";
import type { JobPost } from "@prisma/client";
import { prisma } from "@/lib/db";
import { RESERVED_SLUGS, type Job, type JobLink, type JobUpdate } from "@/lib/careers";

function parseList<T>(raw: string, keep: (v: unknown) => v is T): T[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(keep) : [];
  } catch {
    return [];
  }
}

const isUrl = (v: unknown): v is string => typeof v === "string" && v.length > 0;
const isLink = (v: unknown): v is JobLink =>
  !!v && typeof v === "object" && typeof (v as JobLink).label === "string" && typeof (v as JobLink).url === "string";
const isUpdate = (v: unknown): v is JobUpdate =>
  !!v && typeof v === "object" && typeof (v as JobUpdate).date === "string" && typeof (v as JobUpdate).title === "string";

export function toJob(row: JobPost): Job {
  return {
    ...row,
    deadline: row.deadline?.toISOString() ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    images: parseList(row.images, isUrl),
    links: parseList(row.links, isLink),
    updates: parseList(row.updates, isUpdate)
      .map((u) => ({ date: u.date, title: u.title, body: u.body ?? "", url: u.url ?? "" }))
      .sort((a, b) => b.date.localeCompare(a.date)),
  };
}

/**
 * Circulars the public can see: published ones (open or past their deadline)
 * and closed ones, featured first, then newest. Any database failure gives an
 * empty board rather than a broken page.
 */
export async function getPublicJobs(): Promise<Job[]> {
  try {
    const rows = await prisma.jobPost.findMany({
      where: { status: { in: ["PUBLISHED", "CLOSED"] } },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    });
    return rows.map(toJob);
  } catch {
    return [];
  }
}

/** One circular by its address; drafts only for the admin's preview. */
export async function getJob(slug: string, { includeDrafts = false } = {}): Promise<Job | null> {
  try {
    const row = await prisma.jobPost.findUnique({ where: { slug } });
    if (!row || (row.status === "DRAFT" && !includeDrafts)) return null;
    return toJob(row);
  } catch {
    return null;
  }
}

/** "Front Desk Officer" → "front-desk-officer", made unique with -2, -3… */
export async function uniqueSlug(title: string, exceptId?: string) {
  const base =
    title
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-")
      .slice(0, 70)
      .replace(/-+$/, "") || "job";
  for (let n = 1; ; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    const taken = await prisma.jobPost.findUnique({ where: { slug }, select: { id: true } });
    if (RESERVED_SLUGS.includes(slug)) continue;
    if (!taken || taken.id === exceptId) return slug;
  }
}

/** The moment this request is rendered, which deadlines are counted from (pages are rendered per visit). */
export function requestTime() {
  return Date.now();
}
