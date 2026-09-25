/**
 * Global site configuration: brand, contact details and navigation.
 *
 * Source of truth: `Aven_Tea_Empire Hill (1).pdf` (project details) and the
 * AVEN RESORT identity in the `UI Design` mockups.
 */

export const site = {
  name: "AVEN Tea Empire",
  company: "AVEN Ltd.",
  shortName: "AVEN",
  tagline: "Nature. Luxury. Lasting Value.",
  motto: "The Avenue to Create Future",
  description:
    "A 5-star eco-luxury resort across five tea hills in Srimangal, Bangladesh — offered to investors as fractional ownership with registered land title.",
  location: {
    area: "Srimangal, Moulvibazar",
    country: "Bangladesh",
    label: "Srimangal, Moulvibazar, Bangladesh",
  },
  contact: {
    phone: "+880 1716 249448",
    phoneHref: "tel:+8801716249448",
    email: "aenltd.bd@gmail.com",
    emailHref: "mailto:aenltd.bd@gmail.com",
    headOffice:
      "6-A, House 121/5, New Eskaton, Ramna, Dhaka-1000, Bangladesh",
    hours: "Sun – Thu, 9:00 AM – 6:00 PM",
  },
  social: [
    { label: "Facebook", href: "#", icon: "facebook" },
    { label: "Instagram", href: "#", icon: "instagram" },
    { label: "YouTube", href: "#", icon: "youtube" },
    { label: "LinkedIn", href: "#", icon: "linkedin" },
  ],
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
    description: "Membership deck, share calculator & payment plans",
  },
  {
    label: "Wellness",
    href: "/wellness",
    description: "Eleven services across the spa hill",
  },
  {
    label: "Masterplan",
    href: "/masterplan",
    description: "20+ zones across 14 acres, in 3D",
  },
  {
    label: "Accommodations",
    href: "/accommodations",
    description: "40 suites and 12 terraced villas",
  },
  {
    label: "Experiences",
    href: "/experiences",
    description: "Water, culture and events",
  },
  { label: "Gallery", href: "/gallery", description: "Every render" },
  { label: "About", href: "/about", description: "Who AVEN is" },
  { label: "Contact", href: "/contact", description: "Speak to the team" },
];

/** Primary call to action used across the site. This is an investor site, not a booking engine. */
export const primaryCta = {
  label: "Request Details",
  href: "/contact",
} as const;
