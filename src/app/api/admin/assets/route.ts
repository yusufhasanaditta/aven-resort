import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const assets = await prisma.siteAsset.findMany({ orderBy: { key: "asc" } });
  return NextResponse.json({ assets });
}

/** Point an existing asset key at a different URL (e.g. after uploading a new file). */
export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });

  const body = await request.json();
  const { key, url } = body ?? {};
  if (!key || !url || typeof key !== "string" || typeof url !== "string") {
    return NextResponse.json({ error: "Missing key or url." }, { status: 400 });
  }

  const asset = await prisma.siteAsset.upsert({
    where: { key },
    update: { url },
    create: { key, url, label: key },
  });

  return NextResponse.json({ ok: true, asset });
}
