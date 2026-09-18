/**
 * The 17 masterplan zones.
 *
 * Every land figure here is transcribed verbatim from
 * `Aven_Tea_Empire Hill (1).pdf`. Zones the deck lists on the zoning plan but
 * does not give a separate allocation for carry `land: null` — we deliberately
 * do not invent numbers for an investor-facing page.
 *
 * `position` / `hill` drive the interactive 3D masterplan in
 * `components/three/MasterplanScene.tsx`.
 */

export type ZoneCategory =
  | "hospitality"
  | "wellness"
  | "nature"
  | "infrastructure";

export type ZoneLand = {
  /** Decimals of land allocated. 1 decimal = 435.6 sq ft. */
  decimals: number;
  /** Square feet, as printed in the deck. */
  sqft: number;
  /** Share of the 360-decimal development & investment area. */
  percent: number;
  /** Adjacent landscape buffer, where the deck states one. */
  buffer?: { decimals: number; sqft: number };
};

export type Zone = {
  id: string;
  number: number;
  name: string;
  hill: string;
  category: ZoneCategory;
  /** Zone type as classified in the deck, e.g. "Built-Up", "Water". */
  zoneType: string;
  tagline: string;
  description: string;
  highlights: string[];
  land: ZoneLand | null;
  image: string;
  /** Position on the 3D masterplan, in world units [x, z]. */
  position: [number, number];
};

export const zoneCategories: Record<
  ZoneCategory,
  { label: string; color: string; description: string }
> = {
  hospitality: {
    label: "Hospitality",
    color: "#0E4D38",
    description: "Rooms, villas, dining and the guest-facing core.",
  },
  wellness: {
    label: "Recreation & Wellness",
    color: "#C9A227",
    description: "Spa, pools, play and the amenity programme.",
  },
  nature: {
    label: "Nature & Eco-Tourism",
    color: "#7FA650",
    description: "Water, farm, trails and preserved topography.",
  },
  infrastructure: {
    label: "Infrastructure",
    color: "#6B7B74",
    description: "Access, parking, power and back of house.",
  },
};

export const zones: Zone[] = [
  {
    id: "entrance",
    number: 1,
    name: "Entrance & Gatehouse",
    hill: "Hill 1",
    category: "infrastructure",
    zoneType: "Infrastructure",
    tagline: "Arrival on the lower plateau",
    description:
      "The resort opens on Hill 1, the lowest of the five tillas, where the gatehouse and reception sit directly off the entrance road. Arrival is deliberately quiet — guests are received, then carried onward by buggy rather than driving into the estate.",
    highlights: [
      "Dual road access",
      "Security & check-in",
      "Buggy transfer to all zones",
      "Reception pavilion",
    ],
    land: null,
    image: "/renders/parking-ev-buggy.jpg",
    position: [-6, 9],
  },
  {
    id: "parking",
    number: 2,
    name: "Parking & Buggy Station",
    hill: "Hill 1",
    category: "infrastructure",
    zoneType: "Open / Eco",
    tagline: "Discreet, landscaped, EV-ready",
    description:
      "Shaded parking clusters at both entry nodes, screened by planting so vehicles never read against the tea. EV-ready throughout, with a buggy station serving every villa and the hotel.",
    highlights: [
      "Shaded bays",
      "EV charging",
      "Buggy station",
      "Security kiosk",
    ],
    land: {
      decimals: 12,
      sqft: 5227,
      percent: 3.3,
      buffer: { decimals: 20, sqft: 8712 },
    },
    image: "/renders/parking-ev-buggy.jpg",
    position: [-8, 11],
  },
  {
    id: "hanging-bridge",
    number: 3,
    name: "The Hanging Bridge",
    hill: "Hill 1 → Hill 2",
    category: "hospitality",
    zoneType: "Built-Up",
    tagline: "An architectural marvel between hills",
    description:
      "A 50-foot bridge spanning the valley between Hill 1 and Hill 2 — steel structure, teak decking, glass railings for unobstructed views. It offers a canopy-level walk above the tea bushes, with stairs down to the Signature Valley Restaurant nestled between the hills. At night the lighting turns the bridge into a golden floating line across the tillas.",
    highlights: [
      "50-foot span",
      "Teak deck & glass railings",
      "Canopy-level walk",
      "Night-lit golden line",
    ],
    land: { decimals: 30, sqft: 13068, percent: 8.34 },
    image: "/renders/hanging-bridge-dusk.jpg",
    position: [-7, 4],
  },
  {
    id: "valley-restaurant",
    number: 4,
    name: "Signature Valley Restaurant",
    hill: "Valley",
    category: "hospitality",
    zoneType: "Built-Up",
    tagline: "Dining in the fold between two hills",
    description:
      "Reached by stairs directly from the hanging bridge, the signature restaurant sits in the valley floor between Hill 1 and Hill 2 — a glass and timber pavilion cantilevered over the tea, open on every side to the slope.",
    highlights: [
      "Direct bridge access",
      "Glass & timber pavilion",
      "Valley-floor setting",
      "Indoor-outdoor service",
    ],
    land: null,
    image: "/renders/glass-tea-restaurant.jpg",
    position: [-4, 3],
  },
  {
    id: "hotel",
    number: 5,
    name: "Main Building — Luxury Hotel",
    hill: "Hill 2",
    category: "hospitality",
    zoneType: "Open / Luxury / Eco",
    tagline: "40 exclusive suites on the highest point",
    description:
      "A three-storey centrepiece on Hill 2, the highest point of the estate, chosen for commanding views in every direction. The top floor holds Presidential and Royal suites with private terraces and 180° tea garden views. Levels 1 and 2 carry executive rooms, the grand ballroom and the wellness spa with hill-view treatment rooms.",
    highlights: [
      "40 exclusive suites",
      "Presidential & Royal suites with private terraces",
      "Grand Ballroom, 200 pax",
      "Sloped roof, local stone + glass, deep overhangs",
    ],
    land: { decimals: 40, sqft: 17400, percent: 11.1 },
    image: "/renders/main-hotel-aerial.jpg",
    position: [-8, -4],
  },
  {
    id: "common-pool",
    number: 6,
    name: "Common Swimming Pool",
    hill: "Hill 2",
    category: "wellness",
    zoneType: "Built-Up",
    tagline: "Aquatic luxury over the tea estates",
    description:
      "Set on Hill 2 directly in front of the main building, with panoramic views across the tea gardens. The infinity edge faces south over the Sreemangal estates, with a dedicated shallow zone for children in natural stone finish.",
    highlights: [
      "Infinity edge facing south",
      "Kids' safe shallow zone",
      "Sunken pool bar",
      "Teak deck & hillside cabanas",
    ],
    land: { decimals: 15, sqft: 6534, percent: 4.1 },
    image: "/renders/common-pool-aerial.jpg",
    position: [-5.5, -6],
  },
  {
    id: "spa",
    number: 7,
    name: "Spa & Wellness",
    hill: "Hill 2",
    category: "wellness",
    zoneType: "Built-Up",
    tagline: "A holistic wellness sanctuary",
    description:
      "Turkish hammam, authentic Thai spa, Ayurveda, sauna and steam, with a yoga pavilion and meditation garden overlooking the bird sanctuary.",
    highlights: [
      "Turkish Hammam",
      "Thai Spa",
      "Ayurveda",
      "Sauna & Steam",
      "Yoga Pavilion",
    ],
    land: { decimals: 10, sqft: 4356, percent: 2.8 },
    image: "/renders/spa-wellness-courtyard.jpg",
    position: [-10, -7],
  },
  {
    id: "conference",
    number: 8,
    name: "Conference Hall",
    hill: "Hill 2 → Hill 3",
    category: "hospitality",
    zoneType: "Built-Up",
    tagline: "Sreemangal's only hilltop MICE venue",
    description:
      "Modern glass and steel on the mid-slope between Hill 2 and Hill 3, surrounded by tea bushes for privacy with views. Built for corporate retreats, MICE events and destination weddings, with glass walls that open onto the tea garden for indoor-outdoor events.",
    highlights: [
      "200+ pax theatre",
      "Pre-function tea garden lawn",
      "Glass walls opening to the tea",
      "Corporate demand from Dhaka & Sylhet",
    ],
    land: { decimals: 15, sqft: 6804, percent: 4.1 },
    image: "/renders/conference-pavilion.jpg",
    position: [0, -6],
  },
  {
    id: "villas",
    number: 9,
    name: "Hillside Luxury Villas",
    hill: "Hill 3",
    category: "hospitality",
    zoneType: "Open / Luxury / Eco",
    tagline: "10–12 villas terraced down the slope",
    description:
      "Each villa steps down the slope of Hill 3, so no villa looks into another. Modern glass-centric architecture with floor-to-ceiling windows facing the valley, private pools on the upper levels and two master bedrooms below. A private buggy path serves each one — no shared walls, true villa living on the tillas.",
    highlights: [
      "10–12 terraced villas",
      "Private pools on upper levels",
      "3-room layout: living + 2 ensuite masters + deck",
      "Private buggy path, no shared walls",
    ],
    land: { decimals: 70, sqft: 78408, percent: 19.4 },
    image: "/renders/hillside-villas-valley.jpg",
    position: [9, 0],
  },
  {
    id: "lake",
    number: 10,
    name: "Kayaking Lake",
    hill: "Valley — Hills 2, 3 & 4",
    category: "nature",
    zoneType: "Water",
    tagline: "A natural valley turned eco-lake",
    description:
      "The natural valley between Hills 2, 3 and 4, converted into a circular eco-lake for peaceful kayaking. It holds a cool microclimate over the whole resort. No concrete banks — natural edges planted with tea bushes and bamboo.",
    highlights: [
      "Circular eco-lake",
      "Kayaking & water activity",
      "Natural edges, no concrete",
      "Cools the resort microclimate",
    ],
    land: { decimals: 30, sqft: 13068, percent: 8.3 },
    image: "/renders/kayaking-lake-aerial.jpg",
    position: [1.5, -3],
  },
  {
    id: "tea-house",
    number: 11,
    name: "Tea House",
    hill: "Hill 3",
    category: "nature",
    zoneType: "Built-Up",
    tagline: "The cultural anchor of the estate",
    description:
      "An elevated tea-tasting pavilion set amidst mature tea bushes — the signature photographic moment of the resort and the cultural anchor for Srimangal storytelling.",
    highlights: ["Tasting bar", "Library", "Viewing deck", "Tea ceremony"],
    land: { decimals: 5, sqft: 2178, percent: 1.3 },
    image: "/renders/tea-house-lounge.jpg",
    position: [7, 4],
  },
  {
    id: "tea-tree-house",
    number: 12,
    name: "Tea Tree Houses",
    hill: "Hill 4",
    category: "nature",
    zoneType: "Built-Up",
    tagline: "Sleeping in the canopy",
    description:
      "Timber tree houses raised into the canopy on the quieter slopes, for guests who want the estate at its most elemental — a deck, a view and the sound of the hills.",
    highlights: [
      "Canopy-level decks",
      "Timber construction",
      "Elevated viewing platforms",
      "Minimal ground footprint",
    ],
    land: null,
    image: "/renders/tea-tree-house.jpg",
    position: [4, -11],
  },
  {
    id: "kids-zone",
    number: 13,
    name: "Kids Zone",
    hill: "Hill 1",
    category: "wellness",
    zoneType: "Built-Up",
    tagline: "A play world woven into nature",
    description:
      "A safe, imaginative and educational play world built into the landscape rather than dropped onto it — outdoor adventure, creative studios and supervised eco-learning.",
    highlights: [
      "Adventure playground",
      "Creative lab",
      "Soft play",
      "Nature classroom",
    ],
    land: {
      decimals: 15,
      sqft: 6534,
      percent: 4.1,
      buffer: { decimals: 25, sqft: 10890 },
    },
    image: "/renders/kids-zone.jpg",
    position: [-3, 8],
  },
  {
    id: "barbecue",
    number: 14,
    name: "Barbecue Zone",
    hill: "Lakeside",
    category: "wellness",
    zoneType: "Built-Up",
    tagline: "Private chef evenings under the tea sky",
    description:
      "Intimate lakeside barbecue decks for private chef evenings, stargazing and acoustic nights at the water's edge.",
    highlights: [
      "Lakeside decks",
      "Chef grill",
      "Fire pit",
      "Acoustic corner",
    ],
    land: { decimals: 10, sqft: 4356, percent: 2.7 },
    image: "/renders/barbecue-lakeside.jpg",
    position: [5.5, 0.5],
  },
  {
    id: "event-lawn",
    number: 15,
    name: "Event Lawn & Amphitheatre",
    hill: "Hill 4",
    category: "hospitality",
    zoneType: "Open / Water / Eco",
    tagline: "Bangladesh's premier tea-country wedding destination",
    description:
      "A grand open lawn with a cultural plaza and stepped amphitheatre cut into the slope, designed from the outset as the country's leading tea-country wedding venue.",
    highlights: [
      "Wedding lawn",
      "Stepped amphitheatre",
      "Cultural plaza",
      "Bridal suites access",
    ],
    land: {
      decimals: 20,
      sqft: 8712,
      percent: 5.56,
      buffer: { decimals: 90, sqft: 39204 },
    },
    image: "/renders/amphitheatre-event-lawn.jpg",
    position: [1, -11],
  },
  {
    id: "organic-farm",
    number: 16,
    name: "Organic Farm",
    hill: "Hill 5",
    category: "nature",
    zoneType: "Open / Eco",
    tagline: "The kitchen's own ground",
    description:
      "A working organic farm supplying the resort's kitchens, and one of the ESG commitments that sits alongside rainwater harvesting and the bird sanctuary.",
    highlights: [
      "Farm-to-table supply",
      "Guest harvesting",
      "Composting programme",
      "ESG-aligned",
    ],
    land: null,
    image: "/renders/organic-farm.jpg",
    position: [12, -9],
  },
  {
    id: "nature-trail",
    number: 17,
    name: "Nature Trail & Sports Turf",
    hill: "Across the estate",
    category: "nature",
    zoneType: "Open / Eco",
    tagline: "Seven-plus acres kept open",
    description:
      "Walking trails thread the estate between zones, past the bird sanctuary and out onto the open playground and turf. This is the larger half of the land — 7.20 acres deliberately left as playground and open area.",
    highlights: [
      "Bird sanctuary",
      "Walking & jogging trails",
      "Sports turf",
      "Zipline & adventure",
    ],
    land: null,
    image: "/renders/sports-turf.jpg",
    position: [13, 4],
  },
];

export const getZone = (id: string) => zones.find((z) => z.id === id);

/**
 * Land usage summary, as printed on the deck's "Built with Balance" page.
 *
 * Segment order is deliberate: these four colours are a validated categorical
 * set for a cream surface, and the gold and leaf-green steps fail CVD
 * separation when placed side by side. Keeping water between them is what
 * makes the stacked bar readable — do not re-sort this array by size.
 */
export const landUsage = {
  headline: "Built with Balance",
  split: "55% Nature & 45% Luxury",
  breakdown: [
    {
      label: "Built-up footprint",
      decimals: 162,
      percent: 45,
      detail: "Hotel, villas, restaurants, conference and related structures",
      color: "#0F8A5F",
    },
    {
      label: "Open around structure",
      decimals: 60,
      percent: 16.7,
      detail: "Setbacks and open ground around built form",
      color: "#D9A441",
    },
    {
      label: "Water bodies",
      decimals: 50,
      percent: 13.8,
      detail: "Kayaking lake and infinity pools",
      color: "#1D93BC",
    },
    {
      label: "Landscaped green & open",
      decimals: 88,
      percent: 24.5,
      detail: "Garden and open spaces",
      color: "#8FBF4D",
    },
  ],
  note: "Percentages are of the 360-decimal development & investment area.",
} as const;

/** Headline estate figures from the "About the Project" page. */
export const estateFacts = [
  {
    value: "10.80",
    unit: "Acres",
    label: "Total land area",
    detail: "1,080 decimal",
  },
  {
    value: "3.60",
    unit: "Acres",
    label: "Development & investment area",
    detail: "360 decimal",
  },
  {
    value: "7.20",
    unit: "Acres",
    label: "Playground & open area",
    detail: "720 decimal",
  },
  {
    value: "5",
    unit: "Hills",
    label: "Across the estate",
    detail: "3 project area · 2 open area",
  },
] as const;
