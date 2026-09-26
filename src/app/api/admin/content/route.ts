import { NextResponse } from "next/server";
import { adminGuard } from "@/lib/admin";
import { getContent, cmsKeys } from "@/lib/cms";

/** Every CMS section, merged over its defaults. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const entries = await Promise.all(cmsKeys.map(async (k) => [k, await getContent(k)] as const));
  return NextResponse.json({ content: Object.fromEntries(entries) });
}
