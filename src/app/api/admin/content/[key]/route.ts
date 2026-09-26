import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard, logActivity, readJson, revalidateSite } from "@/lib/admin";
import { cmsDefaults, type CmsKey } from "@/data/cms-defaults";

const MAX_TEXT = 20_000;
const MAX_ITEMS = 60;

/** Keep only the fields the default declares, each coerced to the default's type. */
function shapeLike(template: Record<string, unknown>, input: unknown): Record<string, unknown> {
  const src = (input && typeof input === "object" ? input : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, def] of Object.entries(template)) {
    const v = src[k];
    if (typeof def === "boolean") out[k] = typeof v === "boolean" ? v : def;
    else if (typeof def === "number") out[k] = Number.isFinite(Number(v)) ? Number(v) : def;
    else out[k] = typeof v === "string" ? v.slice(0, MAX_TEXT) : def;
  }
  return out;
}

function sanitize(key: CmsKey, input: unknown) {
  const def = cmsDefaults[key];
  if (Array.isArray(def)) {
    const itemTemplate = def[0] as Record<string, unknown>;
    return (Array.isArray(input) ? input : [])
      .slice(0, MAX_ITEMS)
      .map((item) => shapeLike(itemTemplate, item))
      .filter((item) => Object.values(item).some((v) => typeof v === "string" && v.trim()));
  }
  return shapeLike(def as Record<string, unknown>, input);
}

function isKey(key: string): key is CmsKey {
  return Object.prototype.hasOwnProperty.call(cmsDefaults, key);
}

/** Saves one section and refreshes the public site so the change is live on the next visit. */
export async function PUT(request: Request, { params }: { params: Promise<{ key: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { key } = await params;
  if (!isKey(key)) return NextResponse.json({ error: "Unknown section." }, { status: 404 });

  const body = await readJson<{ value: unknown }>(request);
  if (!body) return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const value = sanitize(key, body.value);
  await prisma.siteContent.upsert({
    where: { key },
    update: { value: JSON.stringify(value), updatedBy: guard.name },
    create: { key, value: JSON.stringify(value), updatedBy: guard.name },
  });
  revalidateSite();
  await logActivity(guard.name, "Edited content", key);
  return NextResponse.json({ ok: true, value });
}

/** Restores a section to its default content. */
export async function DELETE(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { key } = await params;
  if (!isKey(key)) return NextResponse.json({ error: "Unknown section." }, { status: 404 });
  await prisma.siteContent.deleteMany({ where: { key } });
  revalidateSite();
  await logActivity(guard.name, "Reset content to default", key);
  return NextResponse.json({ ok: true, value: cmsDefaults[key] });
}
