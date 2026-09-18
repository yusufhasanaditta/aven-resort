import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { GalleryMasonry } from "@/components/sections/GalleryMasonry";
import { gallery } from "@/data/gallery";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Every render of Aven Tea Empire — the masterplan, the hanging bridge, the terraced villas, the eco-lake, the spa courtyard and the wedding amphitheatre.",
};

export default function GalleryPage() {
  return (
    <>
      <Hero
        eyebrow="Gallery"
        title="The Estate,"
        titleAccent="Render by Render"
        lede="Architectural impressions of every zone — from the lit bridge across the valley to the tasting bar among the tea bushes."
        image="/renders/villa-terrace-sunset.jpg"
        imageAlt="A villa terrace with infinity pool overlooking the tea hills at sunset"
        height="short"
        leaves={false}
        facts={[{ value: String(gallery.length), label: "Renders" }]}
      />

      <GalleryMasonry />
    </>
  );
}
