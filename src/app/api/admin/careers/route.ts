import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson, revalidateSite } from "@/lib/admin";
import { toJob, uniqueSlug } from "@/lib/careers-server";
import { jobPostSchema, zodErrors } from "@/lib/validation";

/** Every circular, drafts included, newest first, with how many applications each has had. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const [rows, counts] = await Promise.all([
    prisma.jobPost.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.jobApplication.groupBy({ by: ["jobId", "status"], _count: { _all: true } }),
  ]);
  const tally = (jobId: string | null, status?: string) =>
    counts.filter((c) => c.jobId === jobId && (!status || c.status === status)).reduce((n, c) => n + c._count._all, 0);
  return NextResponse.json({
    jobs: rows.map((r) => ({ ...toJob(r), applicationCount: tally(r.id), newApplicationCount: tally(r.id, "NEW") })),
    general: { applicationCount: tally(null), newApplicationCount: tally(null, "NEW") },
  });
}

/** Creates a circular; its web address comes from the title. */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = jobPostSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { images, links, updates, ...d } = parsed.data;

  const row = await prisma.jobPost.create({
    data: {
      ...d,
      slug: await uniqueSlug(d.title),
      images: JSON.stringify(images),
      links: JSON.stringify(links),
      updates: JSON.stringify(updates),
      publishedAt: d.status === "PUBLISHED" ? new Date() : null,
      createdBy: guard.name,
    },
  });
  revalidateSite();
  await logActivity(guard.name, d.status === "PUBLISHED" ? "Published job circular" : "Drafted job circular", d.title);
  return NextResponse.json({ ok: true, job: toJob(row) });
}
