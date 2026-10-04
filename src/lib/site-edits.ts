import "server-only";
import { cache } from "react";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/db";
import { installEdits, type SiteEditMap } from "@/jsx/edits";

/**
 * The page editor's edits, kept in memory by this server process. Pages read
 * them through the JSX runtime (src/jsx). The host may run several processes
 * (and a save lands in only one of them), so every request first compares a
 * cheap stamp — row count and latest update — with the database, and reloads
 * the edits only when it changed.
 */

type Cache = { map: SiteEditMap; stamp: string | null; loading: Promise<SiteEditMap> | null; seq: number };

declare global {
  var __avenEditsCache: Cache | undefined;
}

export const EMPTY_EDITS: SiteEditMap = { text: {}, images: {} };

export type EditKind = "text" | "image";

export function editHash(kind: EditKind, original: string) {
  return createHash("sha256").update(`${kind}\0${original}`).digest("hex");
}

const stampOf = (count: number, latest: Date | null | undefined) => `${count}:${latest?.getTime() ?? 0}`;

async function readStamp() {
  const r = await prisma.siteEdit.aggregate({ _count: { _all: true }, _max: { updatedAt: true } });
  return stampOf(r._count._all, r._max.updatedAt);
}

async function readMap() {
  const rows = await prisma.siteEdit.findMany({ select: { kind: true, original: true, value: true, updatedAt: true } });
  const map: SiteEditMap = { text: {}, images: {} };
  let latest: Date | null = null;
  for (const r of rows) {
    (r.kind === "image" ? map.images : map.text)[r.original] = r.value;
    if (!latest || r.updatedAt > latest) latest = r.updatedAt;
  }
  return { map, stamp: stampOf(rows.length, latest) };
}

const store = () => (globalThis.__avenEditsCache ??= { map: EMPTY_EDITS, stamp: null, loading: null, seq: 0 });

/**
 * Re-reads the edits from the database. `force` (after a save) starts a new
 * read even if one is under way, and only the newest read is installed. On
 * failure the last copy stays (or none) and is retried on the next request.
 */
export function reloadSiteEdits({ force = false } = {}): Promise<SiteEditMap> {
  const c = store();
  if (c.loading && !force) return c.loading;
  const seq = ++c.seq;
  const loading = readMap().then(
    ({ map, stamp }) => {
      if (seq !== c.seq) return c.loading ?? c.map;
      c.map = map;
      c.stamp = stamp;
      c.loading = null;
      installEdits(map);
      return map;
    },
    () => {
      if (seq === c.seq) c.loading = null;
      return c.map;
    },
  );
  c.loading = loading;
  return loading;
}

/** The current edits, reloaded first when the database has newer ones. */
export async function loadSiteEdits(): Promise<SiteEditMap> {
  const c = store();
  if (c.stamp === null) return reloadSiteEdits();
  try {
    if ((await readStamp()) !== c.stamp) return await reloadSiteEdits();
  } catch {
    // Database unreachable: keep serving the last copy.
  }
  return c.map;
}

/**
 * `loadSiteEdits`, once per request. Pages render alongside the root layout,
 * so the helpers every page awaits before building its JSX (getLang,
 * getContent) call this too: the newest edits are installed before the page's
 * text is swapped, not one request later.
 */
export const ensureSiteEdits = cache(loadSiteEdits);
