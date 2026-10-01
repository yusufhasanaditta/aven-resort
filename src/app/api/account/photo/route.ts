import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { clearProfilePhoto, setProfilePhoto } from "@/lib/photo";

/** The signed-in user uploads (POST, multipart `file`) or removes (DELETE) their profile photo. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  const r = await setProfilePhoto(session.sub, await request.formData().catch(() => null), session.name);
  return r.ok ? NextResponse.json({ ok: true, url: r.url }) : NextResponse.json({ error: r.error }, { status: r.status });
}

export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Please sign in." }, { status: 401 });
  await clearProfilePhoto(session.sub);
  return NextResponse.json({ ok: true });
}
