import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { calculate } from "@/lib/shares";
import { convertLeadsFor } from "@/lib/crm";
import { zodErrors } from "@/lib/validation";

const actionSchema = z.object({
  action: z.enum(["review", "approve", "reject"]),
  adminNote: z.string().trim().max(1000).optional(),
});

/**
 * review  → UNDER_REVIEW
 * approve → creates the ShareHolding (awaiting its first payment) with the
 *           applicant's installment plan, links it, and converts their lead
 * reject  → REJECTED, with the reason kept on the application
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = actionSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { action, adminNote } = parsed.data;

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
    const updated = await prisma.application.update({ where: { id }, data: { status: "REJECTED", ...reviewed } });
    await logActivity(guard.name, "Rejected application", app.fullName, adminNote);
    return NextResponse.json({ application: updated });
  }

  const plans = await prisma.membershipPlan.findMany();
  const quote = calculate(plans, app.units, app.paymentPlan);

  const [holding] = await prisma.$transaction(async (tx) => {
    const h = await tx.shareHolding.create({
      data: {
        userId: app.userId,
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
      data: { status: "APPROVED", holdingId: h.id, ...reviewed },
    });
    return [h];
  });

  await convertLeadsFor(app.email, `application approved for ${quote.units} ${quote.plan.name} share(s)`);
  await logActivity(
    guard.name,
    "Approved application",
    app.fullName,
    `${quote.units} × ${quote.plan.name} · ৳${quote.totalBDT.toLocaleString("en-US")}`,
  );
  return NextResponse.json({ ok: true, holdingId: holding.id });
}
