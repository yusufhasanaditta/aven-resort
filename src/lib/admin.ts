import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin, type SessionPayload } from "@/lib/auth";

/**
 * Every /api/admin route starts with this: either the admin session, or a 403
 * response to return as-is.
 *
 *   const guard = await adminGuard();
 *   if (guard instanceof NextResponse) return guard;
 */
export async function adminGuard(): Promise<SessionPayload | NextResponse> {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  return admin;
}

/** Appends to the audit trail. Never throws — logging must not break the action it records. */
export async function logActivity(actor: string, action: string, target?: string, detail?: string) {
  try {
    await prisma.activityLog.create({ data: { actor, action, target, detail } });
  } catch {
    /* audit is best-effort */
  }
}

/** Public pages are prerendered; after a content edit, refresh every one of them. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

export async function readJson<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
