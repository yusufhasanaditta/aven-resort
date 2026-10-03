import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";

/**
 * An applicant's CV, for admins only. PDFs open in the browser (?download
 * saves them instead); Word files always download.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const row = await prisma.jobApplication.findUnique({ where: { id }, select: { cvData: true, cvType: true, cvName: true } });
  if (!row) return NextResponse.json({ error: "CV not found." }, { status: 404 });

  const inline = row.cvType === "application/pdf" && !new URL(request.url).searchParams.has("download");
  const ascii = row.cvName.replace(/[^\x20-\x7e]/g, "-").replace(/"/g, "");
  return new NextResponse(new Uint8Array(row.cvData), {
    headers: {
      "Content-Type": row.cvType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(row.cvName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
