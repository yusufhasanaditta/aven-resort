import "server-only";
import { prisma } from "@/lib/db";
import { cmsDefaults, type CmsContent, type CmsKey } from "@/data/cms-defaults";
import { mediaSlot } from "@/data/media-slots";

/**
 * Reads one CMS section. Stored JSON is merged over the defaults so a section
 * saved before a new field existed still renders that field; any database or
 * parse failure falls back to the defaults rather than breaking the page.
 */
export async function getContent<K extends CmsKey>(key: K): Promise<CmsContent[K]> {
  const fallback = cmsDefaults[key];
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    if (!row) return fallback;
    const parsed = JSON.parse(row.value);
    if (Array.isArray(fallback)) return (Array.isArray(parsed) ? parsed : fallback) as CmsContent[K];
    return { ...fallback, ...parsed } as CmsContent[K];
  } catch {
    return fallback;
  }
}

export const cmsKeys = Object.keys(cmsDefaults) as CmsKey[];

/** A page's admin-replaceable image (Media library), falling back to the built-in render. */
export async function getAsset(key: string, fallback = mediaSlot(key)?.fallback ?? ""): Promise<string> {
  try {
    const row = await prisma.siteAsset.findUnique({ where: { key } });
    return row?.url || fallback;
  } catch {
    return fallback;
  }
}
