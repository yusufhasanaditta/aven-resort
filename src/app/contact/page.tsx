import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { InquiryForm } from "@/components/sections/InquiryForm";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Num } from "@/components/ui/Number";
import { site } from "@/data/site";
import { getAsset, getContent } from "@/lib/cms";
import { positioning } from "@/data/about";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to the AVEN team about unit shares, ownership categories, the masterplan and site visits at Aven Eco Luxury Resort, Sreemangal.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const [contact, heroImage, mapImage, pg] = await Promise.all([getContent("contact"), getAsset("contact.hero"), getAsset("contact.map"), getContent("pages")]);
  const contactRows = [
    {
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/[^0-9+]/g, "")}`,
      detail: contact.hours,
    },
    {
      label: "Email",
      value: contact.email,
      href: `mailto:${contact.email}`,
      detail: "We reply within 24 hours",
    },
    {
      label: "Resort location",
      value: contact.resortAddress,
      href: contact.mapUrl,
      detail: "In the Radhanagar tea hills",
    },
    {
      label: "Corporate office",
      value: contact.headOffice,
      detail: site.company,
    },
  ];

  return (
    <>
      <Hero
        eyebrow={pg.contactEyebrow}
        title={pg.contactTitle}
        titleAccent={pg.contactAccent}
        lede={pg.contactLede}
        image={heroImage}
        imageAlt="The glass tea restaurant overlooking the terraced tea gardens at dusk"
        height="short"
        leaves={false}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
            {/* Contact details */}
            <div>
              <Reveal>
                <Eyebrow>Contact information</Eyebrow>
                <h2 className="mt-4 font-display text-display-sm text-forest-900">
                  Speak to the team
                </h2>
              </Reveal>

              <RevealGroup className="mt-8 space-y-6">
                {contactRows.map((row) => (
                  <RevealItem key={row.label}>
                    <div className="border-b border-forest-600/10 pb-6">
                      <p className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-forest-900/40">
                        {row.label}
                      </p>
                      {row.href ? (
                        <a
                          href={row.href}
                          {...(/^https?:/.test(row.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="mt-1.5 block text-[0.9375rem] font-medium leading-relaxed text-forest-800 transition-colors hover:text-forest-600"
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className="mt-1.5 text-[0.9375rem] font-medium leading-relaxed text-forest-800">
                          {row.value}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-forest-900/45">
                        {row.detail}
                      </p>
                    </div>
                  </RevealItem>
                ))}
              </RevealGroup>

              {/* Location card */}
              <Reveal delay={0.12}>
                <a
                  href={contact.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open the resort location in Google Maps"
                  className="group relative mt-8 block aspect-4/3 overflow-hidden rounded-2xl shadow-lift"
                >
                  <Image
                    src={mapImage}
                    alt="Satellite map of Sreemangal with the Aven resort pinned among the tea gardens"
                    fill
                    sizes="(min-width: 1024px) 34vw, 92vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-cream-50/95 px-3 py-1.5 text-xs font-medium text-forest-800 shadow-lift transition-transform duration-300 group-hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                    Open in Google Maps
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent p-4">
                    <p className="text-[0.8125rem] font-medium text-cream-50">
                      Aven Eco Luxury Resort &amp; Wellness
                    </p>
                    <p className="text-xs text-cream-200/65">
                      {contact.resortAddress}
                    </p>
                  </div>
                </a>
              </Reveal>
            </div>

            {/* Form */}
            <div id="enquiry" className="scroll-mt-28">
              <Reveal>
                <InquiryForm key={type ?? "default"} initialType={type} />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why AVEN band */}
      <Section tone="cream" className="py-16 sm:py-20">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>Why AVEN</Eyebrow>
            <h2 className="mt-4 font-display text-display-sm text-balance text-forest-900">
              A sustainable investment with lasting value.
            </h2>
          </Reveal>
          <RevealGroup className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {positioning.map((p) => (
              <RevealItem key={p.label}>
                <Num as="p" size="xl" className="text-forest-700">
                  {p.stat}
                </Num>
                <p className="mt-2 text-sm font-semibold text-forest-900">
                  {p.label}
                </p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-forest-900/55">
                  {p.detail}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>
    </>
  );
}
