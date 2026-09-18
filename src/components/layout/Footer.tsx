import Link from "next/link";
import { navigation, site } from "@/data/site";
import { Logo } from "@/components/ui/Logo";
import { Button, ArrowRight } from "@/components/ui/Button";

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

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-forest-950 text-cream-100">
      {/* Enquiry band */}
      <div className="border-b border-cream-50/10">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-20">
          <div className="max-w-2xl">
            <p className="text-eyebrow text-gold-400">Ownership enquiries</p>
            <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
              Own a share of Bangladesh&rsquo;s next iconic tea resort.
            </h2>
            <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-cream-200/65">
              Unit shares are offered across four categories, each carrying
              registered land title, annual dividends and stay privileges. Speak
              to the AVEN team for current availability.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Button href="/contact" variant="light" size="lg">
              Request details
              <ArrowRight />
            </Button>
            <Button href="/ownership" variant="outline-light" size="lg">
              Ownership categories
            </Button>
          </div>
        </div>
      </div>

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
              {site.social.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full ring-1 ring-cream-50/15 transition-colors hover:bg-cream-50/10 hover:ring-cream-50/30"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-cream-100/70">
                    <path d={socialPaths[s.icon]} />
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
              {navigation.slice(5).map((item) => (
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
                <a
                  href={site.contact.phoneHref}
                  className="text-cream-100/70 transition-colors hover:text-cream-50"
                >
                  {site.contact.phone}
                </a>
                <p className="mt-0.5 text-xs text-cream-200/40">
                  {site.contact.hours}
                </p>
              </li>
              <li>
                <a
                  href={site.contact.emailHref}
                  className="text-cream-100/70 transition-colors hover:text-cream-50"
                >
                  {site.contact.email}
                </a>
              </li>
              <li className="text-cream-100/70">
                <span className="block">Project site</span>
                <span className="mt-0.5 block text-xs text-cream-200/40">
                  {site.location.label}
                </span>
              </li>
              <li className="text-cream-100/70">
                <span className="block">Head office</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-cream-200/40">
                  {site.contact.headOffice}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream-50/10">
        <div className="mx-auto flex max-w-[88rem] flex-col gap-3 px-5 py-6 text-xs text-cream-200/40 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} {site.company} · All rights reserved.
          </p>
          <p className="max-w-xl text-pretty sm:text-right">
            Renders are artistic impressions. Land figures are transcribed from
            the project masterplan document and are subject to final survey.
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
