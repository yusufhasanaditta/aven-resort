import { prisma } from "@/lib/db";

/** Serves an image (or a job circular PDF) uploaded in the admin panel. Each upload gets a new id, so it can be cached forever. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await prisma.mediaFile.findUnique({ where: { id }, select: { data: true, mimeType: true, filename: true } }).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // PDFs open in the browser's viewer and save under their own name.
      ...(file.mimeType === "application/pdf" && {
        "Content-Disposition": `inline; filename="${file.filename.replace(/^circular-/, "").replace(/"/g, "")}"`,
      }),
    },
  });
}
