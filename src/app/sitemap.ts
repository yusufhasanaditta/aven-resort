import type { MetadataRoute } from "next";
import { navigation } from "@/data/site";

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://avenresort.com").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [...navigation, { href: "/own-your-share" }, { href: "/interest" }, { href: "/apply" }, { href: "/careers" }, { href: "/careers/why-join-aven" }, { href: "/careers/archive" }, { href: "/faq" }, { href: "/terms" }, { href: "/privacy" }];
  return pages.map((item) => ({
    url: `${BASE}${item.href === "/" ? "" : item.href}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: item.href === "/" ? 1 : 0.8,
  }));
}
