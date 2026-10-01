import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { GalleryMasonry } from "@/components/sections/GalleryMasonry";
import { getAsset, getContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Every render of Aven Eco Luxury Resort — the masterplan, the hanging bridge, the terraced villas, the eco-lake, the spa courtyard and the wedding amphitheatre.",
};

export default async function GalleryPage() {
  const [gallery, heroImage, pg] = await Promise.all([getContent("gallery"), getAsset("gallery.hero"), getContent("pages")]);
  return (
    <>
      <Hero
        eyebrow={pg.galleryEyebrow}
        title={pg.galleryTitle}
        titleAccent={pg.galleryAccent}
        lede={pg.galleryLede}
        image={heroImage}
        imageAlt="A villa terrace with infinity pool overlooking the tea hills at sunset"
        height="short"
        leaves={false}
        facts={[{ value: String(gallery.length), label: "Renders" }]}
      />

      <GalleryMasonry items={gallery} />
    </>
  );
}
