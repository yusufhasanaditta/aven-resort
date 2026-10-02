/**
 * Global site configuration: brand, contact details and navigation.
 *
 * Source of truth: the AVEN Eco Luxury Resort & Wellness brochure in
 * `new ui design/` (cover, welcome page and back cover), which supersedes the
 * earlier "Aven Tea Empire" deck for brand, address and contact details.
 */

export const site = {
  name: "AVEN Eco Luxury Resort & Wellness",
  company: "Aven Limited",
  shortName: "AVEN",
  tagline: "Avenue Towards Self",
  motto: "Let's make the empire together.",
  description:
    "An eco-luxury resort and wellness retreat in the tea hills of Sreemangal, Bangladesh — offered as fractional share ownership with Saf-Kabla registered land title.",
  location: {
    area: "Radhanagar, Sreemangal",
    country: "Bangladesh",
    label: "Radhanagar, Sreemangal, Bangladesh",
    full: "Begunbari, Radhanagar, Sreemangal, Moulvibazar-3210",
    /** Google Maps pin for the resort. */
    mapUrl: "https://share.google/XKsKUXYUTOqH4CB32",
  },
  contact: {
    phone: "+880 1619-788921",
    phoneHref: "tel:+8801619788921",
    email: "info.avenlimited@gmail.com",
    emailHref: "mailto:info.avenlimited@gmail.com",
    headOffice:
      "Level 6/A, ADD Aotowa Centre, 121/5 New Eskaton (Jame Mashjid Road), Ramna, Dhaka-1000",
    hours: "Sun – Thu, 9:00 AM – 6:00 PM",
    website: "avenlimited.com",
  },
  social: [
    { label: "Facebook", href: "#", icon: "facebook" },
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "YouTube", href: "#", icon: "youtube" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
  ],
} as const;

/** Headline project facts, from the brochure's Bengali fact sheet. */
export const projectFacts = {
  /** Total project land: 5 acres = 500 decimal ≈ 15.15 bigha (33 decimal per bigha). */
  landAcres: "5",
  landBigha: "15.15",
  landDecimal: "500",
  landSqft: "2,17,800",
  totalShares: 2700,
  timelineMonths: 36,
  amenities: 20,
  /** 140 rooms in all: 100 in the main hotel, and 20 villas of two rooms each. */
  totalRooms: 140,
  hotelRooms: 100,
  villas: 20,
  roomsPerVilla: 2,
  villaRooms: 40,
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
};

export const navigation: NavItem[] = [
  { label: "Home", href: "/", description: "The vision, at a glance" },
  {
    label: "Ownership",
    href: "/ownership",
    description: "Five membership plans, calculator & payment",
  },
  {
    label: "Wellness",
    href: "/wellness",
    description: "Eleven therapies — Aven cares for you",
  },
  {
    label: "Amenities",
    href: "/amenities",
    description: "20 features, from library to helipad",
  },
  {
    label: "Stay",
    href: "/accommodations",
    description: "140 rooms: a 100-room hotel and 20 private-pool villas",
  },
  {
    label: "Masterplan",
    href: "/masterplan",
    description: "The estate, in 3D",
  },
  { label: "Gallery", href: "/gallery", description: "Every render" },
  { label: "About", href: "/about", description: "Who Aven is" },
  { label: "Contact", href: "/contact", description: "Speak to the team" },
];

/** Primary call to action used across the site. This is an investor site, not a booking engine. */
export const primaryCta = {
  label: "Request Details",
  href: "/contact",
} as const;
