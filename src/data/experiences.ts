/**
 * The guest experience programme — the revenue streams beyond rooms.
 *
 * Drawn from the zone pages of the deck (spa, lake, tea house, bridge, kids
 * zone, barbecue, amphitheatre) plus the "multiple revenue streams" argument
 * on the investment page.
 */

export type ExperienceCategory =
  | "wellness"
  | "water"
  | "culture"
  | "adventure"
  | "dining"
  | "events";

export type Experience = {
  id: string;
  name: string;
  category: ExperienceCategory;
  hill: string;
  summary: string;
  detail: string;
  includes: string[];
  image: string;
};

export const experienceCategories: Record<
  ExperienceCategory,
  { label: string; blurb: string }
> = {
  wellness: {
    label: "Wellness",
    blurb: "Hammam, Thai spa, Ayurveda, yoga and meditation.",
  },
  water: { label: "Water", blurb: "The eco-lake, pools and kayaking." },
  culture: {
    label: "Culture",
    blurb: "Tea ceremony, tasting, library and Srimangal storytelling.",
  },
  adventure: {
    label: "Adventure",
    blurb: "Trails, zipline, canopy walks and the kids' world.",
  },
  dining: {
    label: "Dining",
    blurb: "Valley restaurant, lakeside barbecue, farm-to-table.",
  },
  events: {
    label: "Events",
    blurb: "Weddings, MICE, amphitheatre and the grand ballroom.",
  },
};

export const experiences: Experience[] = [
  {
    id: "hammam",
    name: "Turkish Hammam & Thai Spa",
    category: "wellness",
    hill: "Hill 2",
    summary: "A holistic wellness sanctuary overlooking the bird sanctuary.",
    detail:
      "The spa courtyard gathers a Turkish hammam, an authentic Thai spa pavilion, an Ayurveda centre and sauna and steam rooms around a meditation garden, with the bird sanctuary below.",
    includes: [
      "Turkish Hammam",
      "Thai Spa",
      "Ayurveda & Panchakarma",
      "Sauna & Steam",
    ],
    image: "/renders/spa-wellness-courtyard.jpg",
  },
  {
    id: "yoga",
    name: "Yoga Pavilion & Meditation Garden",
    category: "wellness",
    hill: "Hill 2",
    summary: "Sunrise practice on a deck above the tea terraces.",
    detail:
      "An open timber pavilion sited east so the first light comes up over the terraces, with a meditation garden alongside it.",
    includes: [
      "Sunrise yoga",
      "Guided meditation",
      "Sound bowls",
      "Open-air deck",
    ],
    image: "/renders/yoga-tea-garden.jpg",
  },
  {
    id: "treatments",
    name: "Hill-View Treatment Rooms",
    category: "wellness",
    hill: "Hill 2 — Main Building",
    summary: "Treatment rooms on the spa floor of the main building.",
    detail:
      "Set within levels one and two of the main building, each treatment room is oriented to the hill rather than inward, so the view is part of the therapy.",
    includes: [
      "Signature tea rituals",
      "Couples suites",
      "Facial & body therapies",
      "Wellness consultation",
    ],
    image: "/renders/spa-treatment.jpg",
  },
  {
    id: "kayaking",
    name: "Kayaking on the Eco-Lake",
    category: "water",
    hill: "Valley — Hills 2, 3 & 4",
    summary: "A circular lake in the fold between three hills.",
    detail:
      "The natural valley has been shaped into a circular eco-lake for quiet paddling. Natural edges planted with tea and bamboo, no concrete banks, and a microclimate that cools the whole resort.",
    includes: [
      "Kayak fleet",
      "Timber dock",
      "Dawn paddles",
      "Birdwatching from water",
    ],
    image: "/renders/kayaking-lake-aerial.jpg",
  },
  {
    id: "infinity-pool",
    name: "Infinity Pool & Cabanas",
    category: "water",
    hill: "Hill 2",
    summary: "An infinity edge facing south over the tea estates.",
    detail:
      "Directly in front of the main building, the common pool runs its infinity edge south toward the Sreemangal estates, with a sunken pool bar, teak deck and cabanas built into the slope.",
    includes: ["Infinity edge", "Sunken pool bar", "Cabanas", "Kids' shallow zone"],
    image: "/renders/common-pool-aerial.jpg",
  },
  {
    id: "tea-ceremony",
    name: "Tea Ceremony & Tasting",
    category: "culture",
    hill: "Hill 3",
    summary: "The cultural anchor of the estate.",
    detail:
      "An elevated tasting pavilion set among mature tea bushes, working through the Sylhet and Moulvibazar gardens — white, green and black — with a library for guests who want to stay a while.",
    includes: ["Tasting bar", "Tea library", "Viewing deck", "Ceremony service"],
    image: "/renders/tea-house-lounge.jpg",
  },
  {
    id: "tea-library",
    name: "The Tea Library",
    category: "culture",
    hill: "Hill 3",
    summary: "A reading room attached to the tasting bar.",
    detail:
      "Quiet, timber-lined and stocked with books on the region, its gardens and its history — the slow counterpoint to the rest of the programme.",
    includes: ["Reading room", "Regional archive", "Morning service", "Quiet hours"],
    image: "/renders/tea-library.jpg",
  },
  {
    id: "canopy-walk",
    name: "The Canopy Walk",
    category: "adventure",
    hill: "Hill 1 → Hill 2",
    summary: "Fifty feet of bridge above the tea bushes.",
    detail:
      "The hanging bridge gives a canopy-level walking experience across the valley, on teak decking behind glass railings. After dark the lighting turns it into a golden line floating across the tillas.",
    includes: [
      "50-foot span",
      "Glass railings",
      "Night illumination",
      "Stairs to valley dining",
    ],
    image: "/renders/hanging-bridge-night.jpg",
  },
  {
    id: "zipline",
    name: "Zipline & Nature Trails",
    category: "adventure",
    hill: "Across the estate",
    summary: "Trails, ridges and a run across the valley.",
    detail:
      "Walking and jogging trails thread between the zones and past the bird sanctuary, with a zipline run for guests who want the valley at speed.",
    includes: ["Zipline run", "Guided trails", "Birdwatching", "Sports turf"],
    image: "/renders/zipline.jpg",
  },
  {
    id: "kids",
    name: "Kids Zone & Nature Classroom",
    category: "adventure",
    hill: "Hill 1",
    summary: "Adventure play and supervised eco-learning.",
    detail:
      "A bamboo adventure playground, creative lab, soft play and a nature classroom — built into the landscape, supervised, and aimed as much at learning as at play.",
    includes: [
      "Adventure playground",
      "Creative lab",
      "Soft play",
      "Nature classroom",
    ],
    image: "/renders/kids-zone.jpg",
  },
  {
    id: "valley-dining",
    name: "Signature Valley Restaurant",
    category: "dining",
    hill: "Valley",
    summary: "A glass pavilion in the fold between the hills.",
    detail:
      "Reached by stairs from the hanging bridge, the signature restaurant sits on the valley floor, open on every side to the slope and the tea.",
    includes: [
      "Bridge access",
      "Open-side pavilion",
      "Regional menu",
      "Valley outlook",
    ],
    image: "/renders/glass-tea-restaurant.jpg",
  },
  {
    id: "barbecue",
    name: "Lakeside Barbecue Decks",
    category: "dining",
    hill: "Lakeside",
    summary: "Private chef evenings at the water's edge.",
    detail:
      "Intimate decks on the lake shore for private chef service, fire pits, stargazing and acoustic nights under the tea sky.",
    includes: ["Chef grill", "Fire pit", "Acoustic corner", "Stargazing deck"],
    image: "/renders/barbecue-lakeside.jpg",
  },
  {
    id: "farm-table",
    name: "Organic Farm & Farm-to-Table",
    category: "dining",
    hill: "Hill 5",
    summary: "The kitchen's own ground, on the estate.",
    detail:
      "A working organic farm supplying the kitchens, open to guests who want to harvest what they eat — and one of the project's standing ESG commitments.",
    includes: [
      "Guest harvesting",
      "Seasonal menus",
      "Composting",
      "Kitchen garden tours",
    ],
    image: "/renders/organic-farm.jpg",
  },
  {
    id: "weddings",
    name: "Tea-Country Weddings",
    category: "events",
    hill: "Hill 4",
    summary: "A stepped amphitheatre cut into the slope.",
    detail:
      "The event lawn and amphitheatre are designed from the outset as Bangladesh's premier tea-country wedding destination, with a cultural plaza and direct access to bridal suites.",
    includes: [
      "Wedding lawn",
      "Stepped amphitheatre",
      "Cultural plaza",
      "Bridal suite access",
    ],
    image: "/renders/amphitheatre-event-lawn.jpg",
  },
  {
    id: "mice",
    name: "Conferences & Corporate Retreats",
    category: "events",
    hill: "Hill 2 → Hill 3",
    summary: "Sreemangal's only hilltop MICE venue.",
    detail:
      "A glass and steel hall on the mid-slope, 200+ pax theatre style, with a pre-function tea garden lawn and walls that open straight onto the bushes.",
    includes: [
      "200+ pax theatre",
      "Pre-function lawn",
      "Opening glass walls",
      "Retreat packages",
    ],
    image: "/renders/conference-pavilion.jpg",
  },
  {
    id: "ballroom",
    name: "The Grand Ballroom",
    category: "events",
    hill: "Hill 2 — Main Building",
    summary: "Two hundred guests inside the main building.",
    detail:
      "Set within the main building alongside the executive rooms and spa, the ballroom carries the indoor half of the events programme through the monsoon months.",
    includes: [
      "200 pax capacity",
      "In-house catering",
      "Full production",
      "Adjacent suites",
    ],
    image: "/renders/grand-ballroom.jpg",
  },
];
