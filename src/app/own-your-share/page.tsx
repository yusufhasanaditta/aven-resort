import type { Metadata } from "next";
import Image from "next/image";
import { Container, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { businessModel } from "@/data/ownership";
import { fallbackPlans } from "@/data/planFallback";
import { bnDigits, isLang, shareCopy, type Lang } from "@/data/ownYourShare";
import { prisma } from "@/lib/db";
import { getLang } from "@/lib/i18n-server";
import { getAsset, getContent } from "@/lib/cms";
import { stayDays } from "@/lib/shares";
import { cn } from "@/lib/utils";

const PATH = "/own-your-share";

type Props = { searchParams: Promise<{ lang?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { lang: raw } = await searchParams;
  const bn = (isLang(raw) ? raw : await getLang()) === "bn";
  return {
    title: bn ? "আপনার শেয়ারের মালিক হন" : "Own Your Share",
    description: bn
      ? "অ্যাভেন ইকো লাক্সারি রিসোর্ট, শ্রীমঙ্গল — ৫ একর জমি, ২,৭০০ শেয়ার, সাফ কাবলা নিবন্ধিত মালিকানা ও বাৎসরিক হালাল আয়।"
      : "Own a share of Aven Eco Luxury Resort, Sreemangal — 5 acres, 2,700 shares, Saf-Kabla registered ownership and annual halal income.",
    alternates: { languages: { en: PATH, bn: `${PATH}?lang=bn` } },
  };
}

/** Line icons for the hero fact cards. */
const factIcons: Record<string, string> = {
  map: "M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  layers: "m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  calendar: "M4 6h16v14H4V6Zm0 4h16M8 3v4M16 3v4M8 14h2M14 14h2",
  crown: "M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z",
};

function FactIcon({ icon, className }: { icon: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={factIcons[icon]} />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

export default async function OwnYourSharePage({ searchParams }: Props) {
  const { lang: raw } = await searchParams;
  const lang: Lang = isLang(raw) ? raw : await getLang();
  const bn = lang === "bn";
  const t = shareCopy[lang];

  const [heroImage, contact, dbPlans] = await Promise.all([
    getAsset("own-your-share.hero"),
    getContent("contact"),
    prisma.membershipPlan.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
  ]);
  const plans = dbPlans.length ? dbPlans : fallbackPlans;
  const phoneHref = `tel:${contact.phone.replace(/[^0-9+]/g, "")}`;

  // Bangla has no italic serif and suffers under wide tracking, so headings
  // and eyebrows switch face and spacing with the language.
  const display = bn ? "font-bangla font-semibold leading-snug" : "font-display";
  const eyebrow = bn ? "font-bangla text-sm font-medium" : "text-eyebrow";
  const num = (v: string | number) => (bn ? bnDigits(v) : String(v));

  return (
    <div lang={bn ? "bn" : "en"} translate="no" className={cn(bn && "font-bangla")}>
      {/* ——— Hero: copy on the left, the four headline facts on the right ——— */}
      <section className="relative overflow-hidden bg-forest-950">
        <Image src={heroImage} alt="" fill priority unoptimized={/^https?:/.test(heroImage)} sizes="100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/95 via-forest-950/70 to-forest-950/35" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-transparent to-forest-950/80" />

        <Container className="relative pb-16 pt-[calc(var(--header-height)+2.5rem)] sm:pb-24 lg:pt-[calc(var(--header-height)+4rem)]">
          <div className="mb-10 flex justify-end">
            <LanguageToggle lang={lang} path={PATH} />
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <Reveal>
              <p className={cn(eyebrow, "text-gold-400")}>{t.hero.eyebrow}</p>
              <h1 className={cn("mt-5 text-balance text-cream-50", display, bn ? "text-[2.1rem] sm:text-5xl" : "text-display-lg")}>
                {t.hero.title}{" "}
                <span className={cn("text-gold-300", !bn && "italic")}>{t.hero.titleAccent}</span>
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-cream-100/80">{t.hero.lede}</p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Button href="#enquire" variant="light" size="lg">
                  <PhoneIcon className="h-4 w-4" />
                  {t.hero.enquire}
                </Button>
                <Button href="/apply" variant="outline-light" size="lg">
                  {t.hero.apply}
                  <ArrowRight />
                </Button>
              </div>

              <ul className="mt-8 flex flex-wrap gap-2">
                {t.hero.chips.map((c) => (
                  <li key={c} className="inline-flex items-center gap-1.5 rounded-full bg-cream-50/8 px-3.5 py-1.5 text-xs text-cream-100/80 ring-1 ring-cream-50/12 backdrop-blur-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>

            <RevealGroup className="grid grid-cols-2 gap-3 sm:gap-4">
              {t.hero.facts.map((f) => (
                <RevealItem key={f.icon}>
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-cream-50/8 px-4 py-6 text-center ring-1 ring-cream-50/15 backdrop-blur-md transition-colors hover:bg-cream-50/12 sm:py-8">
                    <FactIcon icon={f.icon} className="h-7 w-7 text-gold-400" />
                    <p className={cn("mt-3 text-2xl text-cream-50 sm:text-[2rem]", bn ? "font-bangla font-semibold" : "font-numeral")}>{f.value}</p>
                    <p className="mt-1 text-xs text-cream-200/65 sm:text-[0.8125rem]">{f.label}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </section>

      {/* ——— Why own ——— */}
      <Section tone="white">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={cn(eyebrow, "text-forest-600/70")}>{t.why.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.why.title}</h2>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">{t.why.lede}</p>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.why.items.map((item) => (
              <RevealItem key={item.icon}>
                <div className="h-full rounded-2xl border border-forest-600/10 bg-cream-50 p-7 text-center shadow-lift transition-transform duration-300 hover:-translate-y-1">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest-600/8 text-forest-600">
                    <BenefitIcon icon={item.icon} className="h-6 w-6" />
                  </span>
                  <h3 className={cn("mt-5 text-lg text-forest-900", bn ? "font-bangla font-semibold" : "font-display text-xl")}>{item.title}</h3>
                  <p className="mt-2 text-pretty text-sm leading-relaxed text-forest-900/60">{item.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* ——— Business model ——— */}
      <Section tone="cream" className="bg-leaf-swirl">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={cn(eyebrow, "text-forest-600/70")}>{t.model.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.model.title}</h2>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">{t.model.lede}</p>
          </Reveal>
          <RevealGroup className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
            {t.model.items.map((item, i) => (
              <RevealItem key={businessModel[i].icon} className={cn(i === t.model.items.length - 1 && "md:col-span-2 md:mx-auto md:w-1/2")}>
                <div className="flex h-full items-start gap-4 rounded-2xl border border-forest-600/10 bg-cream-50/90 p-5 shadow-lift backdrop-blur-sm">
                  <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#B3A272] text-white">
                    <AmenityIcon icon={businessModel[i].icon} className="h-8 w-8" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-forest-600 font-numeral text-[0.6875rem] text-cream-50 ring-2 ring-cream-50">
                      {num(i + 1)}
                    </span>
                  </span>
                  <div>
                    <h3 className={cn("text-forest-900", bn ? "font-bangla text-lg font-semibold" : "font-display text-xl")}>{item.title}</h3>
                    <p className="mt-1 text-pretty text-sm leading-relaxed text-forest-900/60">{item.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal className="mt-10 text-center">
            <p className="mx-auto max-w-xl text-sm text-forest-900/55">{t.model.note}</p>
            <div className="mt-6">
              <Button href="#enquire" size="lg">
                {t.model.cta}
                <ArrowRight />
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ——— Ownership process ——— */}
      <Section tone="white">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={cn(eyebrow, "text-forest-600/70")}>{t.process.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.process.title}</h2>
          </Reveal>
          <ol className="relative mx-auto mt-12 max-w-3xl space-y-5">
            <span aria-hidden="true" className="absolute bottom-8 left-7 top-8 w-px bg-gradient-to-b from-forest-600/40 via-gold-400/50 to-forest-600/10" />
            {t.process.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 0.05} className="relative flex gap-5">
                <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-forest-600 font-numeral text-lg text-cream-50 shadow-lift">
                  {num(String(i + 1).padStart(2, "0"))}
                </span>
                <div className="flex-1 rounded-2xl border border-forest-600/10 bg-cream-50 px-6 py-5 shadow-lift">
                  <h3 className={cn("text-forest-900", bn ? "font-bangla text-lg font-semibold" : "font-display text-xl")}>{s.title}</h3>
                  <p className="mt-1 text-pretty text-sm leading-relaxed text-forest-900/60">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </Container>
      </Section>

      {/* ——— Membership plans ——— */}
      <Section tone="forest" className="overflow-hidden">
        <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
        <Container className="relative">
          <Reveal className="max-w-2xl">
            <p className={cn(eyebrow, "text-gold-400")}>{t.plans.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-cream-50", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.plans.title}</h2>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">{t.plans.lede}</p>
          </Reveal>
        </Container>
        <div className="relative mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-6 sm:px-8 [scrollbar-width:thin] xl:justify-center xl:[flex-wrap:wrap]">
          {plans.map((p) => (
            <Reveal key={p.slug} className="shrink-0 snap-center">
              <MembershipCard plan={p} />
              <div className="mt-4 flex items-center justify-between px-1 text-sm">
                <span className="font-medium text-cream-50">{t.plans.shares(p.minUnits, p.maxUnits)}</span>
                <span className="text-cream-200/65">{t.plans.stay(stayDays(p.freeStayNights))}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Container className="relative mt-8">
          <Button href="/ownership#calculator" variant="light" size="lg">
            {t.plans.cta}
            <ArrowRight />
          </Button>
        </Container>
      </Section>

      {/* ——— Gallery ——— */}
      <Section tone="cream">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={cn(eyebrow, "text-forest-600/70")}>{t.gallery.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.gallery.title}</h2>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">{t.gallery.lede}</p>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.gallery.items.map((g, i) => (
              <RevealItem key={g.src} className={cn(i === 0 && "sm:col-span-2 lg:col-span-2 lg:row-span-2")}>
                <figure className="group relative h-full min-h-60 overflow-hidden rounded-2xl bg-forest-900">
                  <Image
                    src={g.src}
                    alt={g.caption}
                    fill
                    sizes={i === 0 ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest-950/85 to-transparent px-5 pb-4 pt-12 text-sm font-medium text-cream-50">
                    {g.caption}
                  </figcaption>
                </figure>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      {/* ——— FAQ ——— */}
      <Section tone="white">
        <Container className="max-w-3xl">
          <Reveal className="text-center">
            <p className={cn(eyebrow, "text-forest-600/70")}>{t.faq.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.faq.title}</h2>
          </Reveal>
          <div className="mt-10 space-y-3">
            {t.faq.items.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.04}>
                <details className="group rounded-2xl border border-forest-600/10 bg-cream-50 px-6 py-5 shadow-lift open:ring-1 open:ring-forest-600/20">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-forest-900 [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-600/8 text-forest-600 transition-transform duration-300 group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-3 text-pretty text-sm leading-relaxed text-forest-900/65">{f.a}</p>
                </details>
              </Reveal>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button href="/faq" variant="secondary">
              {t.faq.more}
              <ArrowRight />
            </Button>
          </div>
        </Container>
      </Section>

      {/* ——— Locations ——— */}
      <Section tone="cream" className="bg-leaf-swirl">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className={cn(eyebrow, "text-forest-600/70")}>{t.locations.eyebrow}</p>
            <h2 className={cn("mt-4 text-balance text-forest-900", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.locations.title}</h2>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">{t.locations.lede}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <Reveal className="relative min-h-72 overflow-hidden rounded-2xl bg-forest-900 shadow-lift">
              <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" aria-label={t.locations.openMap} className="group absolute inset-0 block">
                <Image src="/brochure/location-map-aven.jpg" alt={t.locations.resort} fill sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-cream-50/95 px-3.5 py-2 text-xs font-medium text-forest-800 shadow-lift transition-transform duration-300 group-hover:-translate-y-0.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3.5 w-3.5"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg>
                  {t.locations.openMap}
                </span>
              </a>
            </Reveal>
            <RevealGroup className="grid gap-4">
              {[
                { title: t.locations.resort, body: contact.resortAddress, icon: factIcons.map, href: contact.mapUrl },
                { title: t.locations.office, body: contact.headOffice, href: undefined, icon: "M4 21V7l6-4 6 4v14M4 21h16M9 21v-5h4v5M9 10h.01M13 10h.01M9 14h.01M13 14h.01" },
              ].map((loc) => (
                <RevealItem key={loc.title}>
                  <div className="flex h-full gap-4 rounded-2xl border border-forest-600/10 bg-cream-50/90 p-6 shadow-lift backdrop-blur-sm">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-600 text-cream-50">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-6 w-6">
                        <path d={loc.icon} />
                      </svg>
                    </span>
                    <div>
                      <h3 className={cn("text-forest-900", bn ? "font-bangla text-lg font-semibold" : "font-display text-xl")}>{loc.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-forest-900/60">{loc.body}</p>
                      {loc.href && (
                        <a href={loc.href} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-forest-700 hover:underline">
                          {t.locations.openMap} ↗
                        </a>
                      )}
                    </div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </Container>
      </Section>

      {/* ——— Call to action ——— */}
      <Section tone="forest" id="enquire" className="scroll-mt-20 overflow-hidden">
        <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
        <Container className="relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 className={cn("text-balance text-cream-50", display, bn ? "text-3xl sm:text-4xl" : "text-display-md")}>{t.cta.title}</h2>
            <p className="mt-4 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">{t.cta.lede}</p>

            <div className="mt-9 grid gap-3 text-left sm:grid-cols-3">
              <a href={phoneHref} className="rounded-2xl bg-cream-50/8 p-5 ring-1 ring-cream-50/12 transition-colors hover:bg-cream-50/12">
                <PhoneIcon className="h-5 w-5 text-gold-400" />
                <p className="mt-3 font-numeral text-cream-50">{contact.phone}</p>
              </a>
              <a href={`mailto:${contact.email}`} className="rounded-2xl bg-cream-50/8 p-5 ring-1 ring-cream-50/12 transition-colors hover:bg-cream-50/12">
                <BenefitIcon icon="document" className="h-5 w-5 text-gold-400" />
                <p className="mt-3 break-all text-sm text-cream-50">{contact.email}</p>
              </a>
              <div className="rounded-2xl bg-cream-50/8 p-5 ring-1 ring-cream-50/12">
                <FactIcon icon="calendar" className="h-5 w-5 text-gold-400" />
                <p className="mt-3 text-sm text-cream-50">
                  <span className="text-cream-200/60">{t.cta.hours}: </span>
                  {contact.hours}
                </p>
              </div>
            </div>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button href={phoneHref} variant="light" size="lg">
                <PhoneIcon className="h-4 w-4" />
                {t.cta.call}
              </Button>
              <Button href="/apply" variant="light" size="lg">
                {t.cta.apply}
                <ArrowRight />
              </Button>
              <Button href="/interest" variant="outline-light" size="lg">
                {t.cta.interest}
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>

      <LanguageToggle lang={lang} path={PATH} variant="floating" />
    </div>
  );
}
