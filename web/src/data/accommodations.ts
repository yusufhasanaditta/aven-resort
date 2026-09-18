/**
 * Accommodation product: what an owner's share actually buys into.
 *
 * Room counts, layouts and architectural notes come from the
 * "Accommodations & 5-Star Hub" and "Elite Living" pages of the deck.
 */

export type Accommodation = {
  id: string;
  name: string;
  collection: "Hotel" | "Villas" | "Nature Stays";
  hill: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  features: string[];
  image: string;
};

export const accommodations: Accommodation[] = [
  {
    id: "presidential",
    name: "Presidential & Royal Suites",
    collection: "Hotel",
    hill: "Hill 2 — Top Floor",
    tagline: "The highest rooms on the highest hill",
    description:
      "The top floor of the main building is given entirely to Presidential and Royal suites, each with a private terrace and an unbroken 180° view over the tea gardens. These are the rooms the whole masterplan is oriented around.",
    specs: [
      { label: "Floor", value: "Top level" },
      { label: "Outlook", value: "180° tea garden" },
      { label: "Terrace", value: "Private" },
      { label: "Building", value: "3-storey centrepiece" },
    ],
    features: [
      "Private terrace",
      "180° panoramic views",
      "Highest point of the estate",
      "Stone & glass architecture",
    ],
    image: "/renders/main-hotel-aerial.jpg",
  },
  {
    id: "executive-rooms",
    name: "Executive Rooms",
    collection: "Hotel",
    hill: "Hill 2 — Levels 1 & 2",
    tagline: "The core of the 40-suite hub",
    description:
      "Levels one and two of the main building carry the executive rooms, sharing the floor with the grand ballroom and the wellness spa's hill-view treatment rooms. Sloped roofs, local stone and glass, with deep overhangs sized for Srimangal's rain.",
    specs: [
      { label: "Suites", value: "40 exclusive" },
      { label: "Levels", value: "1 & 2" },
      { label: "Plot", value: "60 decimals" },
      { label: "Built", value: "17,400 sq ft" },
    ],
    features: [
      "Grand Ballroom, 200 pax",
      "Wellness spa on floor",
      "Deep overhangs for monsoon",
      "Local stone + glass",
    ],
    image: "/renders/hotel-facade.jpg",
  },
  {
    id: "terraced-villas",
    name: "Hillside Terraced Villas",
    collection: "Villas",
    hill: "Hill 3",
    tagline: "Each villa steps down the slope",
    description:
      "Ten to twelve villas terraced along the slopes of Hill 3, each stepping down the hill so that no villa overlooks another. Floor-to-ceiling glass faces the valley; private pools sit on the upper level with two ensuite masters below.",
    specs: [
      { label: "Villas", value: "10 – 12" },
      { label: "Layout", value: "Living + 2 masters + deck" },
      { label: "Land", value: "70 decimals" },
      { label: "Share", value: "19.4% of development" },
    ],
    features: [
      "Private pool on upper level",
      "Two ensuite master bedrooms",
      "Floor-to-ceiling valley glass",
      "Private buggy path, no shared walls",
    ],
    image: "/renders/hillside-villas-valley.jpg",
  },
  {
    id: "pool-villas",
    name: "Private Pool Villas",
    collection: "Villas",
    hill: "Hill 3",
    tagline: "Water, deck and nothing overlooking you",
    description:
      "The villa's pool runs the length of its deck, cut into the terrace so the water edge reads level with the tea below. Privacy comes from the topography rather than from walls.",
    specs: [
      { label: "Pool", value: "Private, per villa" },
      { label: "Deck", value: "Full-length teak" },
      { label: "Privacy", value: "No shared walls" },
      { label: "Access", value: "Private buggy path" },
    ],
    features: [
      "Full-length private pool",
      "Teak sun deck",
      "Outdoor lounge",
      "Direct valley outlook",
    ],
    image: "/renders/private-pool-night.jpg",
  },
  {
    id: "tree-houses",
    name: "Tea Tree Houses",
    collection: "Nature Stays",
    hill: "Hill 4",
    tagline: "Raised into the canopy",
    description:
      "Timber tree houses on the quieter slopes, lifted into the canopy on a minimal footprint. A deck, a view, and very little between you and the hills.",
    specs: [
      { label: "Structure", value: "Timber, elevated" },
      { label: "Footprint", value: "Minimal ground contact" },
      { label: "Deck", value: "Canopy level" },
      { label: "Setting", value: "Forest edge" },
    ],
    features: [
      "Canopy-level deck",
      "Elevated viewing platform",
      "Timber construction",
      "Low-impact siting",
    ],
    image: "/renders/tea-tree-house.jpg",
  },
  {
    id: "eco-pods",
    name: "Eco Pod Retreats",
    collection: "Nature Stays",
    hill: "Hill 4 — Ridge",
    tagline: "Curved shells on the ridge line",
    description:
      "Sculptural pod retreats set along the ridge, with green roofs, a sunken fire-pit lounge and a pool cantilevered toward the valley. The most contemporary architecture on the estate.",
    specs: [
      { label: "Form", value: "Curved shell" },
      { label: "Roof", value: "Planted green roof" },
      { label: "Lounge", value: "Sunken fire pit" },
      { label: "Pool", value: "Cantilevered edge" },
    ],
    features: [
      "Green roof",
      "Sunken fire-pit lounge",
      "Cantilevered pool",
      "Ridge-line siting",
    ],
    image: "/renders/pod-villa-firepit.jpg",
  },
];

export const accommodationCollections = [
  "Hotel",
  "Villas",
  "Nature Stays",
] as const;
