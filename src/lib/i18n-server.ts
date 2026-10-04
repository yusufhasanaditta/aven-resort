import "server-only";
import { cookies } from "next/headers";
import { LANG_COOKIE, isLang, type Lang } from "@/lib/i18n";
import { ensureSiteEdits } from "@/lib/site-edits";

/** The visitor's chosen language, from the `lang` cookie; English by default. */
export async function getLang(): Promise<Lang> {
  const [jar] = await Promise.all([cookies(), ensureSiteEdits()]);
  const value = jar.get(LANG_COOKIE)?.value;
  return isLang(value) ? value : "en";
}
