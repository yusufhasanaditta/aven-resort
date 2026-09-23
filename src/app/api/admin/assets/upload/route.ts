import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { requireAdmin } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

/**
 * Accepts an uploaded image and writes it under /public/uploads, returning
 * the URL to PATCH into a SiteAsset.
 *
 * This works for local development and any self-hosted/Node server
 * deployment. It will NOT persist on Vercel: serverless functions there run
 * on a read-only, ephemeral filesystem, so an uploaded file survives only
 * until that instance recycles. Before running the admin panel in production
 * on Vercel, swap this handler for `@vercel/blob`'s `put()` — same request
 * shape, three lines different — or point it at S3/Cloudinary.
 */
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  if (process.env.VERCEL) {
    return NextResponse.json(
      {
        error:
          "Image upload needs blob storage on Vercel (its filesystem is read-only and ephemeral). Connect Vercel Blob and update src/app/api/admin/assets/upload/route.ts — see the comment at the top of that file.",
      },
      { status: 501 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP or AVIF images are allowed." }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 8MB." }, { status: 413 });
  }

  const ext = file.type.split("/")[1];
  const filename = `${randomUUID()}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ ok: true, url: `/uploads/${filename}` });
}
