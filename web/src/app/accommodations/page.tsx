import type { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/sections/Hero";
import { VisionStatement } from "@/components/sections/VisionStatement";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import {
  accommodationCollections,
  accommodations,
} from "@/data/accommodations";

export const metadata: Metadata = {
  title: "Accommodations",
  description:
    "Forty exclusive suites on Hill 2, ten to twelve terraced villas on Hill 3, and tree houses raised into the canopy — the accommodation product at Aven Tea Empire.",
};

export default function AccommodationsPage() {
  return (
    <>
      <Hero
        eyebrow="The product"
        title="Forty Suites."
        titleAccent="Twelve Villas. Five Hills."
        lede="Every key in the estate sits where the topography put it — the hotel on the highest point, the villas stepping down a slope, the nature stays lightest of all."
        image="/renders/hotel-facade.jpg"
        imageAlt="The main hotel building of Aven Tea Resort against the hills at golden hour"
        height="tall"
        facts={[
          { value: "40", label: "Exclusive suites" },
          { value: "10–12", label: "Terraced villas" },
          { value: "60", label: "Decimal plot" },
          { value: "17,400", label: "Sq ft built" },
        ]}
        actions={[{ label: "Enquire about ownership", href: "/contact" }]}
      />

      {accommodationCollections.map((collection, index) => {
        const items = accommodations.filter((a) => a.collection === collection);
        return (
          <Section
            key={collection}
            tone={index % 2 === 0 ? "cream" : "white"}
          >
            <Container>
              <Reveal className="max-w-2xl">
                <Eyebrow>{collection}</Eyebrow>
                <h2 className="mt-4 font-display text-display-md text-forest-900">
                  {collection === "Hotel" && "The main building, Hill 2"}
                  {collection === "Villas" && "Terraced down Hill 3"}
                  {collection === "Nature Stays" && "Into the canopy"}
                </h2>
              </Reveal>

              <div className="mt-12 space-y-16 lg:space-y-24">
                {items.map((item, i) => (
                  <Reveal key={item.id}>
                    <article
                      className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
                        i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                      }`}
                    >
                      <div className="group relative aspect-4/3 overflow-hidden rounded-3xl shadow-lift-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="(min-width: 1024px) 45vw, 92vw"
                          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                        />
                      </div>

                      <div>
                        <p className="text-eyebrow text-forest-600/60">
                          {item.hill}
                        </p>
                        <h3 className="mt-3 font-display text-display-sm text-balance text-forest-900">
                          {item.name}
                        </h3>
                        <p className="mt-2 font-display text-xl italic text-forest-600">
                          {item.tagline}
                        </p>
                        <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/65">
                          {item.description}
                        </p>

                        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-forest-600/12 pt-6 sm:grid-cols-4">
                          {item.specs.map((spec) => (
                            <div key={spec.label}>
                              <dt className="text-[0.625rem] uppercase tracking-[0.14em] text-forest-900/40">
                                {spec.label}
                              </dt>
                              <dd className="mt-1 text-sm font-semibold text-forest-800">
                                {spec.value}
                              </dd>
                            </div>
                          ))}
                        </dl>

                        <ul className="mt-6 flex flex-wrap gap-1.5">
                          {item.features.map((f) => (
                            <li
                              key={f}
                              className="rounded-full bg-forest-600/7 px-3 py-1.5 text-[0.75rem] text-forest-800/80"
                            >
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>
            </Container>
          </Section>
        );
      })}

      <VisionStatement
        quote="Each villa steps down the hill, ensuring privacy and view."
        attribution="Elite Living, Hill 3"
        image="/renders/villas-aerial-topdown.jpg"
        imageAlt="Top-down aerial view of the villa cluster with private pools among the tea"
      />

      <Section tone="cream">
        <Container>
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Ownership</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-forest-900">
              A share in the establishment, not a room.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Unit shares grant direct fractional ownership in the entire hotel
              establishment, with annual dividends drawn from rooms, dining and
              activities across every zone.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/ownership" size="lg">
                Ownership categories
                <ArrowRight />
              </Button>
              <Button href="/contact" variant="secondary" size="lg">
                Speak to the team
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
