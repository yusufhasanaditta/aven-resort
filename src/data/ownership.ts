/**
 * Fractional ownership: the four categories and what each share carries.
 *
 * Transcribed from the "Your Ownership" and "4 Categories of Ownership" pages
 * of `Aven_Tea_Empire Hill (1).pdf`. The deck prints "Contact for <category>"
 * in place of a price, so no figures are shown here — enquiry is the CTA.
 */

export type OwnershipTier = {
  id: string;
  name: string;
  subtitle: string;
  unitShare: string;
  freeStay: string;
  discount: string;
  featured: boolean;
  accent: string;
};

export const ownershipTiers: OwnershipTier[] = [
  {
    id: "executive",
    name: "Executive",
    subtitle: "Enter the community",
    unitShare: "1 – 2 unit shares",
    freeStay: "2 nights / 3 days",
    discount: "Regular price",
    featured: false,
    accent: "#6B7B74",
  },
  {
    id: "premium",
    name: "Premium",
    subtitle: "Greater returns, more benefits",
    unitShare: "3 – 4 unit shares",
    freeStay: "5 nights / 6 days",
    discount: "15% discount",
    featured: true,
    accent: "#0E4D38",
  },
  {
    id: "platinum",
    name: "Platinum",
    subtitle: "Premium lifestyle, higher returns",
    unitShare: "5 – 9 unit shares",
    freeStay: "9 nights / 10 days",
    discount: "20% discount",
    featured: false,
    accent: "#8A8F98",
  },
  {
    id: "royal",
    name: "Royal",
    subtitle: "Maximum returns, exclusive perks",
    unitShare: "10 & above unit shares",
    freeStay: "18 nights / 19 days",
    discount: "30% discount",
    featured: false,
    accent: "#C9A227",
  },
];

/** What every owner receives, regardless of category. */
export const ownershipBenefits = [
  {
    id: "land",
    title: "Saf-Kabla Land",
    description:
      "Registered land ownership documents, for complete legal peace of mind.",
    icon: "document",
  },
  {
    id: "hotel",
    title: "Hotel Ownership",
    description:
      "Direct fractional ownership in the entire hotel establishment — not a room, the business.",
    icon: "building",
  },
  {
    id: "dividends",
    title: "Annual Dividends",
    description:
      "Your share of profits from room stays, dining and resort activities.",
    icon: "chart",
  },
  {
    id: "resale",
    title: "Flexible Resale",
    description:
      "Transfer or sell your shares at any time, with projected capital gains.",
    icon: "exchange",
  },
  {
    id: "lifetime",
    title: "Lifetime Investment",
    description: "A lifetime halal income source, structured for generations.",
    icon: "infinity",
  },
  {
    id: "community",
    title: "Elite Community",
    description:
      "Entry into a business community of successful investors behind the project.",
    icon: "users",
  },
  {
    id: "stay",
    title: "Free Stay",
    description:
      "Two days per unit, every year — scaling with the size of your holding.",
    icon: "key",
  },
  {
    id: "discount",
    title: "Year-Round Discount",
    description:
      "40% to 50% off accommodation across the year, on top of your category discount.",
    icon: "tag",
  },
];

/** The investment case, from "Why Invest Now". */
export const investmentCase = {
  headline: "Own a Share of Bangladesh's Next Iconic Tea Resort",
  body: "Aven Tea Empire is structured for fractional ownership and unit sales — designed for high-yield hospitality returns, capital appreciation and lifestyle privileges. Dual road access, island hotel USP and eco-tourism positioning ensure year-round demand from weddings, MICE, wellness and domestic luxury travel.",
  reasons: [
    {
      title: "No true eco-luxury competition",
      detail:
        "Srimangal draws the country's tea tourism, but nothing in the region is positioned as 5-star eco-luxury.",
    },
    {
      title: "Scarcity paired with scale",
      detail:
        "10–12 limited villas alongside 60 keys — enough inventory to operate profitably, few enough to stay exclusive.",
    },
    {
      title: "Multiple revenue streams",
      detail:
        "Rooms, food & beverage, events, wellness and eco-experiences, so no single season carries the asset.",
    },
    {
      title: "ESG-aligned from the ground up",
      detail:
        "Organic farm, rainwater harvesting and a protected bird sanctuary built into the masterplan.",
    },
  ],
} as const;

/** Demand drivers used on the ownership page. */
export const demandDrivers = [
  {
    label: "Destination weddings",
    detail: "Event lawn, amphitheatre and bridal suites",
  },
  {
    label: "MICE & corporate retreats",
    detail: "200+ pax conference hall, demand from Dhaka & Sylhet",
  },
  {
    label: "Wellness travel",
    detail: "Hammam, Thai spa, Ayurveda, yoga pavilion",
  },
  {
    label: "Domestic luxury travel",
    detail: "Year-round tea-country demand",
  },
];
