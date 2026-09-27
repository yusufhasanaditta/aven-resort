import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson, revalidateSite } from "@/lib/admin";
import { zodErrors } from "@/lib/validation";

export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const plans = await prisma.membershipPlan.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { holdings: true } } },
  });
  return NextResponse.json({ plans });
}

const planSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().trim().min(2).max(40).optional(),
    subtitle: z.string().trim().max(120).optional(),
    unitPriceBDT: z.coerce.number().int().min(1).max(1_000_000_000).optional(),
    freeStayNights: z.coerce.number().int().min(0).max(365).optional(),
    fullPriceBDT: z.coerce.number().int().min(1).max(1_000_000_000).optional(),
    downPaymentBDT: z.coerce.number().int().min(0).max(10_000_000_000).optional(),
    installmentCount: z.coerce.number().int().min(1).max(60).optional(),
    minUnits: z.coerce.number().int().min(1).max(2700).optional(),
    maxUnits: z.coerce.number().int().min(1).max(2700).nullable().optional(),
    accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #0E4D38.").optional(),
    featured: z.boolean().optional(),
  })
  .refine((p) => p.maxUnits == null || p.minUnits == null || p.maxUnits >= p.minUnits, {
    message: "Max shares must be at least min shares.",
    path: ["maxUnits"],
  });

/** Edits one package. Only affects new purchases — existing holdings keep the price they were bought at. */
export async function PATCH(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = planSchema.safeParse((await readJson(request)) ?? {});
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { id, ...data } = parsed.data;

  const plan = await prisma.membershipPlan.update({ where: { id }, data }).catch(() => null);
  if (!plan) return NextResponse.json({ error: "Plan not found." }, { status: 404 });

  revalidateSite();
  await logActivity(guard.name, "Edited package", plan.name, Object.keys(data).join(", "));
  return NextResponse.json({ ok: true, plan });
}
