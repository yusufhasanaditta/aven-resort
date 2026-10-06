import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { discountProblem, formatBDT } from "@/lib/shares";
import { discountAmount, discountFields, zodErrors } from "@/lib/validation";

const schema = z.union([
  z.object({ status: z.enum(["ACTIVE", "PENDING_PAYMENT", "CANCELLED"]) }),
  z.object({ discountBDT: discountAmount, discountNote: discountFields.discountNote }),
]);

/**
 * Cancel or reinstate a holding — cancelling also voids any payment still in
 * flight on it — or change its office discount. A discount can only change
 * before any money is in: it re-splits the installments, and paid ones are
 * already on receipts.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const holding = await prisma.shareHolding.findUnique({ where: { id }, include: { user: true, plan: true, payments: true } });
  if (!holding) return NextResponse.json({ error: "Holding not found." }, { status: 404 });

  if ("discountBDT" in parsed.data) {
    const { discountBDT, discountNote } = parsed.data;
    if (holding.status === "CANCELLED") return NextResponse.json({ error: "This holding is cancelled." }, { status: 409 });
    if (holding.payments.some((p) => p.status === "SUCCESS" || p.status === "PENDING")) {
      return NextResponse.json(
        { errors: { discountBDT: "A payment has already been made on this holding, so its price can't change any more." } },
        { status: 409 },
      );
    }
    // Always worked out from the chart price, so changing a discount never stacks on the old one.
    const listPriceBDT = holding.totalAmountBDT + holding.discountBDT;
    const steps = holding.paymentPlan === "INSTALLMENT" ? holding.installmentMonths ?? 1 : 1;
    const problem = discountProblem({ totalBDT: listPriceBDT, downPaymentBDT: holding.downPaymentBDT, installments: { length: steps } }, discountBDT);
    if (problem) return NextResponse.json({ errors: { discountBDT: problem } }, { status: 422 });

    await prisma.shareHolding.update({
      where: { id },
      data: { totalAmountBDT: listPriceBDT - discountBDT, discountBDT, discountNote: discountBDT ? discountNote || null : null },
    });
    await logActivity(
      guard.name,
      discountBDT ? "Gave a discount" : "Removed a discount",
      holding.user.name,
      `${holding.units} × ${holding.plan.name} · ${formatBDT(listPriceBDT)} → ${formatBDT(listPriceBDT - discountBDT)}${discountNote ? ` · ${discountNote}` : ""}`,
    );
    return NextResponse.json({ ok: true });
  }

  const { status } = parsed.data;
  await prisma.$transaction([
    prisma.shareHolding.update({ where: { id }, data: { status } }),
    ...(status === "CANCELLED" ? [prisma.payment.updateMany({ where: { holdingId: id, status: "PENDING" }, data: { status: "CANCELLED" } })] : []),
  ]);
  await logActivity(
    guard.name,
    status === "CANCELLED" ? "Cancelled holding" : "Updated holding",
    holding.user.name,
    `${holding.units} × ${holding.plan.name} → ${status}`,
  );
  return NextResponse.json({ ok: true });
}
