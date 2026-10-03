import { cn } from "@/lib/utils";

/**
 * The homepage band under the banner: one line — set in admin → Website
 * content → Homepage banner — scrolling endlessly, with the Aven mark between
 * repeats. The track holds the line twice so the -50% loop is seamless.
 */
export function WellnessLine({ text, bangla = false }: { text: string; bangla?: boolean }) {
  const line = text.trim() || "Country's first wellness & retreat based resort";
  const repeats = Array.from({ length: 4 });
  return (
    <section aria-label={line} className="relative overflow-hidden bg-forest-950 py-10 sm:py-14">
      <div className="bg-leaf-swirl-light absolute inset-0" aria-hidden="true" />
      <div className="relative [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="animate-marquee flex w-max items-center hover:[animation-play-state:paused]" aria-hidden="true">
          {[0, 1].map((copy) => (
            <p key={copy} className="flex shrink-0 items-center">
              {repeats.map((_, i) => (
                <span key={i} className="flex items-center">
                  <span
                    className={cn(
                      "whitespace-nowrap px-6 text-cream-50 sm:px-10",
                      bangla ? "font-bangla text-3xl font-semibold sm:text-5xl" : "font-display text-4xl italic sm:text-6xl",
                    )}
                  >
                    {line}
                  </span>
                  {/* The Aven mark, drawn in gold through its own silhouette */}
                  <span className="h-6 w-[1.85rem] shrink-0 bg-gold-400 [mask:url(/brand/aven-mark.png)_center/contain_no-repeat] sm:h-9 sm:w-11" />
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
