import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity, readJson, revalidateSite } from "@/lib/admin";
import { mediaSlot, mediaSlots } from "@/data/media-slots";

/** Every replaceable website image (with what it currently shows) and every uploaded file. */
export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const [rows, files] = await Promise.all([
    prisma.siteAsset.findMany(),
    prisma.mediaFile.findMany({ where: { NOT: [{ filename: { startsWith: "profile-" } }, { filename: { startsWith: "circular-" } }] }, orderBy: { createdAt: "desc" }, select: { id: true, filename: true, mimeType: true, size: true, uploadedBy: true, createdAt: true } }),
  ]);
  const slots = mediaSlots.map((s) => {
    const row = rows.find((r) => r.key === s.key);
    const custom = !!row && row.url !== s.fallback;
    return { ...s, url: custom ? row!.url : s.fallback, custom, updatedAt: row?.updatedAt.toISOString() ?? null };
  });
  return NextResponse.json({
    slots,
    files: files.map((f) => ({ ...f, url: `/media/${f.id}`, createdAt: f.createdAt.toISOString() })),
  });
}

/** Points a website image at a new URL (usually a fresh upload). */
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await readJson<{ key?: unknown; url?: unknown }>(request);
  const key = typeof body?.key === "string" ? body.key : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const slot = mediaSlot(key);
  if (!slot) return NextResponse.json({ error: "Unknown image." }, { status: 404 });
  if (!/^(\/|https:\/\/)/.test(url)) return NextResponse.json({ error: "Use an uploaded image or an https:// link." }, { status: 422 });

  await prisma.siteAsset.upsert({ where: { key }, update: { url, label: slot.label }, create: { key, url, label: slot.label } });
  revalidateSite();
  await logActivity(admin.name, "Replaced image", slot.label);
  return NextResponse.json({ ok: true });
}

/** `?key=` — puts a website image back to the original render. */
export async function DELETE(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  const key = new URL(request.url).searchParams.get("key") ?? "";
  const slot = mediaSlot(key);
  if (!slot) return NextResponse.json({ error: "Unknown image." }, { status: 404 });
  await prisma.siteAsset.deleteMany({ where: { key } });
  revalidateSite();
  await logActivity(admin.name, "Restored original image", slot.label);
  return NextResponse.json({ ok: true });
}
