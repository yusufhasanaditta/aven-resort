import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { candidateSelect, toCandidate } from "@/lib/careers-server";
import { CANDIDATE_STAGES } from "@/lib/careers";
import { candidateUpdateSchema, zodErrors } from "@/lib/validation";

/** Moves an application along the pipeline, rates it or saves the team's notes. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = candidateUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const before = await prisma.jobApplication.findUnique({ where: { id }, select: { status: true } });
  if (!before) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  const { rating, ...rest } = parsed.data;
  const row = await prisma.jobApplication.update({
    where: { id },
    data: { ...rest, ...(rating !== undefined && { rating: rating || null }) },
    select: candidateSelect,
  });
  if (rest.status && rest.status !== before.status && rest.status !== "REVIEWING") {
    const stage = CANDIDATE_STAGES.find((s) => s.value === rest.status)?.label ?? rest.status;
    await logActivity(guard.name, `Marked applicant ${stage.toLowerCase()}`, `${row.name} — ${row.jobTitle}`);
  }
  return NextResponse.json({ ok: true, candidate: toCandidate(row) });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const row = await prisma.jobApplication.delete({ where: { id }, select: { name: true, jobTitle: true } }).catch(() => null);
  if (!row) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  await logActivity(guard.name, "Deleted a job application", `${row.name} — ${row.jobTitle}`);
  return NextResponse.json({ ok: true });
}
