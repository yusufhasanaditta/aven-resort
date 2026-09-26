import Image from "next/image";
import Link from "next/link";
import { wellnessServices } from "@/data/wellness";

const mantra = [
  "Avenue towards self",
  "Retreat, don't escape",
  "Body & mind",
  "A stronger self",
  "A passionate self",
  "A peaceful self",
];

/**
 * The homepage "wellness line": an endless two-row ticker. The top row
 * carries the nine therapies with a photo bead between each; the bottom row
 * runs the other way with the brochure's retreat mantra. Each track holds its
 * content twice so the -50% loop is seamless.
 */
export function WellnessLine() {
  return (
    <section
      aria-label="Wellness therapies at Aven"
      className="relative overflow-hidden bg-forest-950 py-10 sm:py-14"
    >
      <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {wellnessServices.map((w) => (
                <li key={w.id} className="flex items-center">
                  <Link
                    href={`/wellness#${w.id}`}
                    tabIndex={copy === 1 ? -1 : undefined}
                    className="group flex items-center gap-5 px-5 sm:gap-7 sm:px-7"
                  >
                    <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-gold-400/40 transition-transform duration-500 group-hover:scale-125 sm:h-14 sm:w-14">
                      <Image src={w.image} alt="" fill sizes="56px" className="object-cover" />
                    </span>
                    <span className="whitespace-nowrap font-display text-4xl italic text-cream-50 transition-colors duration-300 group-hover:text-gold-300 sm:text-6xl">
                      {w.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>

        <div className="animate-marquee-reverse mt-6 flex w-max items-center sm:mt-8">
          {[0, 1].map((copy) => (
            <p key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {[...mantra, ...mantra].map((m, i) => (
                <span
                  key={i}
                  className="flex items-center gap-6 whitespace-nowrap px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.32em] text-gold-400/80 sm:text-xs"
                >
                  {m}
                  <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-cream-50/30" aria-hidden="true">
                    <path d="M6 0c1 3 3 5 6 6-3 1-5 3-6 6-1-3-3-5-6-6 3-1 5-3 6-6Z" fill="currentColor" />
                  </svg>
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
