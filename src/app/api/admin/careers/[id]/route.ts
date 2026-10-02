import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson, revalidateSite } from "@/lib/admin";
import { toJob } from "@/lib/careers-server";
import { jobPostSchema, zodErrors } from "@/lib/validation";

const statusOnly = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]) });

const statusAction = { DRAFT: "Unpublished job circular", PUBLISHED: "Published job circular", CLOSED: "Closed job circular" } as const;

/**
 * Saves a circular. A body with only `status` publishes, unpublishes or closes
 * it; anything else is the whole circular from the editor. The web address
 * stays the same after the first save, so shared links keep working.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const existing = await prisma.jobPost.findUnique({ where: { id }, select: { status: true, publishedAt: true, title: true } });
  if (!existing) return NextResponse.json({ error: "Circular not found." }, { status: 404 });

  const body = await readJson<Record<string, unknown>>(request);
  const quick = body && Object.keys(body).length === 1 ? statusOnly.safeParse(body) : null;
  const full = quick?.success ? null : jobPostSchema.safeParse(body);
  if (full && !full.success) return NextResponse.json({ errors: zodErrors(full.error) }, { status: 422 });

  const status = quick?.success ? quick.data.status : full!.data!.status;
  // First publication date is kept, so re-publishing doesn't bump an old circular to the top.
  const publishedAt = status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt;

  let data;
  if (quick?.success) {
    data = { status, publishedAt };
  } else {
    const { images, links, updates, ...d } = full!.data!;
    data = { ...d, images: JSON.stringify(images), links: JSON.stringify(links), updates: JSON.stringify(updates), publishedAt };
  }

  const row = await prisma.jobPost.update({ where: { id }, data });
  revalidateSite();
  await logActivity(guard.name, status !== existing.status ? statusAction[status] : "Edited job circular", row.title);
  return NextResponse.json({ ok: true, job: toJob(row) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const row = await prisma.jobPost.delete({ where: { id }, select: { title: true } }).catch(() => null);
  if (!row) return NextResponse.json({ error: "Circular not found." }, { status: 404 });
  revalidateSite();
  await logActivity(guard.name, "Deleted job circular", row.title);
  return NextResponse.json({ ok: true });
}
