import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity } from "@/lib/admin";

// Vercel caps a request body at 4.5 MB.
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Saves a job circular's PDF into the database and returns its URL,
 * /media/<id>. Stored as "circular-…" so the Media library (images only)
 * leaves it out.
 */
export async function POST(request: Request) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;

  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided." }, { status: 400 });
  const bytes = Buffer.from(await file.arrayBuffer());
  // Checked by content, not just the browser's label: a PDF starts with "%PDF".
  if (file.type !== "application/pdf" || bytes.subarray(0, 4).toString() !== "%PDF") {
    return NextResponse.json({ error: "The circular must be a PDF file." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "The PDF must be under 4 MB." }, { status: 413 });

  const name = file.name.replace(/[^\w.\- ()]/g, "").slice(0, 150) || "circular.pdf";
  const media = await prisma.mediaFile.create({
    data: { filename: `circular-${name}`, mimeType: "application/pdf", size: file.size, data: bytes, uploadedBy: guard.name },
    select: { id: true },
  });
  await logActivity(guard.name, "Uploaded circular PDF", name);
  return NextResponse.json({ ok: true, url: `/media/${media.id}`, name });
}
