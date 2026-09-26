import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Hind_Siliguri, Inter } from "next/font/google";
import { site } from "@/data/site";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HideOn } from "@/components/layout/HideOn";
import { getContent } from "@/lib/cms";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

// The brochure's fact sheet is in Bengali; Hind Siliguri keeps it legible
// beside Inter without leaning on whatever Bengali fallback the OS has.
const bangla = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  variable: "--font-bangla",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://avenlimited.com"),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · AVEN`,
  },
  description: site.description,
  keywords: [
    "Aven Eco Luxury Resort",
    "Aven Limited",
    "Sreemangal resort",
    "wellness retreat Bangladesh",
    "eco-luxury Bangladesh",
    "fractional ownership resort",
    "Moulvibazar tea resort",
    "hotel investment Bangladesh",
  ],
  openGraph: {
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    type: "website",
    locale: "en_US",
    siteName: site.name,
    images: [{ url: "/renders/hanging-bridge-dusk.jpg", width: 1170, height: 827 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    images: ["/renders/hanging-bridge-dusk.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0e4d38",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const announcement = await getContent("announcement");
  const showAnnouncement = announcement.enabled && !!announcement.text.trim();

  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${bangla.variable}${showAnnouncement ? " has-announcement" : ""}`}
    >
      <body className="min-h-screen antialiased">
        <HideOn prefixes={["/admin"]}>
          <SmoothScroll />
        </HideOn>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-forest-600 focus:px-5 focus:py-2.5 focus:text-sm focus:font-medium focus:text-cream-50"
        >
          Skip to content
        </a>
        <HideOn prefixes={["/admin"]}>
          <Header announcement={showAnnouncement ? announcement : null} />
        </HideOn>
        <main id="main">{children}</main>
        <HideOn prefixes={["/admin"]}>
          <Footer />
        </HideOn>
      </body>
    </html>
  );
}
