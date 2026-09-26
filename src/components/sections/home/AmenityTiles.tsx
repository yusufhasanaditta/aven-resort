import Image from "next/image";
import Link from "next/link";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { amenities } from "@/data/amenities";
import { cn } from "@/lib/utils";

/**
 * The brochure's "Site Zoning & Functions" board: twenty gold tiles in two
 * alternating shades, a white pictogram on each. Hovering a tile develops its
 * photograph underneath, like a print coming up in a tray.
 */
export function AmenityTiles({ className }: { className?: string }) {
  return (
    <RevealGroup
      amount={0.05}
      className={cn("grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-5", className)}
    >
      {amenities.map((a, i) => {
        // Checkerboard the two golds the way the brochure page does.
        const row = Math.floor(i / 5);
        const light = (i + row) % 2 === 1;
        return (
          <RevealItem key={a.id}>
            <Link
              href={`/amenities#${a.id}`}
              className={cn(
                "group relative flex aspect-[1.32] flex-col items-center justify-center overflow-hidden rounded-xl text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1",
                light ? "bg-[#C8B97F]" : "bg-[#B3A272]",
              )}
            >
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
              <AmenityIcon
                icon={a.icon}
                className="relative h-10 w-10 text-white drop-shadow-sm transition-transform duration-500 group-hover:-translate-y-1 sm:h-12 sm:w-12"
              />
              <span className="relative mt-2.5 px-2 text-[0.8125rem] font-semibold text-forest-950/85 transition-colors duration-500 group-hover:text-cream-50 sm:text-sm">
                {a.name}
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );
}
