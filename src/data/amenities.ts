/**
 * The 20 features and amenities from the brochure's "Site Zoning &
 * Functions" page — "Every shareholder will have fractional ownership of all
 * the features and amenities with Saf-Kabla land registration" — with the
 * copy and photography from the brochure's poster pages grouped into the
 * spreads the brochure itself uses.
 */

export type Amenity = {
  id: string;
  name: string;
  /** Key into `AmenityIcon`. */
  icon: string;
  group: AmenityGroupId;
  description: string;
  image?: string;
};

export type AmenityGroupId =
  | "stay"
  | "wellness"
  | "dining"
  | "gatherings"
  | "adventure"
  | "family"
  | "arrival";

export const amenityGroups: {
  id: AmenityGroupId;
  eyebrow: string;
  title: string;
  lede: string;
}[] = [
  {
    id: "stay",
    eyebrow: "Stay",
    title: "A hotel, twenty villas and water everywhere.",
    lede: "140 rooms in all — 100 in the main hotel and 40 across twenty two-room private-pool villas on the slopes — with a luxurious common pool between them.",
  },
  {
    id: "wellness",
    eyebrow: "Wellness & Retreat",
    title: "Eleven therapies, one peaceful self.",
    lede: "Yoga, mental health consultancy, physiotherapy, sound healing, acupuncture and more — all provided within the resort.",
  },
  {
    id: "dining",
    eyebrow: "Dining",
    title: "From the valley restaurant to the farm.",
    lede: "A signature restaurant nestled between the hills, an open-fire barbeque zone and an organic farm supplying the kitchens.",
  },
  {
    id: "gatherings",
    eyebrow: "Gatherings",
    title: "Room for every occasion.",
    lede: "Evening galas on the lawn, summits in the multipurpose hall, performances on the open stage and a quiet space for prayer.",
  },
  {
    id: "adventure",
    eyebrow: "Adventure",
    title: "Trailheads, water and floodlit turf.",
    lede: "A base camp for the trails, a kayaking dock on a natural reservoir, a modern turf pitch and a lit walkway above the tea.",
  },
  {
    id: "family",
    eyebrow: "Family & Culture",
    title: "Stories, tea and timber play.",
    lede: "A library celebrating storytelling and tea-making, a tree house in the branches and a natural play haven for children.",
  },
  {
    id: "arrival",
    eyebrow: "Arrival",
    title: "Arrive by road — or by air.",
    lede: "A 24-hour reception to welcome you, a private helipad above the estate and organised parking at its edge, keeping the resort itself car-free.",
  },
];

export const amenities: Amenity[] = [
  {
    id: "reception",
    name: "Reception",
    icon: "reception",
    group: "arrival",
    description: "A 24-hour reception and concierge desk at the hotel lobby — check-in, guest services, transfers and every request during your stay.",
    image: "/renders/hotel-facade.jpg",
  },
  {
    id: "hotel",
    name: "Luxury Hotel",
    icon: "hotel",
    group: "stay",
    description: "100 exclusive rooms, presidential and royal suites, a 200-pax grand ballroom, a 50-pax seminar room and meeting rooms.",
    image: "/renders/hotel-facade.jpg",
  },
  {
    id: "villas",
    name: "Luxury Villas",
    icon: "villa",
    group: "stay",
    description: "20 exclusive villas of two rooms each (40 rooms) — super deluxe residential, single, duplex and presidential — with private pool and a tranquil, serene hill view.",
    image: "/renders/hillside-villas-valley.jpg",
  },
  {
    id: "pool",
    name: "Infinity Pool",
    icon: "pool",
    group: "stay",
    description: "A luxurious common swimming pool among the palms, alongside the private pools in every villa.",
    image: "/renders/common-pool-aerial.jpg",
  },
  {
    id: "wellness",
    name: "Wellness & Retreat",
    icon: "wellness",
    group: "wellness",
    description: "Eleven therapies, from yoga, mental health consultancy and physiotherapy to acupuncture, quartz therapy and sound healing.",
    image: "/renders/yoga-tea-garden.jpg",
  },
  {
    id: "restaurant",
    name: "Restaurant",
    icon: "restaurant",
    group: "dining",
    description: "The hill-view Signature Valley Restaurant, nestled between the hills.",
    image: "/renders/glass-tea-restaurant.jpg",
  },
  {
    id: "bbq",
    name: "Barbeque Zone",
    icon: "bbq",
    group: "dining",
    description: "Open-fire grills for long evenings outdoors.",
    image: "/renders/barbecue-grill.jpg",
  },
  {
    id: "farm",
    name: "Organic Farm",
    icon: "farm",
    group: "dining",
    description: "Produce grown on the estate and served in its kitchens.",
    image: "/renders/organic-farm.jpg",
  },
  {
    id: "conference",
    name: "Conference Hall",
    icon: "conference",
    group: "gatherings",
    description: "A refined, climate-controlled multipurpose hall designed for gatherings, summits and grand banquets.",
    image: "/renders/grand-ballroom.jpg",
  },
  {
    id: "event-lawn",
    name: "Event Lawn",
    icon: "lawn",
    group: "gatherings",
    description: "An open-air expanse designed for evening galas beneath starry skies.",
    image: "/renders/event-lawn-dinner.jpg",
  },
  {
    id: "prayer",
    name: "Prayer Space",
    icon: "prayer",
    group: "gatherings",
    description: "A calm, dedicated space for prayer within the resort.",
  },
  {
    id: "base-camp",
    name: "Base Camp",
    icon: "camp",
    group: "adventure",
    description: "A ruggedly elegant hub where trailheads meet warm hospitality.",
    image: "/renders/zipline.jpg",
  },
  {
    id: "kayaking",
    name: "Kayaking Dock",
    icon: "kayak",
    group: "adventure",
    description: "A serene natural reservoir framed by dramatic tea slopes.",
    image: "/renders/kayaking.jpg",
  },
  {
    id: "turf",
    name: "Turf",
    icon: "turf",
    group: "adventure",
    description: "A modern sports pitch framed by rolling green topography.",
    image: "/renders/sports-turf.jpg",
  },
  {
    id: "cloud-walkway",
    name: "Cloud Walkway",
    icon: "walkway",
    group: "adventure",
    description: "An elevated walkway floating high above the serene tea gardens, lit gold after dark.",
    image: "/renders/hanging-bridge-night.jpg",
  },
  {
    id: "kids",
    name: "Kids Zone",
    icon: "kids",
    group: "family",
    description: "A natural play haven built with timber, rope bridges and garden mazes.",
    image: "/renders/kids-playground.jpg",
  },
  {
    id: "library",
    name: "Library",
    icon: "library",
    group: "family",
    description: "An intimate library celebrating the historical art of storytelling and tea-making.",
    image: "/renders/tea-library.jpg",
  },
  {
    id: "tree-house",
    name: "Tree House",
    icon: "treehouse",
    group: "family",
    description: "A cosy, secluded haven woven seamlessly into the branches.",
    image: "/renders/tea-tree-house.jpg",
  },
  {
    id: "helipad",
    name: "Helipad",
    icon: "helipad",
    group: "arrival",
    description: "Private arrival by air, straight into the hills.",
    image: "/renders/helipad.jpg",
  },
  {
    id: "parking",
    name: "Parking",
    icon: "parking",
    group: "arrival",
    description: "Organised parking at the estate's edge, with buggies onward.",
    image: "/renders/parking-ev-buggy.jpg",
  },
];

/** Shown alongside the Cloud Walkway on the brochure page, though not one of the 20. */
export const watchDeck = {
  name: "Watch Deck",
  description: "A timber deck high on the ridge, with the valley opening out below.",
  image: "/renders/nature-viewing-deck.jpg",
};
