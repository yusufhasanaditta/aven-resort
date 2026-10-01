import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { logActivity } from "@/lib/admin";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
// Vercel caps a request body at 4.5 MB; the admin panel shrinks larger photos before sending.
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Saves an uploaded image into the database (MediaFile) and returns its
 * public URL, /media/<id>. Kept in the database rather than on disk so it
 * works the same locally and on Vercel, whose filesystem is read-only.
 */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, AVIF or GIF images are allowed." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 4 MB." }, { status: 413 });
  }

  const media = await prisma.mediaFile.create({
    data: {
      filename: file.name.slice(0, 200) || "image",
      mimeType: file.type,
      size: file.size,
      data: Buffer.from(await file.arrayBuffer()),
      uploadedBy: admin.name,
    },
    select: { id: true },
  });
  await logActivity(admin.name, "Uploaded image", file.name.slice(0, 120));
  return NextResponse.json({ ok: true, id: media.id, url: `/media/${media.id}` });
}
