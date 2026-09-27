import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { applicationSchema, zodErrors } from "@/lib/validation";
import { calculate } from "@/lib/shares";
import { readJson } from "@/lib/admin";

/** The signed-in shareholder's own applications. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const applications = await prisma.application.findMany({
    where: { userId: session.sub },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}

/**
 * Submits a share-purchase application. The quoted total is computed here
 * with the same `calculate()` the calculator and order route use, so the
 * figure the admin approves is the figure the applicant saw.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in to apply." }, { status: 401 });

  const body = await readJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const d = parsed.data;

  const plans = await prisma.membershipPlan.findMany();
  if (!plans.length) return NextResponse.json({ error: "Plans are unavailable right now." }, { status: 503 });

  // The plan follows the share count, whatever package was ticked.
  const quote = calculate(plans, d.units, d.paymentPlan);

  const open = await prisma.application.count({
    where: { userId: session.sub, status: { in: ["SUBMITTED", "UNDER_REVIEW"] } },
  });
  if (open >= 3) {
    return NextResponse.json(
      { error: "You already have applications under review. The team will be in touch shortly." },
      { status: 409 },
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: session.sub,
      fullName: d.fullName,
      fatherName: d.fatherName,
      email: d.email,
      phone: d.phone,
      nid: d.nid,
      dateOfBirth: d.dateOfBirth,
      address: d.address,
      occupation: d.occupation,
      nomineeName: d.nomineeName,
      nomineeRelation: d.nomineeRelation,
      nomineePhone: d.nomineePhone,
      planSlug: quote.plan.slug,
      units: quote.units,
      paymentPlan: d.paymentPlan,
      // Monthly installments after the down payment, as quoted.
      installmentMonths: quote.monthlyCount,
      quotedTotalBDT: quote.totalBDT,
      notes: d.notes,
    },
  });

  return NextResponse.json({ ok: true, id: application.id });
}
