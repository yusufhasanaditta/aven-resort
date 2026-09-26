import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { leadUpdateSchema, zodErrors } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

const STAGE_LABEL: Record<string, string> = {
  NEW: "New",
  CONTACTED: "Contacted",
  INTERESTED: "Interested",
  FOLLOW_UP: "Follow-up",
  CONVERTED: "Converted",
  CLOSED: "Closed",
};

export async function GET(_: Request, { params }: Ctx) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { notes: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  return NextResponse.json({ lead });
}

/** Stage, follow-up date, owner and contact edits. Stage and follow-up changes write themselves to the timeline. */
export async function PATCH(request: Request, { params }: Ctx) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = leadUpdateSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const current = await prisma.lead.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const { nextFollowUpAt, ...rest } = parsed.data;
  let followUp: Date | null | undefined;
  if (nextFollowUpAt === null || nextFollowUpAt === "") followUp = null;
  else if (nextFollowUpAt) {
    followUp = new Date(nextFollowUpAt);
    if (Number.isNaN(followUp.getTime())) return NextResponse.json({ errors: { nextFollowUpAt: "Invalid date." } }, { status: 422 });
  }

  const timeline: string[] = [];
  if (rest.status && rest.status !== current.status) {
    timeline.push(`Stage: ${STAGE_LABEL[current.status]} → ${STAGE_LABEL[rest.status]}`);
  }
  if (followUp !== undefined && followUp?.getTime() !== current.nextFollowUpAt?.getTime()) {
    timeline.push(
      followUp
        ? `Follow-up set for ${followUp.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Dhaka" })}`
        : "Follow-up cleared",
    );
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...rest,
      ...(followUp !== undefined ? { nextFollowUpAt: followUp } : {}),
      ...(rest.status === "CONTACTED" ? { lastContactedAt: new Date() } : {}),
    },
  });

  if (timeline.length) {
    await prisma.leadNote.create({
      data: { leadId: id, kind: "STATUS", body: timeline.join(" · "), authorName: guard.name },
    });
    await logActivity(guard.name, "Updated lead", lead.name, timeline.join(" · "));
  }
  return NextResponse.json({ lead });
}

export async function DELETE(_: Request, { params }: Ctx) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const lead = await prisma.lead.delete({ where: { id } }).catch(() => null);
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  await logActivity(guard.name, "Deleted lead", lead.name);
  return NextResponse.json({ ok: true });
}
