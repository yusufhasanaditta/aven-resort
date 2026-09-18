"use client";

import { Container } from "@/components/ui/Section";
import { Reveal, RevealWords } from "@/components/ui/Reveal";
import { ParallaxImage } from "@/components/ui/ParallaxImage";

/**
 * Full-bleed pull quote over a parallax render — the breathing space between
 * the data-dense sections.
 */
export function VisionStatement({
  quote,
  attribution,
  image,
  imageAlt,
}: {
  quote: string;
  attribution: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="relative">
      <ParallaxImage
        src={image}
        alt={imageAlt}
        className="min-h-[70svh] w-full"
        distance={10}
        sizes="100vw"
        overlay={
          <>
            <div className="absolute inset-0 bg-forest-950/55" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" />
          </>
        }
      />

      <div className="absolute inset-0 flex items-center">
        <Container>
          <blockquote className="max-w-4xl">
            <p className="font-display text-display-lg italic text-balance text-cream-50">
              <RevealWords text={`“${quote}”`} />
            </p>
            <Reveal delay={0.25}>
              <footer className="mt-8 text-eyebrow text-gold-400">
                — {attribution}
              </footer>
            </Reveal>
          </blockquote>
        </Container>
      </div>
    </section>
  );
}
