import Link from "next/link";
import { navigation, site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { FooterEnquiry } from "@/components/layout/FooterEnquiry";
import { getContent } from "@/lib/cms";
import { navBn, ui, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Where each network's icon goes before the admin has entered the account
 * URL: a search for Aven on that network, so every icon always leads somewhere.
 */
const SEARCH = encodeURIComponent("Aven Eco Luxury Resort");
const socialFallback: Record<string, string> = {
  facebook: `https://www.facebook.com/search/top?q=${SEARCH}`,
  instagram: `https://www.instagram.com/explore/search/keyword/?q=${SEARCH}`,
  youtube: `https://www.youtube.com/results?search_query=${SEARCH}`,
  tiktok: `https://www.tiktok.com/search?q=${SEARCH}`,
  linkedin: `https://www.linkedin.com/search/results/all/?keywords=${SEARCH}`,
  x: `https://x.com/search?q=${SEARCH}`,
};

/** Brand colour each icon lights up in on hover. */
const socialHover: Record<string, string> = {
  facebook: "group-hover:bg-[#1877F2]",
  instagram: "group-hover:bg-[linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)]",
  youtube: "group-hover:bg-[#FF0000]",
  tiktok: "group-hover:bg-black",
  linkedin: "group-hover:bg-[#0A66C2]",
  x: "group-hover:bg-black",
  whatsapp: "group-hover:bg-[#25D366]",
};

const socialPaths: Record<string, string> = {
  facebook:
    "M13.5 9H15V6.5h-1.7c-2 0-3.3 1.3-3.3 3.3V11H8v2.5h2V19h2.5v-5.5H15L15.3 11h-2.8V9.9c0-.6.3-.9 1-.9Z",
  instagram:
    "M8.5 5h7A3.5 3.5 0 0 1 19 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 5 15.5v-7A3.5 3.5 0 0 1 8.5 5Zm3.5 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm4.2-1.4a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z",
  youtube:
    "M19 9.2c-.2-1.1-.7-1.8-1.9-2C15.6 7 12 7 12 7s-3.6 0-5.1.2c-1.2.2-1.7.9-1.9 2C4.8 10.4 4.8 12 4.8 12s0 1.6.2 2.8c.2 1.1.7 1.8 1.9 2C8.4 17 12 17 12 17s3.6 0 5.1-.2c1.2-.2 1.7-.9 1.9-2 .2-1.2.2-2.8.2-2.8s0-1.6-.2-2.8ZM10.6 14.3V9.7l3.9 2.3-3.9 2.3Z",
  linkedin:
    "M7.2 9.5H9.6V18H7.2V9.5Zm1.2-3.9a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM11.3 9.5h2.3v1.2h.1c.3-.6 1.1-1.3 2.3-1.3 2.5 0 3 1.6 3 3.7V18h-2.4v-4.1c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.3V9.5Z",
  tiktok:
    "M15.6 5c.3 1.7 1.4 2.9 3.1 3.1v2.4c-1.2 0-2.3-.4-3.1-1v4.7a4.3 4.3 0 1 1-4.3-4.3h.5v2.5a1.9 1.9 0 1 0 1.3 1.8V5h2.5Z",
  x: "M5 5h3.9l3.3 4.6L16.1 5H18l-4.9 5.8L19 19h-3.9l-3.6-5-4.3 5H5.3l5.3-6.1L5 5Zm2.6 1.3 8.2 11.4h1l-8.1-11.4h-1.1Z",
  whatsapp:
    "M12 4.5a7.4 7.4 0 0 0-6.4 11.1L4.6 19.4l3.9-1a7.4 7.4 0 1 0 3.5-13.9Zm0 1.4a6 6 0 1 1-3.1 11.2l-.2-.1-2.3.6.6-2.2-.1-.2A6 6 0 0 1 12 5.9Zm-2.4 2.8c-.2 0-.4 0-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.4 1.9.7 2.3.6 2.7.6.4-.1 1.3-.6 1.5-1.1.2-.5.2-1 .1-1.1l-.4-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.1-.3.2-.5.1-.2-.1-1-.4-1.8-1.1a6.7 6.7 0 0 1-1.3-1.6c-.1-.2 0-.3.1-.4l.4-.4.2-.4v-.4l-.7-1.6c-.1-.4-.3-.4-.5-.4h-.5Z",
};

export async function Footer({ lang = "en" }: { lang?: Lang }) {
  const contact = await getContent("contact");
  const t = ui[lang];
  const label = (href: string, en: string) => (lang === "bn" ? navBn[href]?.label ?? en : en);
  // Every network always shows; each links to Aven's account once it's set in Admin → Content.
  const social = (
    [
      ["Facebook", contact.facebook, "facebook"],
      ["Instagram", contact.instagram, "instagram"],
      ["YouTube", contact.youtube, "youtube"],
      ["TikTok", contact.tiktok, "tiktok"],
      ["LinkedIn", contact.linkedin, "linkedin"],
      ["X", contact.x, "x"],
    ] as [string, string | undefined, string][]
  ).map(([name, href, icon]) => [name, href?.trim() || socialFallback[icon], icon] as [string, string, string]);
  const telHref = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
  const whatsapp = contact.whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "880");
  if (whatsapp) social.push(["WhatsApp", `https://wa.me/${whatsapp}`, "whatsapp"]);

  return (
    <footer className={cn("relative overflow-hidden bg-forest-950 text-cream-100 print:hidden", lang === "bn" && "font-bangla")}>
      <FooterEnquiry />

      {/* Link columns */}
      <div className="mx-auto max-w-[88rem] px-5 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo tone="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-cream-200/55">
              {site.tagline}
            </p>
            <p className="mt-4 max-w-xs text-xs leading-relaxed text-cream-200/40">
              &ldquo;{site.motto}&rdquo;
            </p>
          </div>

          <nav>
            <h3 className="text-eyebrow text-cream-200/45">{t.explore}</h3>
            <ul className="mt-5 space-y-2.5">
              {navigation.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-100/70 transition-colors hover:text-cream-50"
                  >
                    {label(item.href, item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h3 className="text-eyebrow text-cream-200/45">{t.company}</h3>
            <ul className="mt-5 space-y-2.5">
              {[
                ...navigation.slice(5),
                { label: t.applyForShares, href: "/apply" },
                { label: t.faq, href: "/faq" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-100/70 transition-colors hover:text-cream-50"
                  >
                    {label(item.href, item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-eyebrow text-cream-200/45">{t.getInTouch}</h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a href={telHref} className="text-cream-100/70 transition-colors hover:text-cream-50">
                  {contact.phone}
                </a>
                <p className="mt-0.5 text-xs text-cream-200/40">{contact.hours}</p>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-gold-300/80 hover:text-gold-300">
                    {t.whatsapp}
                  </a>
                )}
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="text-cream-100/70 transition-colors hover:text-cream-50">
                  {contact.email}
                </a>
              </li>
              <li className="text-cream-100/70">
                <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="group block">
                  <span className="block transition-colors group-hover:text-cream-50">{t.resortMap}</span>
                  <span className="mt-0.5 block text-xs text-cream-200/40">
                    {contact.resortAddress}
                  </span>
                </a>
              </li>
              <li className="text-cream-100/70">
                <span className="block">{t.corporateOffice}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-cream-200/40">
                  {contact.headOffice}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Social media — links are managed in Admin → Content → Contact & social */}
      <div className="border-t border-cream-50/10">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <h3 className="text-eyebrow text-cream-200/45">{t.followAven}</h3>
            <p className="mt-1 text-xs text-cream-200/40">{t.followSub}</p>
          </div>
          <ul translate="no" className="flex flex-wrap gap-2">
            {social.map(([label, href, icon]) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center gap-2 rounded-full bg-cream-50/[0.04] pl-1.5 pr-4 text-[0.8125rem] text-cream-100/75 ring-1 ring-cream-50/12 transition-all hover:-translate-y-0.5 hover:bg-cream-50/10 hover:text-cream-50 hover:ring-gold-400/40"
                >
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-full bg-cream-50/8 transition-colors", socialHover[icon])}>
                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-cream-100/80 transition-colors group-hover:fill-white">
                      <path d={socialPaths[icon]} />
                    </svg>
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-5 py-6 text-xs text-cream-200/40 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.company} · {t.rights} ·{" "}
            <Link href="/terms" className="hover:text-cream-100">{t.terms}</Link> ·{" "}
            <Link href="/privacy" className="hover:text-cream-100">{t.privacy}</Link>
          </p>
          <p className="max-w-xl text-pretty sm:text-right">
            {t.disclaimer}
          </p>
        </div>
      </div>

      {/* Oversized wordmark, cropped by the footer edge */}
      <div
        aria-hidden="true"
        className="pointer-events-none select-none overflow-hidden"
      >
        <p className="-mb-[0.18em] translate-y-[0.1em] text-center font-display text-[22vw] leading-none text-cream-50/[0.035]">
          AVEN
        </p>
      </div>
    </footer>
  );
}
