import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CONTACT_REQUEST_SOURCE } from "@/lib/contact-requests";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { LEAD_STATUSES, leadSchema, zodErrors } from "@/lib/validation";
import type { Prisma } from "@prisma/client";

/** GET ?status=NEW&q=rahim&source=contact-request — the pipeline (or the contact requests), newest first. */
export async function GET(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const q = url.searchParams.get("q")?.trim();

  const where: Prisma.LeadWhereInput = {};
  if (status && (LEAD_STATUSES as readonly string[]).includes(status)) where.status = status as (typeof LEAD_STATUSES)[number];
  // Contact requests are listed on their own (?source=contact-request); the CRM shows the rest.
  const source = url.searchParams.get("source");
  where.source = source === CONTACT_REQUEST_SOURCE ? source : { not: CONTACT_REQUEST_SOURCE };
  if (q) where.OR = [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }];

  const leads = await prisma.lead.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    include: { _count: { select: { notes: true } } },
    take: 500,
  });
  return NextResponse.json({ leads });
}

/** A lead entered by the team — a walk-in, a phone call, a referral. */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const body = await readJson(request);
  const parsed = leadSchema.safeParse(body ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const lead = await prisma.lead.create({
    data: { ...parsed.data, source: parsed.data.source ?? "admin", assignedTo: guard.name },
  });
  await prisma.leadNote.create({
    data: { leadId: lead.id, kind: "NOTE", body: `Lead added by ${guard.name}.`, authorName: guard.name },
  });
  await logActivity(guard.name, "Added lead", lead.name);
  return NextResponse.json({ lead });
}
