"use client";

import { installEdits, type SiteEditMap } from "@/jsx/edits";

/**
 * Hands the page editor's edits to the browser before anything below it
 * renders, so client components hydrate with the same text the server sent.
 * Rendered first in <body>; it draws nothing.
 */
export function SiteEditsBridge({ edits }: { edits: SiteEditMap }) {
  installEdits(edits);
  return null;
}
