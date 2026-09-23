import type { Metadata } from "next";
import Image from "next/image";
import { MasterplanExplorer } from "@/components/sections/MasterplanExplorer";
import { LandUsage } from "@/components/sections/LandUsage";
import { ZoneFunctionsGrid } from "@/components/sections/ZoneFunctionsGrid";
import { MembershipCarousel } from "@/components/sections/MembershipCarousel";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { zoneCategories, zones } from "@/data/zones";

export const metadata: Metadata = {
  title: "Interactive Masterplan",
  description:
    "Explore all 17 zones and 26 named functions of Aven Tea Empire in 3D — five tea hills, 10.80 acres, with land allocation and zone type for every parcel.",
};

export default function MasterplanPage() {
  return (
    <>
      {/* The explorer sits directly under the header — it is the page */}
      <div className="pt-[var(--header-height)]">
        <MasterplanExplorer />
      </div>

      {/* Full zone schedule */}
      <Section tone="white">
        <Container>
          <Reveal className="max-w-2xl">
            <Eyebrow>Zone schedule</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Every zone, in full.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Land figures are transcribed from the project masterplan document.
              Percentages are of the 360-decimal development and investment
              area.
            </p>
          </Reveal>

          <RevealGroup amount={0.05} className="mt-12 space-y-4">
            {zones.map((zone) => (
              <RevealItem key={zone.id}>
                <article className="group grid gap-6 rounded-2xl border border-forest-600/10 bg-cream-100 p-5 transition-colors duration-500 hover:border-forest-600/25 sm:grid-cols-[10rem_1fr] sm:p-6 lg:grid-cols-[13rem_1fr_16rem]">
                  <div className="relative aspect-4/3 overflow-hidden rounded-xl sm:aspect-square lg:aspect-4/3">
                    <Image
                      src={zone.image}
                      alt={zone.name}
                      fill
                      sizes="(min-width: 1024px) 13rem, (min-width: 640px) 10rem, 90vw"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                    />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-numeral text-sm text-forest-600/50">
                        Zone {String(zone.number).padStart(2, "0")}
                      </span>
                      <span
                        className="rounded-full px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white"
                        style={{
                          background: zoneCategories[zone.category].color,
                        }}
                      >
                        {zoneCategories[zone.category].label}
                      </span>
                      <span className="text-[0.6875rem] text-forest-900/45">
                        {zone.hill}
                      </span>
                    </div>

                    <h3 className="mt-2.5 font-display text-2xl text-forest-900">
                      {zone.name}
                    </h3>
                    <p className="mt-2 text-pretty text-[0.8125rem] leading-relaxed text-forest-900/60">
                      {zone.description}
                    </p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {zone.highlights.map((h) => (
                        <li
                          key={h}
                          className="rounded-full bg-forest-600/7 px-2.5 py-1 text-[0.6875rem] text-forest-800/75"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <dl className="grid grid-cols-3 gap-4 self-start rounded-xl bg-cream-50 p-4 lg:grid-cols-1 lg:gap-3">
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-forest-900/40">
                        Land allocated
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-forest-800">
                        {zone.land
                          ? `${zone.land.decimals} dec`
                          : "Within open area"}
                      </dd>
                      {zone.land && (
                        <dd className="text-[0.6875rem] text-forest-900/45">
                          ≈ {zone.land.sqft.toLocaleString()} sq ft
                        </dd>
                      )}
                    </div>
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-forest-900/40">
                        Share of development
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-forest-800">
                        {zone.land ? `${zone.land.percent}%` : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-forest-900/40">
                        Zone type
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-forest-800">
                        {zone.zoneType}
                      </dd>
                      <dd className="text-[0.6875rem] text-forest-900/45">
                        Investment grade
                      </dd>
                    </div>
                  </dl>
                </article>
              </RevealItem>
            ))}
          </RevealGroup>
        </Container>
      </Section>

      <ZoneFunctionsGrid />

      <LandUsage />

      {/* Master Membership Plan — deliberately last: every zone and every
          decimal above is what a membership plan actually buys into. */}
      <MembershipCarousel
        tone="forest"
        eyebrow="Master Membership Plan"
        title="Everything above, held in four categories."
        lede="Every zone, every hill, every function on this page sits inside the same four ownership categories. This is the master plan — the deck that ties the estate to the share."
      />
    </>
  );
}
