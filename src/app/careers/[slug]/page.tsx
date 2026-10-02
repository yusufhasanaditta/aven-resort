import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { BriefcaseIcon, PdfBadge } from "@/components/sections/careers/CareersBoard";
import { CareersNav, FraudNotice } from "@/components/sections/careers/CareersChrome";
import { getContent } from "@/lib/cms";
import { JobGallery, ShareJob } from "@/components/sections/careers/JobExtras";
import { getSession } from "@/lib/auth";
import { getJob, getPublicJobs, requestTime } from "@/lib/careers-server";
import { daysLeft, deadlineNote, formatDeadline, formatPublished, hrefFor, isExternal, isOpen, lines, paragraphs, shortDate, type Job } from "@/lib/careers";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const session = await getSession();
  const admin = session?.role === "ADMIN";
  return { job: await getJob(slug, { includeDrafts: admin }), admin };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: "Careers" };
  return {
    title: `${job.title} — Careers`,
    description: job.summary,
    openGraph: { title: `${job.title} · ${site.name}`, description: job.summary, images: job.images[0] ? [job.images[0]] : undefined },
  };
}

const BASE = (process.env.NEXT_PUBLIC_SITE_URL || "https://avenresort.com").replace(/\/$/, "");

/** Google for Jobs reads this, so open circulars can show up in job search. */
function jobPostingLd(job: Job) {
  const types: Record<string, string> = { "Full-time": "FULL_TIME", "Part-time": "PART_TIME", Contract: "CONTRACTOR", Internship: "INTERN", Temporary: "TEMPORARY" };
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: [job.summary, ...paragraphs(job.description), ...lines(job.responsibilities), ...lines(job.requirements)].join("\n"),
    datePosted: job.publishedAt ?? job.createdAt,
    ...(job.deadline && { validThrough: job.deadline }),
    employmentType: types[job.employmentType] ?? "OTHER",
    hiringOrganization: { "@type": "Organization", name: site.name, sameAs: BASE },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: job.location, addressRegion: "Sylhet", addressCountry: "BD" },
    },
    ...(job.vacancies && { totalJobOpenings: job.vacancies }),
    ...(job.images[0] && { image: job.images[0].startsWith("/") ? `${BASE}${job.images[0]}` : job.images[0] }),
  };
}

export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const { job } = await load(slug);
  if (!job) notFound();

  const now = requestTime();
  const open = isOpen(job, now);
  const left = daysLeft(job.deadline, now);
  const [cover, ...more] = job.images;
  const [all, careers] = await Promise.all([getPublicJobs(), getContent("careers")]);
  const others = all.filter((j) => j.id !== job.id && isOpen(j, now)).slice(0, 3);

  const facts = [
    { k: "Circular no.", v: job.reference },
    { k: "Department", v: job.department },
    { k: "Job level", v: job.level },
    { k: "Employment", v: job.employmentType },
    { k: "Location", v: job.location },
    { k: "Vacancies", v: job.vacancies ? String(job.vacancies) : null },
    { k: "Salary", v: job.salary },
    { k: "Experience", v: job.experience },
    { k: "Education", v: job.education },
    { k: "Published", v: job.publishedAt ? formatPublished(job.publishedAt) : null },
    { k: "Apply by", v: formatDeadline(job.deadline) },
  ].filter((f): f is { k: string; v: string } => !!f.v);

  const responsibilities = lines(job.responsibilities);
  const requirements = lines(job.requirements);
  const benefits = lines(job.benefits);
  const about = paragraphs(job.description);
  // The circular's own HR contact, else the Careers page's.
  const email = job.contactEmail || careers.hrEmail;
  const phone = job.contactPhone || careers.hrPhone;
  const contactLinks = [email && { label: email, url: email }, phone && { label: phone, url: phone }].filter(
    (x): x is { label: string; url: string } => !!x,
  );

  return (
    <>
      {job.status !== "DRAFT" && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingLd(job)).replace(/</g, "\\u003c") }} />
      )}

      {/* Header */}
      <section className="relative overflow-hidden bg-forest-950 pb-14 pt-[calc(var(--header-height)+3rem)] text-cream-50 sm:pb-20">
        {cover && (
          <>
            <Image src={cover} alt="" fill priority sizes="100vw" unoptimized={cover.startsWith("http")} className="object-cover opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/85 to-forest-950/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
          </>
        )}
        <div className="bg-leaf-swirl-light pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
        <Container className="relative">
          <nav aria-label="Breadcrumb" className="text-[0.8125rem] text-cream-200/60">
            <Link href="/careers" className="hover:text-cream-50">
              Careers
            </Link>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <Link href={open ? "/careers#openings" : "/careers/archive"} className="hover:text-cream-50">
              {open ? "Vacancy announcements" : "Circular archive"}
            </Link>
          </nav>

          {job.status === "DRAFT" && (
            <p className="mt-5 inline-flex rounded-full bg-gold-400 px-3.5 py-1.5 text-xs font-semibold text-forest-950">
              Draft preview — only admins can see this page until it is published.
            </p>
          )}

          <div className="mt-6 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-eyebrow text-gold-300">
                {[job.department, job.level, job.employmentType].filter(Boolean).join(" · ")}
              </p>
              <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1.02] text-balance">{job.title}</h1>
              {job.reference && <p className="mt-3 font-numeral text-sm text-cream-200/60">Circular no. {job.reference}</p>}
              <p className="mt-5 max-w-2xl text-pretty text-[1.0625rem] leading-relaxed text-cream-100/80">{job.summary}</p>
              <ul className="mt-6 flex flex-wrap gap-2 text-xs">
                <li className="rounded-full bg-cream-50/10 px-3 py-1.5 ring-1 ring-cream-50/15">{job.location}</li>
                {job.vacancies && (
                  <li className="rounded-full bg-cream-50/10 px-3 py-1.5 ring-1 ring-cream-50/15">
                    {job.vacancies} vacanc{job.vacancies > 1 ? "ies" : "y"}
                  </li>
                )}
                {job.salary && <li className="rounded-full bg-cream-50/10 px-3 py-1.5 ring-1 ring-cream-50/15">{job.salary}</li>}
                <li className={cn("rounded-full px-3 py-1.5 font-semibold", open ? (left !== null && left <= 3 ? "bg-[#E07A3A] text-white" : "bg-gold-400 text-forest-950") : "bg-cream-50/15 text-cream-100")}>
                  {deadlineNote(job, now)}
                </li>
              </ul>
            </div>
            {open && job.links.length > 0 && (
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <ApplyButtons job={job} tone="dark" />
              </div>
            )}
          </div>
        </Container>
      </section>

      <CareersNav active={open ? "vacancies" : "archive"} openCount={all.filter((j) => isOpen(j, now)).length} archiveCount={all.length} />

      {/* Body */}
      <section className="bg-cream-100 py-14 sm:py-20">
        <Container>
          {!open && job.status !== "DRAFT" && (
            <p className="mb-10 rounded-2xl border border-forest-600/15 bg-white px-6 py-4 text-sm text-forest-900/70">
              <strong className="font-semibold text-forest-900">This position is closed</strong> — applications are no longer being taken. Any results are posted under Recruitment updates below.{" "}
              <Link href="/careers#openings" className="font-medium text-forest-700 underline underline-offset-4">
                See the positions that are open now
              </Link>
              .
            </p>
          )}

          <div className="grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
            <div className="min-w-0 space-y-12">
              {job.updates.length > 0 && (
                <section id="updates" className="scroll-mt-40 rounded-3xl bg-white p-6 shadow-lift ring-1 ring-gold-400/40 sm:p-8">
                  <h2 className="flex items-center gap-2.5 font-display text-2xl text-forest-900">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E07A3A] opacity-60" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-[#E07A3A]" />
                    </span>
                    Recruitment updates
                  </h2>
                  <ol className="relative mt-6 space-y-6 before:absolute before:bottom-2 before:left-[0.3125rem] before:top-2 before:w-px before:bg-forest-600/15">
                    {job.updates.map((u, i) => (
                      <li key={i} className="relative pl-7">
                        <span className={cn("absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-white", i === 0 ? "bg-gold-400" : "bg-forest-600/30")} aria-hidden="true" />
                        <p className="text-xs text-forest-900/50">
                          {shortDate(u.date)}
                          {i === 0 && <span className="ml-2 rounded-full bg-gold-400/20 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[#7a5a17]">Latest</span>}
                        </p>
                        <p className="mt-1 font-semibold text-forest-900">{u.title}</p>
                        {u.body && <p className="mt-1 whitespace-pre-line text-[0.875rem] leading-relaxed text-forest-900/65">{u.body}</p>}
                        {u.url && (
                          <a
                            href={hrefFor(u.url)}
                            {...(isExternal(u.url) && { target: "_blank", rel: "noopener noreferrer" })}
                            className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-forest-700 hover:underline"
                          >
                            Open <span aria-hidden="true">↗</span>
                          </a>
                        )}
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {cover && (
                <Reveal className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-forest-900/5 shadow-lift-lg">
                  <Image src={cover} alt={job.title} fill sizes="(min-width: 1024px) 60vw, 92vw" unoptimized={cover.startsWith("http")} className="object-cover" />
                </Reveal>
              )}

              {about.length > 0 && (
                <Block title="About the role">
                  <div className="space-y-4 text-[0.9375rem] leading-relaxed text-forest-900/70">
                    {about.map((p, i) => (
                      <p key={i} className="whitespace-pre-line text-pretty">
                        {p}
                      </p>
                    ))}
                  </div>
                </Block>
              )}

              {responsibilities.length > 0 && (
                <Block title="Responsibilities">
                  <Points items={responsibilities} />
                </Block>
              )}

              {(requirements.length > 0 || job.education || job.experience) && (
                <Block title="Requirements">
                  {(job.education || job.experience) && (
                    <dl className="mb-6 grid gap-3 sm:grid-cols-2">
                      {job.education && <Fact k="Education" v={job.education} />}
                      {job.experience && <Fact k="Experience" v={job.experience} />}
                    </dl>
                  )}
                  {requirements.length > 0 && <Points items={requirements} />}
                </Block>
              )}

              {(benefits.length > 0 || job.salary) && (
                <Block title="Salary & benefits">
                  {job.salary && (
                    <p className="mb-5 inline-flex rounded-2xl bg-white px-5 py-3 font-numeral text-xl text-forest-900 shadow-lift ring-1 ring-forest-600/8">{job.salary}</p>
                  )}
                  {benefits.length > 0 && <Points items={benefits} tone="gold" />}
                </Block>
              )}

              {job.circularUrl && (
                <Block title="Official circular">
                  <div className="overflow-hidden rounded-3xl bg-white shadow-lift ring-1 ring-forest-600/8">
                    <div className="flex flex-wrap items-center gap-4 p-5">
                      <span className="flex h-12 w-10 items-center justify-center rounded-md bg-red-600 text-[0.6875rem] font-bold text-white" aria-hidden="true">
                        PDF
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-forest-900">{job.circularName || `${job.title} — circular.pdf`}</p>
                        <p className="text-xs text-forest-900/50">{job.reference ? `Circular no. ${job.reference} · ` : ""}The official circular, as published</p>
                      </div>
                      <a href={job.circularUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center rounded-full bg-forest-700 px-5 text-[0.8125rem] font-semibold text-cream-50 hover:bg-forest-800">
                        Download
                      </a>
                    </div>
                    {/* Read it on the page; phones open the file instead. */}
                    <iframe src={`${job.circularUrl}#view=FitH`} title={`${job.title} — circular`} className="hidden h-[44rem] w-full border-t border-forest-600/8 bg-cream-100 md:block" loading="lazy" />
                  </div>
                </Block>
              )}

              {more.length > 0 && (
                <Block title="Circular & photos">
                  <JobGallery images={more} title={job.title} />
                </Block>
              )}

              {open && (job.howToApply || job.links.length > 0 || contactLinks.length > 0) && (
                <Block title="How to apply">
                  <div className="rounded-3xl bg-forest-900 p-7 text-cream-50 sm:p-9">
                    {job.howToApply && <p className="whitespace-pre-line text-[0.9375rem] leading-relaxed text-cream-100/85">{job.howToApply}</p>}
                    {job.links.length > 0 && (
                      <div className={cn("flex flex-wrap gap-3", job.howToApply && "mt-6")}>
                        <ApplyButtons job={job} tone="dark" />
                      </div>
                    )}
                    {job.deadline && (
                      <p className="mt-6 text-xs text-cream-200/60">
                        Applications close at the end of <strong className="font-semibold text-cream-100">{formatDeadline(job.deadline)}</strong>.
                      </p>
                    )}
                  </div>
                </Block>
              )}
            </div>

            {/* Summary card */}
            <aside className="lg:sticky lg:top-[calc(var(--header-height)+5rem)] lg:self-start">
              <div className="rounded-3xl bg-white p-6 shadow-lift-lg ring-1 ring-forest-600/8">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-700 text-gold-300">
                    <BriefcaseIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-forest-900">Job summary</p>
                    <p className="text-xs text-forest-900/50">{site.name}</p>
                  </div>
                </div>
                <dl className="mt-5 divide-y divide-forest-600/8 text-[0.8125rem]">
                  {facts.map((f) => (
                    <div key={f.k} className="flex justify-between gap-4 py-2.5">
                      <dt className="shrink-0 text-forest-900/50">{f.k}</dt>
                      <dd className="text-right font-medium text-forest-900">{f.v}</dd>
                    </div>
                  ))}
                </dl>

                {open && left !== null && (
                  <div className="mt-4 rounded-2xl bg-cream-100 px-4 py-3 text-center">
                    <p className="font-numeral text-3xl text-forest-900">{left === 0 ? "Today" : left}</p>
                    <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-forest-900/50">{left === 0 ? "is the last day" : left === 1 ? "day left to apply" : "days left to apply"}</p>
                  </div>
                )}

                {open && job.links.length > 0 && (
                  <div className="mt-5 grid gap-2">
                    <ApplyButtons job={job} tone="light" stacked />
                  </div>
                )}

                {job.circularUrl && (
                  <a
                    href={job.circularUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-forest-800 ring-1 ring-forest-600/20 hover:bg-forest-600/5"
                  >
                    <PdfBadge /> Download circular
                  </a>
                )}

                {contactLinks.length > 0 && (
                  <div className="mt-5 border-t border-forest-600/8 pt-4">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45">HR contact</p>
                    <ul className="mt-2 space-y-1.5 text-[0.8125rem]">
                      {contactLinks.map((c) => (
                        <li key={c.url}>
                          <a href={hrefFor(c.url)} className="break-all font-medium text-forest-700 hover:underline">
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 border-t border-forest-600/8 pt-4">
                  <p className="mb-2.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45">Share this circular</p>
                  <ShareJob title={job.title} />
                </div>
              </div>
              <FraudNotice text={careers.fraudNotice} className="mt-5" />
            </aside>
          </div>

          {others.length > 0 && (
            <div className="mt-20">
              <h2 className="font-display text-3xl text-forest-900">Other open positions</h2>
              <ul className="mt-6 grid gap-4 md:grid-cols-3">
                {others.map((o) => (
                  <li key={o.id}>
                    <Link href={`/careers/${o.slug}`} className="group block h-full rounded-2xl bg-white p-5 shadow-lift ring-1 ring-forest-600/8 transition-transform hover:-translate-y-0.5">
                      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-600/70">{o.department}</p>
                      <p className="mt-1.5 font-display text-xl leading-snug text-forest-900 group-hover:text-forest-700">{o.title}</p>
                      <p className="mt-2 text-xs text-forest-900/55">
                        {o.employmentType} · {deadlineNote(o, now)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 className="mb-5 flex items-center gap-3 font-display text-3xl text-forest-900">
        <span className="h-px w-8 bg-gold-400" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </Reveal>
  );
}

function Points({ items, tone = "forest" }: { items: string[]; tone?: "forest" | "gold" }) {
  return (
    <ul className="grid gap-3">
      {items.map((t, i) => (
        <li key={i} className="flex gap-3.5 rounded-2xl bg-white/70 px-4 py-3 text-[0.9375rem] leading-relaxed text-forest-900/75 ring-1 ring-forest-600/6">
          <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs", tone === "gold" ? "bg-gold-400/20 text-[#8a6a1f]" : "bg-forest-600/10 text-forest-700")} aria-hidden="true">
            ✓
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-forest-600/8">
      <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-forest-900/45">{k}</dt>
      <dd className="mt-1 text-sm text-forest-900">{v}</dd>
    </div>
  );
}

/** The circular's buttons: the first filled, the rest outlined. */
function ApplyButtons({ job, tone, stacked = false }: { job: Job; tone: "dark" | "light"; stacked?: boolean }) {
  return (
    <>
      {job.links.map((l, i) => {
        const external = isExternal(l.url);
        const primary = i === 0;
        return (
          <a
            key={`${l.label}-${i}`}
            href={hrefFor(l.url)}
            {...(external && { target: "_blank", rel: "noopener noreferrer" })}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors",
              stacked && "w-full",
              primary
                ? tone === "dark"
                  ? "bg-gold-400 text-forest-950 hover:bg-gold-300"
                  : "bg-forest-700 text-cream-50 hover:bg-forest-800"
                : tone === "dark"
                  ? "text-cream-50 ring-1 ring-cream-50/30 hover:bg-cream-50/10"
                  : "text-forest-800 ring-1 ring-forest-600/20 hover:bg-forest-600/5",
            )}
          >
            {l.label}
            {external && <span aria-hidden="true">↗</span>}
          </a>
        );
      })}
    </>
  );
}
