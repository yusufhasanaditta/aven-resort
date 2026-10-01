import { prisma } from "@/lib/db";

/** Serves an image uploaded in the admin panel. Each upload gets a new id, so it can be cached forever. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await prisma.mediaFile.findUnique({ where: { id }, select: { data: true, mimeType: true } }).catch(() => null);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
