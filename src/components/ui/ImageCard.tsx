"use client";

import Image from "next/image";
import Link from "next/link";
import { TiltCard, Depth } from "./TiltCard";
import { ArrowRight } from "./Button";
import { cn } from "@/lib/utils";

/**
 * The workhorse card: an image plate under a copy block, on a tilting surface.
 * Text and badge are pushed forward on Z so they separate from the photograph
 * as the card rotates.
 */
export function ImageCard({
  image,
  title,
  eyebrow,
  description,
  meta,
  href,
  ratio = "portrait",
  className,
}: {
  image: string;
  title: string;
  eyebrow?: string;
  description?: string;
  meta?: string[];
  href?: string;
  ratio?: "portrait" | "landscape" | "square";
  className?: string;
}) {
  const ratios = {
    portrait: "aspect-3/4",
    landscape: "aspect-4/3",
    square: "aspect-square",
  };

  const body = (
    <TiltCard
      className={cn("group h-full", className)}
      innerClassName="h-full rounded-2xl bg-cream-50 shadow-lift ring-1 ring-forest-600/8 transition-shadow duration-500 group-hover:shadow-float"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl">
        <div className={cn("relative overflow-hidden", ratios[ratio])}>
          <Image
            src={image}
            alt={title}
            fill
            sizes="(min-width: 1280px) 24rem, (min-width: 768px) 40vw, 82vw"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-950/55 via-transparent to-transparent opacity-80" />

          {eyebrow && (
            <Depth z={34} className="absolute left-4 top-4">
              <span className="rounded-full bg-cream-50/92 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-forest-700 backdrop-blur">
                {eyebrow}
              </span>
            </Depth>
          )}
        </div>

        <Depth z={22} className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-2xl leading-tight text-forest-900">
            {title}
          </h3>
          {description && (
            <p className="mt-2 line-clamp-3 text-pretty text-[0.8125rem] leading-relaxed text-forest-900/60">
              {description}
            </p>
          )}
          {meta && meta.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-1.5">
              {meta.map((m) => (
                <li
                  key={m}
                  className="text-[0.6875rem] font-medium uppercase tracking-wider text-forest-600/65"
                >
                  {m}
                </li>
              ))}
            </ul>
          )}
          {href && (
            <span className="mt-5 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-forest-700">
              Explore
              <ArrowRight />
            </span>
          )}
        </Depth>
      </div>
    </TiltCard>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {body}
    </Link>
  ) : (
    body
  );
}
