import Image from "next/image";
import { Container } from "@/components/ui/Section";
import { Button, ArrowRight } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-forest-950">
      <Image
        src="/renders/nature-viewing-deck.jpg"
        alt=""
        fill
        className="object-cover opacity-35"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-forest-950/50" />

      <Container className="relative z-10 text-center">
        <p className="text-eyebrow text-gold-400">404</p>
        <h1 className="mt-5 font-display text-display-lg text-balance text-cream-50">
          This path doesn&rsquo;t cross the valley.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-cream-200/65">
          The page you were looking for isn&rsquo;t here. The masterplan,
          however, is.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/" variant="light" size="lg">
            Back to the estate
            <ArrowRight />
          </Button>
          <Button href="/masterplan" variant="outline-light" size="lg">
            Explore the masterplan
          </Button>
        </div>
      </Container>
    </section>
  );
}
