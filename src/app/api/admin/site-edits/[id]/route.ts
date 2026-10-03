import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson, revalidateSite } from "@/lib/admin";
import { reloadSiteEdits } from "@/lib/site-edits";

const valueOnly = z.object({ value: z.string().trim().max(20_000) });

/** Rewrites a text change from the admin list. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = valueOnly.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ error: "Write the new text." }, { status: 422 });

  const row = await prisma.siteEdit.findUnique({ where: { id } });
  if (!row) return NextResponse.json({ error: "That change no longer exists." }, { status: 404 });
  if (row.kind !== "text") return NextResponse.json({ error: "Replace images from the page editor." }, { status: 400 });

  if (parsed.data.value === row.original) await prisma.siteEdit.delete({ where: { id } });
  else await prisma.siteEdit.update({ where: { id }, data: { value: parsed.data.value, updatedBy: guard.name } });

  await reloadSiteEdits({ force: true });
  revalidateSite();
  await logActivity(guard.name, "Edited text", row.page ?? undefined, `“${row.original.slice(0, 80)}” → “${parsed.data.value.slice(0, 80)}”`);
  return NextResponse.json({ ok: true });
}

/** Removes a change: the original text or image comes back. */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const row = await prisma.siteEdit.delete({ where: { id } }).catch(() => null);
  if (!row) return NextResponse.json({ error: "That change no longer exists." }, { status: 404 });

  await reloadSiteEdits({ force: true });
  revalidateSite();
  await logActivity(guard.name, row.kind === "image" ? "Restored an image" : "Restored text", row.page ?? undefined, row.original.slice(0, 120));
  return NextResponse.json({ ok: true });
}
