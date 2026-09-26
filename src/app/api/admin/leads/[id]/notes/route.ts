import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, readJson } from "@/lib/admin";
import { leadNoteSchema, zodErrors } from "@/lib/validation";

/** Adds a note, or logs a call / email / meeting / WhatsApp / site visit. Contact kinds stamp "last contacted". */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = leadNoteSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const lead = await prisma.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: "Lead not found." }, { status: 404 });

  const isContact = parsed.data.kind !== "NOTE";
  const [note] = await prisma.$transaction([
    prisma.leadNote.create({ data: { leadId: id, ...parsed.data, authorName: guard.name } }),
    prisma.lead.update({
      where: { id },
      data: {
        ...(isContact ? { lastContactedAt: new Date() } : {}),
        // First real contact moves a brand-new lead along the pipeline on its own.
        ...(isContact && lead.status === "NEW" ? { status: "CONTACTED" as const } : {}),
      },
    }),
  ]);
  return NextResponse.json({ note });
}
