import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson } from "@/lib/admin";
import { formatDate, holdingLedger, scheduleProblems } from "@/lib/account";
import { holdingInclude } from "@/lib/admin-serialize";
import { notify } from "@/lib/notify";
import { MAX_SCHEDULE_ROWS, discountProblem, formatBDT, parseSchedule, type ScheduleRow } from "@/lib/shares";
import { discountAmount, discountFields, zodErrors } from "@/lib/validation";

const scheduleRow = z.object({
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a due date."),
  amountBDT: z.coerce.number().int("Whole taka only.").min(1, "At least ৳1."),
  label: z.string().trim().min(1, "Give it a name.").max(60),
  added: z.string().datetime().optional(),
});

const schema = z.union([
  z.object({ status: z.enum(["ACTIVE", "PENDING_PAYMENT", "CANCELLED"]) }),
  z.object({ discountBDT: discountAmount, discountNote: discountFields.discountNote }),
  /** The installments the team set by hand (none is fine), or null to go back to the plan's standard ones. */
  z.object({ schedule: z.array(scheduleRow).max(MAX_SCHEDULE_ROWS).nullable() }),
]);

/**
 * Changes one holding:
 * - status   — cancel or reinstate; cancelling voids any payment in flight.
 * - discount — only before any money is in, since it changes the price.
 * - schedule — installments the team agreed by hand: when, and how much
 *   each. Any part of the price they don't cover stays an open balance.
 *   Money already paid stays where it is.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;

  const parsed = schema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });

  const holding = await prisma.shareHolding.findUnique({ where: { id }, include: holdingInclude });
  if (!holding) return NextResponse.json({ error: "Holding not found." }, { status: 404 });
  const who = holding.user.name;
  const what = `${holding.units} × ${holding.plan.name}`;

  if ("schedule" in parsed.data) {
    if (holding.status === "CANCELLED") return NextResponse.json({ error: "This holding is cancelled." }, { status: 409 });
    const rows = parsed.data.schedule as ScheduleRow[] | null;
    if (rows) {
      const ledger = holdingLedger(holding);
      const problems = scheduleProblems(rows, ledger);
      const first = Object.entries(problems.rows)[0];
      if (problems.form || first) {
        return NextResponse.json(
          { error: problems.form ?? `Payment ${Number(first[0]) + 1}: ${first[1]}`, rows: problems.rows },
          { status: 422 },
        );
      }
    }
    await prisma.shareHolding.update({ where: { id }, data: { scheduleJson: rows ? JSON.stringify(rows) : null } });

    const fresh = holdingLedger(await prisma.shareHolding.findUniqueOrThrow({ where: { id }, include: holdingInclude }));
    const next = fresh.nextDue;
    const count = fresh.steps.length;
    await notify(holding.user, {
      kind: "MESSAGE",
      title: count ? "Your installments have been updated" : "Pay any amount, any time",
      body: count
        ? `The Aven team has set ${count} installment${count > 1 ? "s" : ""} for your ${holding.plan.name} membership (${holding.units} shares).${
            next ? ` Next: ${formatBDT(next.amountBDT)}, due ${formatDate(next.dueDate)}.` : ""
          } You can still pay any amount at any time. Details are in your dashboard.`
        : `Your ${holding.plan.name} membership (${holding.units} shares) has no fixed installments: pay any amount, any time, until the ${formatBDT(fresh.remainingBDT)} balance is paid.`,
      href: "/account?tab=holdings",
      holdingId: id,
      dedupeKey: `schedule-${id}-${randomUUID().slice(0, 8)}`,
    }).catch(() => null);
    await logActivity(
      guard.name,
      rows ? "Changed installments" : "Reset installments",
      who,
      !rows
        ? `${what} · back to the standard plan`
        : rows.length
          ? `${what} · ${rows.length} installment${rows.length > 1 ? "s" : ""}, ${formatDate(fresh.steps[0].dueDate)} → ${formatDate(fresh.steps[rows.length - 1].dueDate)}`
          : `${what} · no installments — any amount, any time`,
    );
    return NextResponse.json({ ok: true });
  }

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
    const newTotal = listPriceBDT - discountBDT;
    const custom = parseSchedule(holding.scheduleJson);
    if (custom) {
      // Installments set by hand stay as agreed; the discount comes off the open balance.
      const set = custom.reduce((s, r) => s + r.amountBDT, 0);
      if (newTotal < 1 || newTotal < set) {
        return NextResponse.json(
          { errors: { discountBDT: `The installments already set come to ${formatBDT(set)} — lower or remove them first.` } },
          { status: 422 },
        );
      }
    } else {
      const steps = holding.paymentPlan === "INSTALLMENT" ? holding.installmentMonths ?? 1 : 1;
      const problem = discountProblem({ totalBDT: listPriceBDT, downPaymentBDT: holding.downPaymentBDT, installments: { length: steps } }, discountBDT);
      if (problem) return NextResponse.json({ errors: { discountBDT: problem } }, { status: 422 });
    }

    await prisma.shareHolding.update({
      where: { id },
      data: { totalAmountBDT: newTotal, discountBDT, discountNote: discountBDT ? discountNote || null : null },
    });
    await logActivity(
      guard.name,
      discountBDT ? "Gave a discount" : "Removed a discount",
      who,
      `${what} · ${formatBDT(listPriceBDT)} → ${formatBDT(newTotal)}${discountNote ? ` · ${discountNote}` : ""}`,
    );
    return NextResponse.json({ ok: true });
  }

  const { status } = parsed.data;
  await prisma.$transaction([
    prisma.shareHolding.update({ where: { id }, data: { status } }),
    ...(status === "CANCELLED" ? [prisma.payment.updateMany({ where: { holdingId: id, status: "PENDING" }, data: { status: "CANCELLED" } })] : []),
  ]);
  await logActivity(guard.name, status === "CANCELLED" ? "Cancelled holding" : "Updated holding", who, `${what} → ${status}`);
  return NextResponse.json({ ok: true });
}
