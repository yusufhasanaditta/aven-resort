import type { Metadata } from "next";
import Image from "next/image";
import { CareersHeader, CareersNav, FraudNotice, HrContact } from "@/components/sections/careers/CareersChrome";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { getAsset, getContent } from "@/lib/cms";
import { getPublicJobs, requestTime } from "@/lib/careers-server";
import { isOpen, pairs } from "@/lib/careers";

export const metadata: Metadata = {
  title: "Careers — Why Join Aven",
  description:
    "Why build your career at Aven Eco Luxury Resort & Wellness, Sreemangal: our mission, what we offer, our values, equal opportunity and how we hire.",
};

export const dynamic = "force-dynamic";

/** Line icons for "What we offer", used in turn. */
const OFFER_ICONS = [
  "M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3",
  "M4 11h16v9H4v-9Zm-1-4h18v4H3V7Zm9 0v13M12 7c-1.5-3-5-3-5-1s3 1 5 1Zm0 0c1.5-3 5-3 5-1s-3 1-5 1Z",
  "M4 11 12 4l8 7v9H4v-9Zm6 9v-6h4v6",
  "M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z",
  "M4 19 10 13l4 4 6-8M15 9h5v5",
  "M5 5h14v15H5V5Zm0 5h14M9 3v4m6-4v4",
];

export default async function WhyJoinPage() {
  const [image, content, jobs] = await Promise.all([getAsset("careers.hero"), getContent("careers"), getPublicJobs()]);
  const now = requestTime();
  const openCount = jobs.filter((j) => isOpen(j, now)).length;
  const offers = pairs(content.offers);
  const values = pairs(content.values);
  const steps = pairs(content.process);
  const faqs = pairs(content.faqs, /\s*\|\s*/);

  return (
    <>
      <CareersHeader eyebrow="Why join Aven" title={content.whyTitle} accent={content.whyAccent} lede={content.whyLede} image={image}>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/careers#openings" variant="light" size="lg">
            {openCount ? `See ${openCount} open vacanc${openCount === 1 ? "y" : "ies"}` : "Vacancy announcements"}
            <ArrowRight />
          </Button>
          <Button href="/careers/archive" variant="outline-light" size="lg">
            Circular archive
          </Button>
        </div>
      </CareersHeader>

      <CareersNav active="why" openCount={openCount} archiveCount={jobs.length} />

      {/* Mission */}
      {content.mission && (
        <section className="bg-cream-50 py-16 sm:py-24">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
              <Reveal>
                <Eyebrow>Our mission</Eyebrow>
                <p className="mt-5 font-display text-[clamp(1.4rem,2vw,1.9rem)] leading-snug text-balance text-forest-900">{content.mission}</p>
              </Reveal>
              <Reveal delay={0.08} className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-lift-lg">
                <Image src="/renders/glass-tea-restaurant.jpg" alt="The glass tea restaurant among the tea gardens at Aven" fill sizes="(min-width: 1024px) 40vw, 92vw" className="object-cover" />
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {/* What we offer */}
      {offers.length > 0 && (
        <section className="bg-cream-100 py-16 sm:py-24">
          <Container>
            <Reveal className="max-w-2xl">
              <Eyebrow>What we offer</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">Looked after, so you can look after our guests.</h2>
            </Reveal>
            <RevealGroup className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((o, i) => (
                <RevealItem key={o.title}>
                  <div className="h-full rounded-2xl bg-white p-6 shadow-lift ring-1 ring-forest-600/8">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700 text-gold-300">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d={OFFER_ICONS[i % OFFER_ICONS.length]} />
                      </svg>
                    </span>
                    <h3 className="mt-5 font-display text-xl leading-snug text-forest-900">{o.title}</h3>
                    {o.detail && <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/60">{o.detail}</p>}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </Container>
        </section>
      )}

      {/* Values + equal opportunity */}
      {(values.length > 0 || content.equalOpportunity) && (
        <section className="relative overflow-hidden bg-forest-950 py-16 text-cream-50 sm:py-24">
          <div className="bg-leaf-swirl-light pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <Container className="relative">
            {values.length > 0 && (
              <>
                <Reveal className="max-w-2xl">
                  <Eyebrow tone="light">Our values</Eyebrow>
                  <h2 className="mt-4 font-display text-display-md text-balance">What we hire for.</h2>
                </Reveal>
                <RevealGroup className="mt-10 grid gap-px overflow-hidden rounded-3xl bg-cream-50/10 sm:grid-cols-2 lg:grid-cols-4">
                  {values.map((v, i) => (
                    <RevealItem key={v.title}>
                      <div className="h-full bg-forest-950/80 p-7">
                        <span className="font-numeral text-sm text-gold-400">0{i + 1}</span>
                        <h3 className="mt-3 font-display text-2xl">{v.title}</h3>
                        {v.detail && <p className="mt-2 text-[0.8125rem] leading-relaxed text-cream-200/65">{v.detail}</p>}
                      </div>
                    </RevealItem>
                  ))}
                </RevealGroup>
              </>
            )}
            {content.equalOpportunity && (
              <Reveal className="mt-12 flex flex-col gap-5 rounded-3xl bg-cream-50/[0.06] p-7 ring-1 ring-cream-50/12 sm:flex-row sm:items-center sm:p-9">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold-400 text-forest-950" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3v18M5 7h14M5 7l-3 7a3 3 0 0 0 6 0L5 7Zm14 0-3 7a3 3 0 0 0 6 0l-3-7Z" />
                  </svg>
                </span>
                <div>
                  <p className="font-display text-2xl">An equal opportunity employer</p>
                  <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-cream-100/75">{content.equalOpportunity}</p>
                </div>
              </Reveal>
            )}
          </Container>
        </section>
      )}

      {/* How we hire */}
      {steps.length > 0 && (
        <section className="bg-cream-50 py-16 sm:py-24">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
              <Reveal>
                <Eyebrow>How we hire</Eyebrow>
                <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">A clear, fair process.</h2>
                <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-forest-900/60">
                  Every step is announced on the circular itself, so you always know where your application stands.
                </p>
              </Reveal>
              <ol className="relative space-y-6 before:absolute before:bottom-4 before:left-[1.1875rem] before:top-4 before:w-px before:bg-forest-600/15">
                {steps.map((s, i) => (
                  <li key={s.title} className="relative flex gap-5">
                    <span className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-700 font-numeral text-sm text-gold-300 ring-4 ring-cream-50">{i + 1}</span>
                    <div className="pt-1.5">
                      <p className="font-display text-xl text-forest-900">{s.title}</p>
                      {s.detail && <p className="mt-1 text-[0.875rem] leading-relaxed text-forest-900/60">{s.detail}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </Container>
        </section>
      )}

      {/* FAQs + HR */}
      <section className="bg-cream-100 py-16 sm:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
            <div>
              <Reveal>
                <Eyebrow>Questions</Eyebrow>
                <h2 className="mt-4 font-display text-display-md text-forest-900">Before you apply.</h2>
              </Reveal>
              {faqs.length > 0 && (
                <div className="mt-8 space-y-3">
                  {faqs.map((f) => (
                    <details key={f.title} className="group rounded-2xl bg-white ring-1 ring-forest-600/8 open:shadow-lift">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-[0.9375rem] font-medium text-forest-900">
                        {f.title}
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-600/7 text-forest-700 transition-transform group-open:rotate-45" aria-hidden="true">
                          +
                        </span>
                      </summary>
                      {f.detail && <p className="px-5 pb-5 text-[0.875rem] leading-relaxed text-forest-900/65">{f.detail}</p>}
                    </details>
                  ))}
                </div>
              )}
            </div>
            <aside className="space-y-5 lg:pt-20">
              <div className="rounded-3xl bg-white p-7 shadow-lift ring-1 ring-forest-600/8">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/70">Human Resources</p>
                <p className="mt-2 font-display text-2xl text-forest-900">Talk to our HR team</p>
                <HrContact content={content} className="mt-5" />
              </div>
              <FraudNotice text={content.fraudNotice} />
            </aside>
          </div>
        </Container>
      </section>

      {/* Closing call */}
      <section className="bg-forest-900 py-14 text-cream-50">
        <Container className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <p className="font-display text-3xl leading-tight">
            {openCount ? "We are hiring now." : "No vacancy open right now."}{" "}
            <span className="italic text-gold-300">{openCount ? "Find your place." : "Check back soon."}</span>
          </p>
          <Button href="/careers#openings" variant="light" size="lg">
            Vacancy announcements
            <ArrowRight />
          </Button>
        </Container>
      </section>
    </>
  );
}
