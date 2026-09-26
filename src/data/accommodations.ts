/**
 * Accommodation product: what an owner's share actually buys into.
 *
 * Room counts follow the AVEN brochure's "Luxury Hotel" (100 exclusive
 * suites, presidential & royal suites, 200-pax ballroom, 50-pax seminar room)
 * and "Luxury Villas" (20 villas — single, duplex, presidential — with private
 * pools) pages; architectural notes come from the earlier masterplan deck.
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
      "The crown of the luxury hotel: Presidential and Royal suites with private terraces and an unbroken view over the tea gardens — the rooms the whole resort is oriented around.",
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
    name: "Exclusive Suites",
    collection: "Hotel",
    hill: "Luxury Hotel",
    tagline: "100 exclusive suites under one roof",
    description:
      "The luxury hotel carries 100 exclusive suites alongside a 200-pax Grand Ballroom, a 50-pax Seminar Room and a Meeting Room — stone and glass against the forested hills, with the wellness programme a short walk away.",
    specs: [
      { label: "Suites", value: "100 exclusive" },
      { label: "Grand Ballroom", value: "200 pax" },
      { label: "Seminar Room", value: "50 pax" },
      { label: "Meeting Room", value: "On site" },
    ],
    features: [
      "Presidential & Royal suites",
      "Grand Ballroom, 200 pax",
      "Seminar & meeting rooms",
      "Local stone + glass",
    ],
    image: "/renders/hotel-facade.jpg",
  },
  {
    id: "terraced-villas",
    name: "Luxury Villas",
    collection: "Villas",
    hill: "Villa slopes",
    tagline: "20 exclusive villas, stepping down the hill",
    description:
      "Twenty exclusive villas — single, duplex and presidential — terraced along the slopes so no villa overlooks another. Floor-to-ceiling glass faces the valley, each with a luxurious private pool and a tranquil, serene hill view.",
    specs: [
      { label: "Villas", value: "20 exclusive" },
      { label: "Types", value: "Single · Duplex · Presidential" },
      { label: "Pool", value: "Private, every villa" },
      { label: "Outlook", value: "Serene hill view" },
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
