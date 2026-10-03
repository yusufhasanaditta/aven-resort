import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getContent } from "@/lib/cms";
import { sniffCv, toJob } from "@/lib/careers-server";
import { CV_MAX_BYTES, GENERAL_APPLICATION, isOpen } from "@/lib/careers";
import { emailHtml, sendEmail, siteUrl } from "@/lib/mailer";
import { jobApplicationSchema, zodErrors } from "@/lib/validation";

/** At most this many applications from one address in a quarter of an hour. */
const BURST = { max: 6, windowMs: 15 * 60 * 1000 };

declare global {
  var __avenApplyHits: Map<string, number[]> | undefined;
}

function tooMany(ip: string) {
  const hits = (globalThis.__avenApplyHits ??= new Map<string, number[]>());
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < BURST.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > BURST.max;
}

/**
 * A job application from the website: the form's fields and a CV (PDF or
 * Word, up to 4 MB). Without a jobId it is a CV sent for future openings.
 * The CV is stored with the application, never in the public media library.
 * The applicant gets a confirmation email and HR a notice, when email is set up.
 */
export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Please fill in the form again." }, { status: 400 });

  // Honeypot — real visitors never fill this in.
  if (form.get("company")) return NextResponse.json({ ok: true, reference: "received" });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return NextResponse.json({ error: "Too many applications from this connection. Please try again in a few minutes." }, { status: 429 });

  const fields = Object.fromEntries([...form.entries()].filter((e): e is [string, string] => typeof e[1] === "string"));
  const parsed = jobApplicationSchema.safeParse(fields);
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { jobId, ...rest } = parsed.data;
  const { consent, ...d } = rest;
  void consent;

  const file = form.get("cv");
  if (!(file instanceof File) || file.size === 0) return NextResponse.json({ errors: { cv: "Attach your CV." } }, { status: 422 });
  if (file.size > CV_MAX_BYTES) return NextResponse.json({ errors: { cv: "Your CV must be under 4 MB." } }, { status: 413 });
  const bytes = Buffer.from(await file.arrayBuffer());
  const kind = sniffCv(bytes, file.name);
  if (!kind) return NextResponse.json({ errors: { cv: "Upload your CV as a PDF or Word file (.pdf, .docx or .doc)." } }, { status: 415 });

  let jobTitle = GENERAL_APPLICATION;
  if (jobId) {
    const row = await prisma.jobPost.findUnique({ where: { id: jobId } });
    if (!row || row.status !== "PUBLISHED" || !row.applyOnline || !isOpen(toJob(row))) {
      return NextResponse.json({ error: "This position is no longer taking applications online." }, { status: 410 });
    }
    jobTitle = row.title;
  }

  const already = await prisma.jobApplication.findFirst({ where: { email: d.email, jobId }, select: { id: true } });
  if (already) {
    return NextResponse.json(
      { errors: { email: jobId ? "You have already applied for this position with this email — we have your CV." : "We already have a CV from this email. Thank you!" } },
      { status: 409 },
    );
  }

  const cvName = `${d.name.replace(/[^\w .()-]/g, "").trim().slice(0, 60) || "CV"} — CV.${kind.ext}`;
  const app = await prisma.jobApplication.create({
    data: { ...d, jobId, jobTitle, cvName, cvType: kind.type, cvSize: file.size, cvData: bytes },
    select: { id: true },
  });
  const reference = app.id.slice(-8).toUpperCase();

  const careers = await getContent("careers");
  const footer = "You receive this because you applied for a job at Aven Eco Luxury Resort & Wellness.";
  await Promise.allSettled([
    sendEmail({
      to: d.email,
      subject: `We received your application — ${jobTitle}`,
      text: `Dear ${d.name},\n\nThank you for applying for ${jobTitle} at Aven Eco Luxury Resort & Wellness. Your application reference is ${reference}.\n\nOur HR team reviews every application. If you are shortlisted, we will contact you by phone or email. Updates are also posted on the circular.\n\nAven never asks for money at any stage of recruitment.`,
      html: emailHtml({
        title: "Application received",
        body: `Dear ${d.name},\nThank you for applying for ${jobTitle} at Aven Eco Luxury Resort & Wellness. Your application reference is ${reference}.\nOur HR team reviews every application. If you are shortlisted, we will contact you by phone or email. Updates are also posted on the circular.\nAven never asks for money at any stage of recruitment.`,
        cta: { label: "See our careers page", href: `${siteUrl()}/careers` },
        footer,
      }),
    }),
    careers.hrEmail &&
      sendEmail({
        to: careers.hrEmail,
        subject: `New application: ${d.name} — ${jobTitle}`,
        text: `${d.name} (${d.email}, ${d.phone}) applied for ${jobTitle}. Reference ${reference}. Open admin → Careers → Applications to read it and download the CV.`,
        html: emailHtml({
          title: "New job application",
          body: `${d.name} applied for ${jobTitle}.\nEmail: ${d.email} · Phone: ${d.phone}${d.currentPosition ? `\nCurrently: ${d.currentPosition}` : ""}${d.experience ? `\nExperience: ${d.experience}` : ""}\nReference ${reference}.`,
          cta: { label: "Open the application", href: `${siteUrl()}/admin?tab=careers` },
          footer: "You receive this because your address is the HR email on the Aven Careers page.",
        }),
      }),
  ]);

  return NextResponse.json({ ok: true, reference });
}
