import type { Metadata } from "next";
import { ArchiveBoard } from "@/components/sections/careers/ArchiveBoard";
import { CareersHeader, CareersNav, FraudNotice } from "@/components/sections/careers/CareersChrome";
import { Container } from "@/components/ui/Section";
import { getContent } from "@/lib/cms";
import { getPublicJobs, requestTime } from "@/lib/careers-server";
import { isOpen } from "@/lib/careers";

export const metadata: Metadata = {
  title: "Careers — Circular Archive",
  description: "Every job circular Aven Eco Luxury Resort & Wellness has published, by year, with deadlines and the circulars themselves.",
};

export const dynamic = "force-dynamic";

export default async function CareersArchivePage() {
  const [jobs, content] = await Promise.all([getPublicJobs(), getContent("careers")]);
  const now = requestTime();
  // Newest first within each year.
  const sorted = [...jobs].sort((a, b) => (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt));

  return (
    <>
      <CareersHeader
        eyebrow="Circular archive"
        title="Circular"
        accent="Archive"
        lede="Every vacancy announcement Aven has published, grouped by year — with its circular number, deadline and the circular itself."
      />
      <CareersNav active="archive" openCount={jobs.filter((j) => isOpen(j, now)).length} archiveCount={jobs.length} />
      <section className="bg-cream-100 py-14 sm:py-20">
        <Container>
          <ArchiveBoard jobs={sorted} now={now} />
          <FraudNotice text={content.fraudNotice} className="mt-12" />
        </Container>
      </section>
    </>
  );
}
