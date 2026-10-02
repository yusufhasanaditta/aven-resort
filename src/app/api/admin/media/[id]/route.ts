import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity } from "@/lib/admin";

/** Deletes an uploaded file — refused while any page or content section still shows it. */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const url = `/media/${id}`;

  const [inSlot, inContent, asPhoto, inJob] = await Promise.all([
    prisma.siteAsset.count({ where: { url } }),
    prisma.siteContent.count({ where: { value: { contains: url } } }),
    prisma.user.count({ where: { photoUrl: url } }),
    prisma.jobPost.count({ where: { OR: [{ images: { contains: `"${url}"` } }, { circularUrl: url }] } }),
  ]);
  if (inSlot || inContent || asPhoto || inJob) {
    return NextResponse.json({ error: "This image is still used on the website. Replace it there first, then delete it." }, { status: 409 });
  }
  const file = await prisma.mediaFile.delete({ where: { id }, select: { filename: true } }).catch(() => null);
  if (!file) return NextResponse.json({ error: "File not found." }, { status: 404 });
  await logActivity(guard.name, "Deleted image", file.filename);
  return NextResponse.json({ ok: true });
}
