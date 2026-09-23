import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { InquiryForm } from "@/components/sections/InquiryForm";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Num } from "@/components/ui/Number";
import { site } from "@/data/site";
import { positioning } from "@/data/about";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Speak to the AVEN team about unit shares, ownership categories, the masterplan and site visits at Aven Tea Empire, Srimangal.",
};

const contactRows = [
  {
    label: "Phone",
    value: site.contact.phone,
    href: site.contact.phoneHref,
    detail: site.contact.hours,
  },
  {
    label: "Email",
    value: site.contact.email,
    href: site.contact.emailHref,
    detail: "We reply within 24 hours",
  },
  {
    label: "Project site",
    value: site.location.label,
    detail: "Dual road access from Srimangal",
  },
  {
    label: "Head office",
    value: site.contact.headOffice,
    detail: "AVEN Ltd.",
  },
];

export default function ContactPage() {
  return (
    <>
      <Hero
        eyebrow="Get in touch"
        title="We&rsquo;d Love to"
        titleAccent="Hear From You"
        lede="Questions about the project, the land, the ownership structure or a site visit — the AVEN team is here to help."
        image="/renders/glass-tea-restaurant.jpg"
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
                          className="mt-1.5 block text-[0.9375rem] font-medium text-forest-800 transition-colors hover:text-forest-600"
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
                <div className="relative mt-8 aspect-4/3 overflow-hidden rounded-2xl shadow-lift">
                  <Image
                    src="/renders/location-map.jpg"
                    alt="Map of the Sreemangal area showing the project's location"
                    fill
                    sizes="(min-width: 1024px) 34vw, 92vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent p-4">
                    <p className="text-[0.8125rem] font-medium text-cream-50">
                      Aven Tea Empire
                    </p>
                    <p className="text-xs text-cream-200/65">
                      {site.location.label}
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Form */}
            <Reveal>
              <InquiryForm />
            </Reveal>
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
