import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Enquiry endpoint.
 *
 * Validates the payload and persists it to the database, where the admin
 * panel's Inquiries tab reads it. Swap or add to the `deliver` call for a CRM
 * push or transactional email when the team is ready — the persistence and
 * the UI don't need to change.
 */

export type InquiryPayload = {
  type: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  /** Honeypot — real users never fill this. */
  company?: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: Partial<InquiryPayload>) {
  const errors: Record<string, string> = {};
  if (!body.name?.trim()) errors.name = "Please enter your full name.";
  if (!body.email?.trim()) errors.email = "Please enter your email address.";
  else if (!EMAIL.test(body.email)) errors.email = "That email doesn't look right.";
  if (!body.phone?.trim()) errors.phone = "Please enter a phone number.";
  if (!body.message?.trim()) errors.message = "Please tell us how we can help.";
  return errors;
}

async function deliver(payload: InquiryPayload) {
  await prisma.inquiry.create({
    data: {
      type: payload.type,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject || null,
      message: payload.message,
    },
  });
  // Add a CRM push or transactional email here when the team is ready —
  // persistence above already makes every enquiry visible in /admin.
}

export async function POST(request: Request) {
  let body: Partial<InquiryPayload>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Silently accept honeypot hits so bots don't learn anything.
  if (body.company) {
    return NextResponse.json({ ok: true });
  }

  const errors = validate(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  await deliver(body as InquiryPayload);

  return NextResponse.json({
    ok: true,
    message:
      "Thank you — your enquiry has reached the AVEN team. We reply within 24 hours.",
  });
}
