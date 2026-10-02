import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { WellnessLine } from "@/components/sections/home/WellnessLine";
import { AmenityTiles } from "@/components/sections/home/AmenityTiles";
import { MembershipSpread } from "@/components/sections/home/MembershipSpread";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { ApplyNowButton } from "@/components/sections/ApplyChooser";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { WellnessQuotes } from "@/components/sections/home/WellnessQuotes";
import { wellnessServices } from "@/data/wellness";
import { projectFacts, site } from "@/data/site";
import { getContent } from "@/lib/cms";
import { getPlans } from "@/lib/plans";
import { getLang } from "@/lib/i18n-server";

/**
 * The homepage is the brochure, told once: each topic gets one section here
 * and a link onward to its own page, rather than repeating the ownership
 * calculator, comparison and benefits that live on /ownership.
 */
/** Villa options shown on the homepage stay card. */
const villaTypes = ["Super Deluxe Residential", "Single", "Duplex", "Presidential"];

export default async function HomePage() {
  const [yoga, ...therapies] = wellnessServices;
  const [hero, resort, contact, lang, plans] = await Promise.all([getContent("hero"), getContent("resort"), getContent("contact"), getLang(), getPlans()]);
  const bn = lang === "bn";

  return (
    <>
      <Hero
        bangla={bn}
        eyebrow={bn ? undefined : hero.eyebrow}
        title={bn ? "স্বাগতম" : hero.title}
        titleAccent={bn ? "অ্যাভেন ইকো লাক্সারি রিসোর্ট অ্যান্ড ওয়েলনেস, শ্রীমঙ্গল" : hero.titleAccent}
        accentStyle="line"
        lede={bn ? undefined : hero.lede || undefined}
        image={hero.image}
        imageAlt="The cloud walkway glowing gold across the tea hills at dusk, the Aven hotel lit on the ridge beyond"
        actions={[
          { label: bn ? "এখনই বুক করুন" : hero.primaryLabel, href: hero.primaryHref },
          { label: bn ? "আপনার শেয়ার নিন" : hero.secondaryLabel, href: hero.secondaryHref, variant: "outline-light" as const },
        ].filter((a) => a.label && a.href)}
        facts={
          bn
            ? [
                { value: "৫", label: "একর" },
                { value: "১৫.১৫", label: "বিঘা" },
                { value: "৫০০", label: "শতাংশ" },
              ]
            : [
                { value: projectFacts.landAcres, label: "Acres" },
                { value: projectFacts.landBigha, label: "Bigha" },
                { value: projectFacts.landDecimal, label: "Decimal" },
              ]
        }
      />

      <WellnessLine text={bn ? "দেশের প্রথম ওয়েলনেস-ভিত্তিক রিসোর্ট ও রিট্রিট" : hero.ticker} bangla={bn} />

      {/* The brochure's welcome letter */}
      <Section tone="white" className="bg-leaf-swirl overflow-hidden">
        <Container>
          <Reveal className="mx-auto max-w-3xl text-center">
            <span className="mx-auto block h-14 w-14">
              <LogoMark />
            </span>
            <p className="mt-6 font-display text-display-sm text-balance text-forest-900">{resort.headline}</p>
            <div className="mx-auto mt-8 grid max-w-2xl gap-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/65 sm:grid-cols-2 sm:text-left">
              <p>{resort.paragraphOne}</p>
              <p>{resort.paragraphTwo}</p>
            </div>
            <p className="mt-8 text-eyebrow text-forest-600/60">{site.company}</p>
          </Reveal>
        </Container>
      </Section>

      {/* Stay: hotel + villas */}
      <Section tone="cream" className="pt-0 sm:pt-0 lg:pt-0">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            <Reveal className="group relative min-h-[26rem] overflow-hidden rounded-3xl lg:min-h-[34rem]">
              <Image
                src="/renders/hotel-facade.jpg"
                alt="The Aven luxury hotel, a stone-and-glass facade framed by forested hills"
                fill
                sizes="(min-width: 1024px) 55vw, 95vw"
                className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 via-forest-950/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                <Eyebrow tone="light">Luxury Hotel</Eyebrow>
                <p className="mt-3 font-display text-display-sm text-cream-50">
                  {projectFacts.hotelRooms} exclusive rooms
                </p>
                <p className="mt-2 max-w-md text-[0.8125rem] leading-relaxed text-cream-100/75">
                  Presidential &amp; Royal suites · Grand Ballroom (200 pax) ·
                  Seminar Room (50 pax) · Meeting Room
                </p>
              </div>
            </Reveal>

            <div className="grid gap-4">
              <Reveal delay={0.06} className="group relative min-h-[16rem] overflow-hidden rounded-3xl">
                <Image
                  src="/renders/hillside-villas-valley.jpg"
                  alt="A timber-and-glass villa with an infinity pool above terraced tea hills"
                  fill
                  sizes="(min-width: 1024px) 40vw, 95vw"
                  className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/85 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <Eyebrow tone="light">Luxury Villas</Eyebrow>
                  <p className="mt-2 font-display text-3xl text-cream-50">
                    {projectFacts.villas} exclusive villas
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {villaTypes.map((t) => (
                      <li key={t} className="rounded-full bg-cream-50/12 px-3 py-1 text-[0.75rem] text-cream-50 ring-1 ring-cream-50/20 backdrop-blur-sm">
                        {t}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-gold-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-300" aria-hidden="true" />
                    With private pool
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.12} className="flex">
                <WellnessQuotes className="w-full" />
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* Site zoning & functions */}
      <Section tone="white">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal className="max-w-2xl">
              <Eyebrow>Site zoning &amp; functions</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                Twenty amenities.{" "}
                <span className="italic text-forest-600">You own a share of each.</span>
              </h2>
              <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                Every shareholder holds fractional ownership of all the features
                and amenities, with Saf-Kabla land registration.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <Button href="/amenities" variant="secondary">
                Tour every amenity
                <ArrowRight />
              </Button>
            </Reveal>
          </div>
          <AmenityTiles className="mt-12" />
        </Container>
      </Section>

      {/* Wellness mosaic — "Aven cares for you" */}
      <Section tone="cream">
        <Container>
          <div className="grid gap-4 lg:grid-cols-[1fr_1.6fr]">
            <Reveal className="group relative min-h-[28rem] overflow-hidden rounded-3xl">
              <Image
                src={yoga.image}
                alt="A guest in sunrise yoga on a timber deck above the tea terraces"
                fill
                sizes="(min-width: 1024px) 38vw, 95vw"
                className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-transparent to-forest-950/60" />
              <div className="absolute inset-x-0 top-0 p-7 sm:p-9">
                <Eyebrow tone="light">Wellness &amp; Retreat</Eyebrow>
                <h2 className="mt-3 font-display text-display-md text-cream-50">
                  Aven cares <span className="italic text-gold-300">for you.</span>
                </h2>
              </div>
              <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">
                <Button href="/wellness" variant="light">
                  All nine therapies
                  <ArrowRight />
                </Button>
              </div>
            </Reveal>

            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {therapies.map((w) => (
                <RevealItem key={w.id}>
                  <Link
                    href={`/wellness#${w.id}`}
                    className="group relative block aspect-[3/4] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={w.image}
                      alt={w.name}
                      fill
                      sizes="(min-width: 1024px) 14vw, 45vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-forest-950/5 to-transparent" />
                    <p className="absolute inset-x-0 bottom-0 p-3.5 font-display text-lg leading-tight text-cream-50 sm:text-xl">
                      {w.name}
                    </p>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </Section>

      {/* Membership */}
      <Section tone="forest" className="overflow-hidden">
        <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
        <Container className="relative">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow tone="light">Membership plans</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
              Five plans, from Executive{" "}
              <span className="italic text-gold-300">to Royal.</span>
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">
              Your plan is set by the shares you hold — every share is ৳5,00,000,
              and every step up brings more free days in the hills. Royal members
              receive 35 free days a year and 100% villa ownership.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-14">
            <MembershipSpread plans={plans} />
          </Reveal>
          <Reveal delay={0.15} className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/ownership#calculator" variant="light" size="lg">
              Calculate my share
              <ArrowRight />
            </Button>
            <Button href="/ownership#why-own" variant="outline-light" size="lg">
              Why own with us?
            </Button>
          </Reveal>
        </Container>
      </Section>

      {/* Location */}
      <Section tone="white">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <Reveal className="relative aspect-[1.41] overflow-hidden rounded-3xl shadow-lift-lg">
              <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" aria-label="Open the resort location in Google Maps" className="group absolute inset-0 block">
              <Image
                src="/brochure/location-map-aven.jpg"
                alt="Satellite map of Sreemangal showing Aven Eco Luxury Resort & Wellness south-east of the town, among the tea gardens"
                fill
                sizes="(min-width: 1024px) 55vw, 95vw"
                className="object-cover"
              />
              <span className="absolute left-[70.4%] top-[70.4%] block h-24 w-24 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border border-cream-50/60" aria-hidden="true" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-cream-50/95 px-3 py-1.5 text-xs font-medium text-forest-800 shadow-lift transition-transform duration-300 group-hover:-translate-y-0.5">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                    Open in Google Maps
                  </span>
              </a>
            </Reveal>
            <Reveal delay={0.08}>
              <Eyebrow>Location</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                In the tea hills of Sreemangal.
              </h2>
              <dl className="mt-8 space-y-6 text-[0.9375rem]">
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/60">
                    Resort
                  </dt>
                  <dd className="mt-1.5 leading-relaxed text-forest-900/75">
                    <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-forest-600/25 underline-offset-4 transition-colors hover:text-forest-700 hover:decoration-forest-600">
                      {contact.resortAddress}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/60">
                    Corporate office
                  </dt>
                  <dd className="mt-1.5 leading-relaxed text-forest-900/75">{contact.headOffice}</dd>
                </div>
              </dl>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/contact">
                  Book a site visit
                  <ArrowRight />
                </Button>
                <Button href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} variant="secondary">
                  {contact.phone}
                </Button>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* Closing — the brochure's last page */}
      <section className="bg-leaf-swirl relative overflow-hidden bg-cream-100 py-24 text-center sm:py-32">
        <Container>
          <Reveal>
            <p className="text-sm text-forest-900/55">Welcome to</p>
            <h2 className="mt-4 flex justify-center">
              <Logo className="h-20 sm:h-28" />
            </h2>
            <p className="mt-6 font-display text-2xl italic text-forest-700 sm:text-3xl">{resort.motto}</p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <ApplyNowButton size="lg" lang={bn ? "bn" : "en"}>
                Become a shareholder
                <ArrowRight />
              </ApplyNowButton>
              <Button href="/interest" variant="secondary" size="lg">
                Register interest
              </Button>
            </div>
            <p className="mx-auto mt-12 max-w-xl text-xs leading-relaxed text-forest-900/40">
              This is the vision of Aven. Current vision and design can be adapted
              based on the project demands.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
