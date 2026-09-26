"use client";

import { usePathname } from "next/navigation";

/** Renders its children everywhere except under the given path prefixes (e.g. the admin panel's own chrome). */
export function HideOn({ prefixes, children }: { prefixes: string[]; children: React.ReactNode }) {
  const pathname = usePathname();
  if (prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return null;
  return <>{children}</>;
}
