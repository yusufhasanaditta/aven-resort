import { NextResponse } from "next/server";
import { adminGuard, logActivity } from "@/lib/admin";
import { clearProfilePhoto, setProfilePhoto } from "@/lib/photo";

/** Admin sets (POST, multipart `file`) or removes (DELETE) a shareholder's profile photo. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const r = await setProfilePhoto(id, await request.formData().catch(() => null), guard.name);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
  await logActivity(guard.name, "Changed profile photo", id);
  return NextResponse.json({ ok: true, url: r.url });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await clearProfilePhoto(id);
  return NextResponse.json({ ok: true });
}
