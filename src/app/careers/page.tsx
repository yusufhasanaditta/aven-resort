import type { Metadata } from "next";
import Link from "next/link";
import { ApplyForm } from "@/components/sections/careers/ApplyForm";
import { Hero } from "@/components/sections/Hero";
import { CareersBoard } from "@/components/sections/careers/CareersBoard";
import { CareersNav, FraudNotice, HrContact } from "@/components/sections/careers/CareersChrome";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { getAsset, getContent } from "@/lib/cms";
import { getPublicJobs, requestTime } from "@/lib/careers-server";
import { isOpen, latestUpdates, pairs, shortDate } from "@/lib/careers";

export const metadata: Metadata = {
  title: "Careers — Vacancy Announcements",
  description:
    "Job circulars at Aven Eco Luxury Resort & Wellness, Sreemangal — vacancy announcements, recruitment updates, the circular archive and how to apply.",
};

// Deadlines count down by the day, so the board is worked out on every visit.
export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const [heroImage, jobs, content] = await Promise.all([getAsset("careers.hero"), getPublicJobs(), getContent("careers")]);
  const now = requestTime();
  const open = jobs.filter((j) => isOpen(j, now));
  const departments = new Set(open.map((j) => j.department)).size;
  const vacancies = open.reduce((n, j) => n + (j.vacancies ?? 1), 0);
  // Notices from open circulars, and from closed ones edited in the last 60 days (results come after the deadline).
  const updates = latestUpdates(jobs.filter((j) => isOpen(j, now) || Date.parse(j.updatedAt) > now - 60 * 864e5));
  const steps = pairs(content.process).slice(0, 5);

  return (
    <>
      <Hero
        eyebrow="Careers at Aven"
        title="Build Your Career"
        titleAccent="in the Tea Hills"
        lede="We are building Sreemangal's eco-luxury resort and wellness retreat — and the team who will run it. Every vacancy is announced here first, with the full circular and how to apply."
        image={heroImage}
        imageAlt="A calm lounge in the Aven tea house, looking out over the hills"
        height="short"
        facts={[
          { value: String(open.length), label: open.length === 1 ? "Open circular" : "Open circulars" },
          { value: String(vacancies), label: vacancies === 1 ? "Vacancy" : "Vacancies" },
          { value: String(departments || "—"), label: "Departments hiring" },
        ]}
        actions={[{ label: "See vacancy announcements", href: "#openings" }]}
      />

      <CareersNav active="vacancies" openCount={open.length} archiveCount={jobs.length} />

      <Section tone="cream" id="openings" className="scroll-mt-32 pt-14 sm:pt-16 lg:pt-20">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-12">
            <div className="min-w-0">
              <Reveal className="mb-8 max-w-2xl">
                <Eyebrow>Vacancy announcements</Eyebrow>
                <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                  Open positions.
                  <span className="italic text-forest-600"> Find your place.</span>
                </h2>
              </Reveal>
              <CareersBoard jobs={jobs} now={now} noVacancy={content.noVacancy} archiveCount={jobs.length} />
            </div>

            {/* Notice column */}
            <aside className="space-y-5 lg:pt-2">
              <div className="rounded-3xl bg-white p-6 shadow-lift ring-1 ring-forest-600/8">
                <p className="flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/70">
                  <span className="relative flex h-2 w-2">
                    {updates.length > 0 && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E07A3A] opacity-60" />}
                    <span className={updates.length ? "relative h-2 w-2 rounded-full bg-[#E07A3A]" : "relative h-2 w-2 rounded-full bg-forest-600/30"} />
                  </span>
                  Recruitment updates
                </p>
                {updates.length === 0 ? (
                  <p className="mt-4 text-[0.8125rem] leading-relaxed text-forest-900/55">
                    Shortlists, test and interview schedules and results are posted here and on each circular.
                  </p>
                ) : (
                  <ol className="mt-4 space-y-4">
                    {updates.map((u, i) => (
                      <li key={i} className="border-l-2 border-gold-400/60 pl-3.5">
                        <p className="text-[0.6875rem] text-forest-900/45">{shortDate(u.date)}</p>
                        <Link href={`/careers/${u.job.slug}#updates`} className="mt-0.5 block text-[0.8125rem] font-semibold leading-snug text-forest-900 hover:text-forest-700">
                          {u.title}
                        </Link>
                        <p className="text-xs text-forest-900/55">{u.job.title}</p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              <div className="rounded-3xl bg-forest-900 p-6 text-cream-50">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-300">Human Resources</p>
                <p className="mt-2 font-display text-2xl leading-tight">Questions about a vacancy?</p>
                <HrContact content={content} tone="dark" className="mt-4" />
                <a href="#cv" className="mt-5 inline-flex h-10 items-center rounded-full bg-gold-400 px-5 text-[0.8125rem] font-semibold text-forest-950 hover:bg-gold-300">
                  Send your CV
                </a>
              </div>

              <FraudNotice text={content.fraudNotice} />
            </aside>
          </div>
        </Container>
      </Section>

      {/* How we hire, in brief */}
      {steps.length > 0 && (
        <Section tone="white" className="py-16 sm:py-20 lg:py-24">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <Reveal className="max-w-2xl">
                <Eyebrow>How we hire</Eyebrow>
                <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">From circular to first day.</h2>
              </Reveal>
              <Button href="/careers/why-join-aven" variant="secondary">
                Why join Aven
                <ArrowRight />
              </Button>
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-2xl border border-forest-600/10 bg-cream-100/70 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest-700 font-numeral text-sm text-gold-300">{i + 1}</span>
                  <p className="mt-4 font-display text-xl leading-snug text-forest-900">{s.title}</p>
                  {s.detail && <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-forest-900/60">{s.detail}</p>}
                </li>
              ))}
            </ol>
          </Container>
        </Section>
      )}

      {/* A CV for future openings */}
      <Section tone="cream" id="cv" className="scroll-mt-32 py-16 sm:py-20 lg:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
            <Reveal>
              <Eyebrow>Future openings</Eyebrow>
              <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
                Don&apos;t see your role?
                <span className="italic text-forest-600"> Send us your CV.</span>
              </h2>
              <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-forest-900/65">
                We are still building the team that will open Aven. Leave your CV with us and our HR team will contact you when a position that fits you is announced.
              </p>
            </Reveal>
            <Reveal delay={0.06}>
              <ApplyForm jobTitle="future openings at Aven" collapsed />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
