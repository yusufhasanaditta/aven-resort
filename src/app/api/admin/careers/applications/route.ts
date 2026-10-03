import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { adminGuard } from "@/lib/admin";
import { candidateSelect, toCandidate } from "@/lib/careers-server";

/** Every job application, newest first — without the CVs, which are opened one at a time. */
export async function GET() {
  const guard = await adminGuard();
  if (guard instanceof NextResponse) return guard;
  const rows = await prisma.jobApplication.findMany({ select: candidateSelect, orderBy: { createdAt: "desc" }, take: 5000 });
  return NextResponse.json({ candidates: rows.map(toCandidate) });
}
