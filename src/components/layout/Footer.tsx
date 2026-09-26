import Link from "next/link";
import { navigation, site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { FooterEnquiry } from "@/components/layout/FooterEnquiry";
import { getContent } from "@/lib/cms";

const socialPaths: Record<string, string> = {
  facebook:
    "M13.5 9H15V6.5h-1.7c-2 0-3.3 1.3-3.3 3.3V11H8v2.5h2V19h2.5v-5.5H15L15.3 11h-2.8V9.9c0-.6.3-.9 1-.9Z",
  instagram:
    "M8.5 5h7A3.5 3.5 0 0 1 19 8.5v7a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 5 15.5v-7A3.5 3.5 0 0 1 8.5 5Zm3.5 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm4.2-1.4a.9.9 0 1 0 0 1.8.9.9 0 0 0 0-1.8Z",
  youtube:
    "M19 9.2c-.2-1.1-.7-1.8-1.9-2C15.6 7 12 7 12 7s-3.6 0-5.1.2c-1.2.2-1.7.9-1.9 2C4.8 10.4 4.8 12 4.8 12s0 1.6.2 2.8c.2 1.1.7 1.8 1.9 2C8.4 17 12 17 12 17s3.6 0 5.1-.2c1.2-.2 1.7-.9 1.9-2 .2-1.2.2-2.8.2-2.8s0-1.6-.2-2.8ZM10.6 14.3V9.7l3.9 2.3-3.9 2.3Z",
  linkedin:
    "M7.2 9.5H9.6V18H7.2V9.5Zm1.2-3.9a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM11.3 9.5h2.3v1.2h.1c.3-.6 1.1-1.3 2.3-1.3 2.5 0 3 1.6 3 3.7V18h-2.4v-4.1c0-1 0-2.2-1.4-2.2s-1.6 1-1.6 2.1V18h-2.3V9.5Z",
};

export async function Footer() {
  const contact = await getContent("contact");
  const social = (
    [
      ["Facebook", contact.facebook, "facebook"],
      ["Instagram", contact.instagram, "instagram"],
      ["YouTube", contact.youtube, "youtube"],
      ["LinkedIn", contact.linkedin, "linkedin"],
    ] as const
  ).filter(([, href]) => href.trim());
  const telHref = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;
  const whatsapp = contact.whatsapp.replace(/[^0-9]/g, "").replace(/^0/, "880");

  return (
    <footer className="relative overflow-hidden bg-forest-950 text-cream-100 print:hidden">
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
            <div className="mt-6 flex gap-2">
              {social.map(([label, href, icon]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-cream-50/15 transition-colors hover:bg-cream-50/10 hover:ring-cream-50/30"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-cream-100/70">
                    <path d={socialPaths[icon]} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <nav>
            <h3 className="text-eyebrow text-cream-200/45">Explore</h3>
            <ul className="mt-5 space-y-2.5">
              {navigation.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-100/70 transition-colors hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h3 className="text-eyebrow text-cream-200/45">Company</h3>
            <ul className="mt-5 space-y-2.5">
              {[
                ...navigation.slice(5),
                { label: "Apply for shares", href: "/apply" },
                { label: "FAQ", href: "/faq" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-cream-100/70 transition-colors hover:text-cream-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-eyebrow text-cream-200/45">Get in touch</h3>
            <ul className="mt-5 space-y-4 text-sm">
              <li>
                <a href={telHref} className="text-cream-100/70 transition-colors hover:text-cream-50">
                  {contact.phone}
                </a>
                <p className="mt-0.5 text-xs text-cream-200/40">{contact.hours}</p>
                {whatsapp && (
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs text-gold-300/80 hover:text-gold-300">
                    WhatsApp us →
                  </a>
                )}
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="text-cream-100/70 transition-colors hover:text-cream-50">
                  {contact.email}
                </a>
              </li>
              <li className="text-cream-100/70">
                <span className="block">Resort</span>
                <span className="mt-0.5 block text-xs text-cream-200/40">
                  {contact.resortAddress}
                </span>
              </li>
              <li className="text-cream-100/70">
                <span className="block">Corporate office</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-cream-200/40">
                  {contact.headOffice}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-5 py-6 text-xs text-cream-200/40 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.company} · All rights reserved ·{" "}
            <Link href="/terms" className="hover:text-cream-100">Terms</Link> ·{" "}
            <Link href="/privacy" className="hover:text-cream-100">Privacy</Link>
          </p>
          <p className="max-w-xl text-pretty sm:text-right">
            This is the vision of Aven. Renders are artistic impressions; current
            vision and design can be adapted based on the project demands.
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
