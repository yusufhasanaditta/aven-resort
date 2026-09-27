import Image from "next/image";
import Link from "next/link";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { amenities } from "@/data/amenities";
import { cn } from "@/lib/utils";

/** Four greens from the tea terraces, checkerboarded like the brochure page. */
const greens = [
  "from-[#3F7F52] to-[#1F4F36]",
  "from-[#6E9E5E] to-[#3D7249]",
  "from-[#2E6A4A] to-[#163F2D]",
  "from-[#8CAE6B] to-[#557F4C]",
];

/** Rolling hills with tea rows and a sprig of leaves — the illustration behind every tile. */
function Greenery() {
  return (
    <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
      <path d="M0 112c30-18 62-24 96-12s70 10 104-8v58H0Z" fill="white" fillOpacity=".07" />
      <path d="M0 128c40-14 78-14 116-2s58 6 84-4v28H0Z" fill="white" fillOpacity=".09" />
      <g stroke="white" strokeOpacity=".14" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M-4 124c34-12 70-12 104 0s66 12 104 0" />
        <path d="M-4 134c34-10 70-10 104 0s66 10 104 0" />
        <path d="M-4 144c34-8 70-8 104 0s66 8 104 0" />
      </g>
      <g fill="white" fillOpacity=".12">
        <path d="M170 34c10-12 24-14 30-12-2 8-12 20-30 12Z" />
        <path d="M168 46c12-4 24 2 28 8-8 4-22 2-28-8Z" />
        <path d="M18 20c-8-10-20-12-26-10 2 7 11 17 26 10Z" />
      </g>
      <path d="M170 34c-8 10-10 26-6 40M168 46c-2 4-3 8-3 12" stroke="white" strokeOpacity=".14" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/**
 * The brochure's "Site Zoning & Functions" board, in greens: each amenity is
 * a small illustrated tile of tea hills with a white pictogram. Hovering a
 * tile develops its photograph underneath, like a print coming up in a tray.
 */
export function AmenityTiles({ className }: { className?: string }) {
  return (
    <RevealGroup
      amount={0.05}
      className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5", className)}
    >
      {amenities.map((a, i) => {
        const row = Math.floor(i / 5);
        const shade = greens[(i + row) % greens.length];
        return (
          <RevealItem key={a.id}>
            <Link
              href={`/amenities#${a.id}`}
              className={cn(
                "group relative flex aspect-[1.32] flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] ring-1 ring-black/5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
                shade,
              )}
            >
              <Greenery />
              {a.image && (
                <>
                  <Image
                    src={a.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 18vw, (min-width: 640px) 24vw, 48vw"
                    className="scale-110 object-cover opacity-0 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-100 group-hover:opacity-100"
                  />
                  <span className="absolute inset-0 bg-forest-950/55 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                </>
              )}
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25 backdrop-blur-[2px] transition-transform duration-500 group-hover:-translate-y-1 sm:h-16 sm:w-16">
                <AmenityIcon icon={a.icon} className="h-8 w-8 text-white drop-shadow-sm sm:h-9 sm:w-9" />
              </span>
              <span className="relative mt-2.5 px-2 text-[0.8125rem] font-semibold text-cream-50 drop-shadow-sm sm:text-sm">
                {a.name}
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
