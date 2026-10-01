import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";
import { applicationSchema, zodErrors } from "@/lib/validation";
import { calculate } from "@/lib/shares";
import { readJson } from "@/lib/admin";

/** The signed-in shareholder's own applications. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const applications = await prisma.application.findMany({
    where: { userId: session.sub },
    omit: { passwordHash: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}

/**
 * Submits a share-purchase application — open to anyone, since accounts are
 * only opened by the Aven team: approving an application opens the
 * applicant's account. A signed-in shareholder's application is linked to
 * their account straight away. The quoted total is computed here with the
 * same `calculate()` the calculator uses, so the figure the admin approves
 * is the figure the applicant saw.
 */
export async function POST(request: Request) {
  const session = await getSession();

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
    where: {
      status: { in: ["SUBMITTED", "UNDER_REVIEW"] },
      OR: [{ email: d.email.toLowerCase() }, ...(session ? [{ userId: session.sub }] : [])],
    },
  });
  if (open >= 3) {
    return NextResponse.json(
      { error: "You already have applications under review. The team will be in touch shortly." },
      { status: 409 },
    );
  }

  const application = await prisma.application.create({
    data: {
      userId: session?.sub ?? null,
      fullName: d.fullName,
      fatherName: d.fatherName,
      email: d.email.toLowerCase(),
      phone: d.phone,
      nid: d.nid,
      dateOfBirth: d.dateOfBirth,
      address: d.address,
      occupation: d.occupation,
      nomineeName: d.nomineeName,
      nomineeRelation: d.nomineeRelation,
      nomineePhone: d.nomineePhone,
      referredBy: d.referredBy,
      // A signed-in shareholder already has a password.
      passwordHash: d.password && !session ? await hashPassword(d.password) : null,
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
