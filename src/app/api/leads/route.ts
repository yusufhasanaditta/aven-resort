import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { leadSchema, zodErrors } from "@/lib/validation";
import { readJson } from "@/lib/admin";

/**
 * Public "register your interest" endpoint. Every submission lands in the
 * admin CRM as a NEW lead. A repeat submission from the same email while an
 * earlier lead is still open is folded into that lead as a timeline note
 * rather than creating a duplicate.
 */
export async function POST(request: Request) {
  const body = await readJson<Record<string, unknown>>(request);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  // Honeypot — real visitors never fill this in.
  if (body.company) return NextResponse.json({ ok: true });

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;

  const existing = await prisma.lead.findFirst({
    where: { email: d.email, status: { notIn: ["CONVERTED", "CLOSED"] } },
    orderBy: { createdAt: "desc" },
  });

  const summary = [
    d.packageSlug && `Package: ${d.packageSlug}`,
    d.units && `Shares: ${d.units}`,
    d.investmentBDT && `Budget: ৳${d.investmentBDT.toLocaleString("en-US")}`,
    d.paymentPref && `Payment: ${d.paymentPref}`,
    d.message,
  ]
    .filter(Boolean)
    .join(" · ");

  if (existing) {
    await prisma.$transaction([
      prisma.lead.update({
        where: { id: existing.id },
        data: {
          phone: d.phone,
          packageSlug: d.packageSlug ?? existing.packageSlug,
          units: d.units ?? existing.units,
          investmentBDT: d.investmentBDT ?? existing.investmentBDT,
          paymentPref: d.paymentPref ?? existing.paymentPref,
        },
      }),
      prisma.leadNote.create({
        data: { leadId: existing.id, kind: "NOTE", body: `Submitted the form again. ${summary}`.trim(), authorName: "Website" },
      }),
    ]);
  } else {
    await prisma.lead.create({
      data: {
        name: d.name,
        email: d.email,
        phone: d.phone,
        location: d.location,
        packageSlug: d.packageSlug,
        units: d.units,
        investmentBDT: d.investmentBDT,
        paymentPref: d.paymentPref,
        message: d.message,
        source: d.source ?? "website",
      },
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Thank you — the Aven team has your details and will call you within one working day.",
  });
}
