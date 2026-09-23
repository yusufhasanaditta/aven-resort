import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/**
 * Route guard for /account and /admin.
 *
 * Runs on the Edge runtime, so it only verifies the session JWT's signature
 * and shape — it does not touch Prisma (not edge-compatible with SQLite).
 * Each protected page/route still re-checks the session against the database
 * via getSession()/requireAdmin() in src/lib/auth.ts; this layer exists so an
 * unauthenticated visitor is redirected before any page renders at all.
 */

const SESSION_COOKIE = "aven_session";

function secretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function readRole(token: string | undefined): Promise<string | null> {
  const key = secretKey();
  if (!token || !key) return null;
  try {
    const { payload } = await jwtVerify(token, key);
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (pathname.startsWith("/admin")) {
    const role = await readRole(token);
    if (role !== "ADMIN") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/account")) {
    const role = await readRole(token);
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
