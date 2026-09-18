import { NextResponse } from "next/server";

/**
 * Enquiry endpoint.
 *
 * Deliberately a stub: the site ships frontend-only, so this validates the
 * payload and logs it. Swap the `deliver` call for a CRM push or transactional
 * email when the team is ready — nothing in the UI needs to change.
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
  // Replace with your CRM or email provider.
  console.info("[aven] enquiry received", {
    type: payload.type,
    subject: payload.subject,
    email: payload.email,
    at: new Date().toISOString(),
  });
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
