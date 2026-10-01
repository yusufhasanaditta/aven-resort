import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { calculate } from "@/lib/shares";
import { convertLeadsFor } from "@/lib/crm";
import { registerSchema, zodErrors } from "@/lib/validation";
import { nextShareNumbers, openAccount, sendWelcome } from "@/lib/member";

const actionSchema = z.object({
  action: z.enum(["review", "approve", "reject"]),
  adminNote: z.string().trim().max(1000).optional(),
  /** On approve: a password the admin gives the new shareholder (they can change it later). */
  password: registerSchema.shape.password.optional().or(z.literal("")),
});

/**
 * review  → UNDER_REVIEW
 * approve → opens the applicant's account if they have none (membership
 *           number + one-time password), creates the ShareHolding (awaiting
 *           its first payment) with their installment plan, and converts their lead
 * reject  → REJECTED, with the reason kept on the application
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = actionSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { action, adminNote, password } = parsed.data;

  const app = await prisma.application.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (app.status === "APPROVED" || app.status === "REJECTED") {
    return NextResponse.json({ error: `This application was already ${app.status.toLowerCase()}.` }, { status: 409 });
  }

  const reviewed = { reviewedBy: guard.name, reviewedAt: new Date(), adminNote: adminNote ?? app.adminNote };

  if (action === "review") {
    const updated = await prisma.application.update({ where: { id }, data: { status: "UNDER_REVIEW", ...reviewed } });
    await logActivity(guard.name, "Started review", app.fullName);
    return NextResponse.json({ application: updated });
  }

  if (action === "reject") {
    const updated = await prisma.application.update({ where: { id }, data: { status: "REJECTED", passwordHash: null, ...reviewed } });
    await logActivity(guard.name, "Rejected application", app.fullName, adminNote);
    return NextResponse.json({ application: updated });
  }

  const plans = await prisma.membershipPlan.findMany();
  const quote = calculate(plans, app.units, app.paymentPlan);

  const kyc = {
    nid: app.nid,
    nomineeName: app.nomineeName,
    nomineeRelation: app.nomineeRelation,
    referredBy: app.referredBy,
  };

  // Link the applicant's account, or open one with the next membership number.
  // Its password is the one the admin types now, else the one the applicant
  // chose on the form, else a one-time password the admin passes on.
  let userId = app.userId;
  let opened: { memberNo: string; oneTimePassword: string | null } | null = null;
  if (!userId) {
    const existing = await prisma.user.findUnique({ where: { email: app.email.toLowerCase() } });
    if (existing) userId = existing.id;
    else {
      const account = await openAccount(
        { name: app.fullName, email: app.email, phone: app.phone, location: app.address.slice(0, 160), ...kyc },
        password || (app.passwordHash ? { hash: app.passwordHash } : undefined),
      );
      userId = account.id;
      opened = account;
      await sendWelcome({ name: app.fullName, email: app.email, memberNo: account.memberNo }, account.oneTimePassword);
    }
  }
  const ownerId = userId;

  // An existing account keeps its details; only blanks are filled from the application.
  if (!opened) {
    const owner = await prisma.user.findUnique({ where: { id: ownerId } });
    const blanks = Object.fromEntries(Object.entries(kyc).filter(([k, v]) => v && !owner?.[k as keyof typeof kyc]));
    if (Object.keys(blanks).length) await prisma.user.update({ where: { id: ownerId }, data: blanks });
  }

  const [holding] = await prisma.$transaction(async (tx) => {
    const h = await tx.shareHolding.create({
      data: {
        ...(await nextShareNumbers(tx, quote.units)),
        userId: ownerId,
        planId: quote.plan.id,
        units: quote.units,
        totalAmountBDT: quote.totalBDT,
        paymentPlan: app.paymentPlan,
        installmentMonths: quote.installments ? quote.installments.length : null,
        downPaymentBDT: quote.downPaymentBDT,
      },
    });
    await tx.application.update({
      where: { id },
      data: { status: "APPROVED", holdingId: h.id, userId: ownerId, passwordHash: null, ...reviewed },
    });
    return [h];
  });

  await convertLeadsFor(app.email, `application approved for ${quote.units} ${quote.plan.name} share(s)`);
  await logActivity(
    guard.name,
    "Approved application",
    app.fullName,
    `${quote.units} × ${quote.plan.name} · ৳${quote.totalBDT.toLocaleString("en-US")}${opened ? ` · account ${opened.memberNo} opened` : ""}`,
  );
  return NextResponse.json({ ok: true, holdingId: holding.id, memberNo: opened?.memberNo ?? null, oneTimePassword: opened?.oneTimePassword ?? null });
}
