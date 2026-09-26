/**
 * Fractional ownership: the six membership plans and what every share carries.
 *
 * Transcribed from the "Membership Plans", "Why Own With Us?" and Bengali
 * fact-sheet pages of the AVEN brochure (`new ui design/`). The brochure
 * states share counts, discounts and free-stay days per plan but no unit
 * price — pricing is confirmed with the Aven team, and the calculator marks
 * its figures as indicative for that reason.
 */

export type OwnershipTier = {
  id: string;
  name: string;
  subtitle: string;
  minUnits: number;
  maxUnits: number | null;
  /** Free stay per year, in days, as the brochure prints it. */
  freeStayDays: number;
  /** Discount on the share price; 0 means regular price. */
  discountPercent: number;
  featured: boolean;
  accent: string;
  perk?: string;
};

export const ownershipTiers: OwnershipTier[] = [
  {
    id: "executive",
    name: "Executive",
    subtitle: "Enter the Aven community",
    minUnits: 1,
    maxUnits: 2,
    freeStayDays: 3,
    discountPercent: 0,
    featured: false,
    accent: "#2E5A3F",
  },
  {
    id: "silver",
    name: "Silver",
    subtitle: "A stronger stake, a longer stay",
    minUnits: 3,
    maxUnits: 4,
    freeStayDays: 6,
    discountPercent: 5,
    featured: false,
    accent: "#8C8D90",
  },
  {
    id: "gold",
    name: "Gold",
    subtitle: "The most chosen plan",
    minUnits: 5,
    maxUnits: 9,
    freeStayDays: 10,
    discountPercent: 10,
    featured: true,
    accent: "#A57A4B",
  },
  {
    id: "platinum",
    name: "Platinum",
    subtitle: "Premium lifestyle, higher returns",
    minUnits: 10,
    maxUnits: 19,
    freeStayDays: 18,
    discountPercent: 15,
    featured: false,
    accent: "#2B2B2B",
  },
  {
    id: "diamond",
    name: "Diamond",
    subtitle: "A month in the hills, every year",
    minUnits: 20,
    maxUnits: 29,
    freeStayDays: 30,
    discountPercent: 20,
    featured: false,
    accent: "#A33D3A",
  },
  {
    id: "royal",
    name: "Royal",
    subtitle: "100% villa ownership",
    minUnits: 30,
    maxUnits: null,
    freeStayDays: 30,
    discountPercent: 28,
    featured: false,
    accent: "#1F1C3D",
    perk: "100% Villa Ownership",
  },
];

/** "Why Own With Us?" — what every share carries, regardless of plan. */
export const ownershipBenefits = [
  {
    id: "land",
    title: "Saf-Kabla Land",
    description: "Registered land ownership.",
    icon: "document",
  },
  {
    id: "hotel",
    title: "Hotel Ownership",
    description: "Fractional ownership in the entire hotel & resort.",
    icon: "building",
  },
  {
    id: "profits",
    title: "Annual Profits",
    description: "Earn your share of profits from room stays, dining, and activities.",
    icon: "chart",
  },
  {
    id: "resale",
    title: "Flexible Resale",
    description: "Transfer or sell your shares at any time with projected capital gains.",
    icon: "exchange",
  },
  {
    id: "lifetime",
    title: "Lifetime Investment",
    description: "A lifetime halal income source.",
    icon: "infinity",
  },
  {
    id: "community",
    title: "Community",
    description: "Entry into an elite business community of successful investors.",
    icon: "users",
  },
  {
    id: "stay",
    title: "Free Stay",
    description: "Yearly 3 days per unit.",
    icon: "key",
  },
  {
    id: "discount",
    title: "Discount",
    description: "40% to 50% off accommodation all over the year.",
    icon: "tag",
  },
];

/** The two lists on the brochure's Bengali fact sheet, with English alongside. */
export const shareOwnership = [
  { en: "Saf-Kabla land ownership", bn: "সাফ কাবলা জমির মালিকানা" },
  { en: "Ownership of the hotel & resort", bn: "হোটেল অ্যান্ড রিসোর্টের মালিকানা" },
  { en: "Annual halal income", bn: "বাৎসরিক হালাল আয়" },
  { en: "Sell or transfer with profit", bn: "লাভসহ বিক্রি ও হস্তান্তরের সুযোগ" },
  { en: "Free holiday stays", bn: "ফ্রি অবকাশ যাপন" },
];

export const businessModel = [
  { en: "Room & villa booking", bn: "রুম ও ভিলা বুকিং", icon: "villa" },
  { en: "Events & conference", bn: "ইভেন্ট ও কনফারেন্স", icon: "conference" },
  { en: "Wellness & retreat", bn: "ওয়েলনেস এন্ড রিট্রিট", icon: "wellness" },
  { en: "Restaurant & more", bn: "রেস্টুরেন্ট ও অন্যান্য", icon: "restaurant" },
  { en: "Organic farm", bn: "অর্গানিক ফার্ম", icon: "farm" },
];
