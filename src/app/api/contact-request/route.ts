import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { readJson } from "@/lib/admin";
import { contactRequestSchema, zodErrors } from "@/lib/validation";
import { CONTACT_REQUEST_SOURCE } from "@/lib/contact-requests";

/**
 * "Contact me for more information" from the Apply now chooser: just a name,
 * phone and email. Each one is kept as its own record (a lead with its own
 * source) so the admin Contact requests list shows every request as it came in.
 */
export async function POST(request: Request) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  // Honeypot — real visitors never fill this in.
  if (body.company) return NextResponse.json({ ok: true });

  const parsed = contactRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;

  await prisma.lead.create({
    data: { name: d.name, phone: d.phone, email: d.email, message: d.message, source: CONTACT_REQUEST_SOURCE },
  });
  return NextResponse.json({ ok: true });
}
