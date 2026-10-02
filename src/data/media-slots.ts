/**
 * Every website image the admin Media library can replace, with the built-in
 * render each falls back to. Pages read these through `getAsset(key)`, so a
 * replacement shows on the live page right away. The homepage banner image is
 * edited with its headline under Website content → Homepage banner.
 */
export type MediaSlot = { key: string; label: string; page: string; fallback: string };

export const mediaSlots: MediaSlot[] = [
  { key: "about.hero", label: "About — top banner", page: "/about", fallback: "/renders/main-hotel-aerial.jpg" },
  { key: "about.story", label: "About — story photo", page: "/about", fallback: "/renders/bridge-valley-restaurant.jpg" },
  { key: "about.banner", label: "About — closing banner", page: "/about", fallback: "/renders/eco-villa-sunrise.jpg" },
  { key: "ownership.hero", label: "Ownership — top banner", page: "/ownership", fallback: "/renders/eco-villa-sunrise.jpg" },
  { key: "own-your-share.hero", label: "Own your share — top banner", page: "/own-your-share", fallback: "/renders/masterplan-aerial.jpg" },
  { key: "wellness.hero", label: "Wellness — top banner", page: "/wellness", fallback: "/renders/yoga-tea-garden.jpg" },
  { key: "wellness.banner", label: "Wellness — closing banner", page: "/wellness", fallback: "/renders/barefoot-earthing.jpg" },
  { key: "amenities.hero", label: "Amenities — top banner", page: "/amenities", fallback: "/renders/hanging-bridge-night.jpg" },
  { key: "accommodations.hero", label: "Stay — top banner", page: "/accommodations", fallback: "/renders/hotel-facade.jpg" },
  { key: "accommodations.banner", label: "Stay — closing banner", page: "/accommodations", fallback: "/renders/villas-aerial-topdown.jpg" },
  { key: "gallery.hero", label: "Gallery — top banner", page: "/gallery", fallback: "/renders/villa-terrace-sunset.jpg" },
  { key: "contact.hero", label: "Contact — top banner", page: "/contact", fallback: "/renders/glass-tea-restaurant.jpg" },
  { key: "contact.map", label: "Contact — location map", page: "/contact", fallback: "/brochure/location-map-aven.jpg" },
  { key: "careers.hero", label: "Careers — top banner", page: "/careers", fallback: "/renders/tea-house-lounge.jpg" },
  { key: "interest.image", label: "Register interest — photo", page: "/interest", fallback: "/renders/eco-villa-sunrise.jpg" },
];

export const mediaSlot = (key: string) => mediaSlots.find((s) => s.key === key);
