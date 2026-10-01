import { NextResponse } from "next/server";

/** Public sign-up is closed: accounts are opened by the Aven team (admin → Shareholders, or by approving an application). */
export async function POST() {
  return NextResponse.json(
    { error: "Accounts are opened by the Aven team. Please apply for shares at /apply and we'll set up your account." },
    { status: 403 },
  );
}
