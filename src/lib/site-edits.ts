import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { installEdits, type SiteEditMap } from "@/jsx/edits";

/**
 * The page editor's edits, kept in memory and shared by every render in this
 * server process. Pages read them through the JSX runtime (src/jsx), so a
 * render never waits on the database: a stale copy is served while a fresh
 * one loads in the background, and a save installs its result at once.
 */

const FRESH_MS = 20_000;

type Cache = { map: SiteEditMap; at: number; loading: Promise<SiteEditMap> | null; seq: number };

declare global {
  var __avenEditsCache: Cache | undefined;
}

export const EMPTY_EDITS: SiteEditMap = { text: {}, images: {} };

export type EditKind = "text" | "image";

export function editHash(kind: EditKind, original: string) {
  return createHash("sha256").update(`${kind}\0${original}`).digest("hex");
}

async function readMap(): Promise<SiteEditMap> {
  const rows = await prisma.siteEdit.findMany({ select: { kind: true, original: true, value: true } });
  const map: SiteEditMap = { text: {}, images: {} };
  for (const r of rows) (r.kind === "image" ? map.images : map.text)[r.original] = r.value;
  return map;
}

/**
 * Re-reads the edits from the database. `force` (after a save) starts a new
 * read even if one is under way, and only the newest read is installed. On
 * failure the last copy stays (or none) and is retried later.
 */
export function reloadSiteEdits({ force = false } = {}): Promise<SiteEditMap> {
  const cache = (globalThis.__avenEditsCache ??= { map: EMPTY_EDITS, at: 0, loading: null, seq: 0 });
  if (cache.loading && !force) return cache.loading;
  const seq = ++cache.seq;
  const keep = (map: SiteEditMap) => {
    if (seq !== cache.seq) return cache.loading ?? cache.map;
    cache.map = map;
    cache.at = Date.now();
    cache.loading = null;
    installEdits(map);
    return map;
  };
  const loading = readMap().then(keep, () => keep(cache.map));
  cache.loading = loading;
  return loading;
}

/** The current edits; waits for the database only on a cold start. */
export async function loadSiteEdits(): Promise<SiteEditMap> {
  const cache = globalThis.__avenEditsCache;
  if (!cache || cache.at === 0) return reloadSiteEdits();
  if (Date.now() - cache.at > FRESH_MS) void reloadSiteEdits();
  return cache.map;
}
