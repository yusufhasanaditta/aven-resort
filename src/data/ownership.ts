/**
 * Fractional ownership: the membership plans and what every share carries.
 *
 * Plans and pricing are transcribed from the "Share Price & Membership
 * Chart" in `new ui design/share price and membership chart/` (valid until
 * 30 September 2026). Each plan is priced two ways per share: an installment
 * price (a down payment, then equal monthly installments) and a lower
 * full-payment price. Plan names follow Aven's naming: the chart's "Silver"
 * (5 shares) is sold as Gold and its "Gold" (10 shares) as Platinum. The
 * chart's "Save" column is deliberately not shown anywhere on the site.
 */

export type OwnershipTier = {
  id: string;
  name: string;
  subtitle: string;
  minUnits: number;
  maxUnits: number | null;
  /** Free stay per year, in days, as the chart prints it. */
  freeStayDays: number;
  /** Per-share price when paying by installment. */
  installmentPriceBDT: number;
  /** Per-share price when paying in full. */
  fullPriceBDT: number;
  /** Down payment for the plan's package size (`minUnits` shares). */
  downPaymentBDT: number;
  /** Monthly installments after the down payment. */
  installmentCount: number;
  featured: boolean;
  accent: string;
  perk?: string;
};

/** Last day the chart's prices apply. */
export const PRICE_CHART_VALID_UNTIL = "30 September 2026";

export const ownershipTiers: OwnershipTier[] = [
  {
    id: "executive",
    name: "Executive",
    subtitle: "Enter the Aven community",
    minUnits: 1,
    maxUnits: 4,
    freeStayDays: 3,
    installmentPriceBDT: 350_000,
    fullPriceBDT: 320_000,
    downPaymentBDT: 100_000,
    installmentCount: 12,
    featured: false,
    accent: "#2E5A3F",
  },
  {
    id: "gold",
    name: "Gold",
    subtitle: "The most chosen plan",
    minUnits: 5,
    maxUnits: 9,
    freeStayDays: 10,
    installmentPriceBDT: 330_000,
    fullPriceBDT: 320_000,
    downPaymentBDT: 450_000,
    installmentCount: 15,
    featured: true,
    accent: "#A57A4B",
  },
  {
    id: "platinum",
    name: "Platinum",
    subtitle: "Premium lifestyle, a longer stay",
    minUnits: 10,
    maxUnits: 19,
    freeStayDays: 18,
    installmentPriceBDT: 320_000,
    fullPriceBDT: 300_000,
    downPaymentBDT: 1_000_000,
    installmentCount: 18,
    featured: false,
    accent: "#2B2B2B",
  },
  {
    id: "diamond",
    name: "Diamond",
    subtitle: "Almost a month in the hills, every year",
    minUnits: 20,
    maxUnits: 29,
    freeStayDays: 26,
    installmentPriceBDT: 300_000,
    fullPriceBDT: 280_000,
    downPaymentBDT: 1_500_000,
    installmentCount: 20,
    featured: false,
    accent: "#A33D3A",
  },
  {
    id: "royal",
    name: "Royal",
    subtitle: "100% villa ownership",
    minUnits: 30,
    maxUnits: null,
    freeStayDays: 35,
    installmentPriceBDT: 300_000,
    fullPriceBDT: 280_000,
    downPaymentBDT: 2_000_000,
    installmentCount: 24,
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
    description: "3 to 35 free days a year, by plan.",
    icon: "key",
  },
  {
    id: "installments",
    title: "Easy Installments",
    description: "A down payment, then 12 to 24 monthly installments.",
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
