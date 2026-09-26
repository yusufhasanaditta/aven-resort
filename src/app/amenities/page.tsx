import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { Button, ArrowRight } from "@/components/ui/Button";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { amenities, amenityGroups, watchDeck, type Amenity, type AmenityGroupId } from "@/data/amenities";
import { wellnessServices } from "@/data/wellness";
import { cn } from "@/lib/utils";
import { getAsset } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Amenities",
  description:
    "The 20 features and amenities of Aven Eco Luxury Resort & Wellness — luxury hotel, villas, infinity pool, wellness, restaurant, library, tree house, cloud walkway, kayaking dock, turf, helipad and more. Every shareholder owns a fraction of each.",
};

/** Grid shape per spread, echoing the brochure's poster layouts. */
const layouts: Record<AmenityGroupId, string> = {
  stay: "lg:grid-cols-3",
  wellness: "lg:grid-cols-3",
  dining: "lg:grid-cols-3",
  gatherings: "sm:grid-cols-2 lg:grid-cols-4",
  adventure: "lg:grid-cols-3",
  family: "lg:grid-cols-3",
  arrival: "lg:grid-cols-2",
};

type Panel = Pick<Amenity, "name" | "description" | "image"> & {
  id?: string;
  icon?: string;
  wide?: boolean;
  href?: string;
};

export default async function AmenitiesPage() {
  const heroImage = await getAsset("amenities.hero", "/renders/hanging-bridge-night.jpg");

  return (
    <>
      <Hero
        eyebrow="Site zoning & functions"
        title="Twenty Amenities."
        titleAccent="A Share of Every One."
        lede="Every shareholder holds fractional ownership of all the features and amenities of the resort, with Saf-Kabla land registration — from the library and tree house to the cloud walkway and helipad."
        image={heroImage}
        imageAlt="The cloud walkway lit gold, winding across the tea hills at dusk"
        height="tall"
        leaves={false}
        facts={[
          { value: "20", label: "Features & amenities" },
          { value: "7", label: "Zones of life" },
          { value: "1", label: "Private helipad" },
          { value: "100%", label: "Shareholder-owned" },
        ]}
      />

      {/* Icon index — every amenity, one tap away */}
      <nav
        aria-label="Amenity index"
        className="sticky top-[var(--header-height)] z-30 border-b border-forest-600/10 bg-cream-50/90 backdrop-blur-md"
      >
        <Container>
          <ul className="no-scrollbar -mx-2 flex gap-1 overflow-x-auto py-2.5">
            {amenities.map((a) => (
              <li key={a.id}>
                <a
                  href={`#${a.id}`}
                  className="group flex w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-xl px-1 py-1.5 text-center transition-colors hover:bg-[#C8B97F]/25"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#B3A272] text-white transition-transform duration-300 group-hover:-translate-y-0.5">
                    <AmenityIcon icon={a.icon} className="h-6 w-6" />
                  </span>
                  <span className="line-clamp-1 text-[0.625rem] font-medium text-forest-900/70">
                    {a.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </nav>

      {amenityGroups.map((group, gi) => {
        const panels: Panel[] = amenities
          .filter((a) => a.group === group.id)
          .map((a) => ({ ...a, href: a.id === "wellness" ? "/wellness" : undefined }));
        if (group.id === "adventure") {
          // Cloud Walkway gets the brochure's wide poster, with the Watch Deck beside it.
          const walkway = panels.find((p) => p.id === "cloud-walkway");
          if (walkway) walkway.wide = true;
          panels.push({ ...watchDeck, icon: "walkway" });
        }
        if (group.id === "wellness") {
          // Two of the therapies alongside, so the spread reads as the brochure's collage.
          for (const w of wellnessServices.filter((w) => w.id === "sound" || w.id === "reflexology")) {
            panels.push({ name: w.name, description: w.tagline, image: w.image, href: `/wellness#${w.id}` });
          }
        }

        return (
          <Section
            key={group.id}
            id={`zone-${group.id}`}
            tone={gi % 2 === 0 ? "white" : "cream"}
            className="scroll-mt-40 py-16 sm:py-20 lg:py-24"
          >
            <Container>
              <Reveal className="flex flex-wrap items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <p className="font-numeral text-sm text-forest-600/40">
                    {String(gi + 1).padStart(2, "0")} / {String(amenityGroups.length).padStart(2, "0")}
                  </p>
                  <Eyebrow className="mt-3">{group.eyebrow}</Eyebrow>
                  <h2 className="mt-3 font-display text-display-sm text-balance text-forest-900">
                    {group.title}
                  </h2>
                  <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
                    {group.lede}
                  </p>
                </div>
              </Reveal>

              <RevealGroup className={cn("mt-10 grid gap-4", layouts[group.id])}>
                {panels.map((p) => (
                  <RevealItem
                    key={p.name}
                    id={p.id}
                    className={cn("scroll-mt-44", p.wide && "lg:col-span-2")}
                  >
                    <PosterPanel panel={p} tall={!p.wide} />
                  </RevealItem>
                ))}
              </RevealGroup>
            </Container>
          </Section>
        );
      })}

      <Section tone="forest" className="overflow-hidden">
        <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
        <Container className="relative text-center">
          <Reveal className="mx-auto max-w-2xl">
            <Eyebrow tone="light">Own a share of all twenty</Eyebrow>
            <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
              One share. Every amenity.
            </h2>
            <p className="mt-5 text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">
              Whichever plan you hold, your share is in the whole resort — not a
              single room.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button href="/ownership" variant="light" size="lg">
                Choose a membership
                <ArrowRight />
              </Button>
              <Button href="/masterplan" variant="outline-light" size="lg">
                See the masterplan
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

/** One poster: photograph full-bleed, title and line of copy set over it, as in the brochure. */
function PosterPanel({ panel, tall }: { panel: Panel; tall: boolean }) {
  const body = panel.image ? (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        tall ? "aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4.2]" : "aspect-[16/10] lg:h-full lg:min-h-[22rem] lg:aspect-auto",
      )}
    >
      <Image
        src={panel.image}
        alt={panel.name}
        fill
        sizes={tall ? "(min-width: 1024px) 30vw, 95vw" : "(min-width: 1024px) 62vw, 95vw"}
        className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/75 via-forest-950/10 to-forest-950/40" />
      <div className="absolute inset-x-0 top-0 p-6 text-center sm:p-7">
        <h3 className="font-display text-3xl text-cream-50 sm:text-4xl">{panel.name}</h3>
        <p className="mx-auto mt-2 max-w-xs text-pretty text-[0.8125rem] leading-snug text-cream-100/85">
          {panel.description}
        </p>
      </div>
      {panel.href === "/wellness" && (
        <span className="absolute bottom-6 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-cream-50 px-5 py-2.5 text-sm font-medium text-forest-800">
          Explore the therapies <ArrowRight />
        </span>
      )}
    </div>
  ) : (
    // No photograph yet (the Prayer Space) — the brochure's gold tile, enlarged.
    <div className="bg-leaf-swirl flex aspect-[3/4] flex-col items-center justify-center rounded-3xl bg-[#C8B97F] p-8 text-center sm:aspect-[4/5] lg:aspect-[3/4.2]">
      <AmenityIcon icon={panel.icon ?? "hotel"} className="h-20 w-20 text-white" />
      <h3 className="mt-6 font-display text-3xl text-forest-950">{panel.name}</h3>
      <p className="mt-2 max-w-xs text-[0.8125rem] leading-snug text-forest-950/70">{panel.description}</p>
    </div>
  );

  return panel.href ? <Link href={panel.href} className="block h-full">{body}</Link> : body;
}
