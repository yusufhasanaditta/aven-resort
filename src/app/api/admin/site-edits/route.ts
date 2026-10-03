import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson, revalidateSite } from "@/lib/admin";
import { editHash, reloadSiteEdits } from "@/lib/site-edits";
import { siteEditSchema, zodErrors } from "@/lib/validation";

/** Every page-editor change, newest first. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const rows = await prisma.siteEdit.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({
    edits: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString(), updatedAt: r.updatedAt.toISOString() })),
  });
}

/**
 * Saves one change from the page editor: this text (or image) becomes that,
 * everywhere it appears. Saving the original back — or empty for an image —
 * removes the change. Answers with the new set of edits for the editor.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const parsed = siteEditSchema.safeParse(await readJson(request));
  if (!parsed.success) return NextResponse.json({ errors: zodErrors(parsed.error) }, { status: 422 });
  const { kind, original, value, page } = parsed.data;
  const hash = editHash(kind, original);
  const restore = value === original || (kind === "image" && !value);

  if (restore) {
    await prisma.siteEdit.deleteMany({ where: { hash } });
  } else {
    await prisma.siteEdit.upsert({
      where: { hash },
      create: { hash, kind, original, value, page: page || null, updatedBy: guard.name },
      update: { value, page: page || undefined, updatedBy: guard.name },
    });
  }

  const map = await reloadSiteEdits({ force: true });
  revalidateSite();
  await logActivity(
    guard.name,
    restore ? (kind === "image" ? "Restored an image" : "Restored text") : kind === "image" ? "Replaced an image" : "Edited text",
    page || undefined,
    kind === "text" ? `“${original.slice(0, 80)}” → “${value.slice(0, 80)}”` : `${original} → ${value || "original"}`,
  );
  return NextResponse.json({ ok: true, restored: restore, map });
}
