/**
 * The full render library, extracted from the project PDFs.
 *
 * `span` drives the masonry layout on /gallery — "wide" images take two
 * columns, "tall" images take two rows.
 */

export type GalleryCategory =
  | "masterplan"
  | "architecture"
  | "villas"
  | "water"
  | "wellness"
  | "dining"
  | "events"
  | "nature";

export type GalleryItem = {
  src: string;
  title: string;
  caption: string;
  category: GalleryCategory;
  span?: "wide" | "tall";
};

export const galleryCategories: { id: GalleryCategory; label: string }[] = [
  { id: "masterplan", label: "Masterplan" },
  { id: "architecture", label: "Architecture" },
  { id: "villas", label: "Villas" },
  { id: "water", label: "Water" },
  { id: "wellness", label: "Wellness" },
  { id: "dining", label: "Dining" },
  { id: "events", label: "Events" },
  { id: "nature", label: "Nature" },
];

export const gallery: GalleryItem[] = [
  {
    src: "/renders/masterplan-aerial.jpg",
    title: "The Estate from the Air",
    caption: "Hill 1 reception, Hill 2 hotel and spa, Hill 3 villas, and the lake between them.",
    category: "masterplan",
    span: "wide",
  },
  {
    src: "/renders/hanging-bridge-dusk.jpg",
    title: "The Bridge at Dusk",
    caption: "Night lighting turns the 50-foot span into a golden line across the tillas.",
    category: "architecture",
    span: "wide",
  },
  {
    src: "/renders/hotel-facade.jpg",
    title: "Aven Tea Resort",
    caption: "The main building, stone and glass with deep overhangs for the monsoon.",
    category: "architecture",
    span: "wide",
  },
  {
    src: "/renders/main-hotel-aerial.jpg",
    title: "Main Building, Hill 2",
    caption: "Three storeys on the highest point of the estate.",
    category: "architecture",
  },
  {
    src: "/renders/conference-pavilion.jpg",
    title: "Conference Pavilion",
    caption: "Glass and steel on the mid-slope between Hill 2 and Hill 3.",
    category: "events",
  },
  {
    src: "/renders/hanging-bridge-night.jpg",
    title: "Canopy Walk",
    caption: "The bridge carries guests above the tea bushes at canopy level.",
    category: "architecture",
    span: "tall",
  },
  {
    src: "/renders/bridge-valley-restaurant.jpg",
    title: "Bridge & Valley Restaurant",
    caption: "Stairs lead from the bridge down to dining on the valley floor.",
    category: "dining",
    span: "wide",
  },
  {
    src: "/renders/hillside-villas-valley.jpg",
    title: "Terraced Villas, Hill 3",
    caption: "Each villa steps down the slope so none overlooks another.",
    category: "villas",
    span: "wide",
  },
  {
    src: "/renders/villas-aerial-topdown.jpg",
    title: "Villa Cluster",
    caption: "Private pools and decks, connected by a dedicated buggy path.",
    category: "villas",
  },
  {
    src: "/renders/villa-terrace-sunset.jpg",
    title: "Villa Terrace",
    caption: "The pool edge reads level with the tea terraces below.",
    category: "villas",
    span: "tall",
  },
  {
    src: "/renders/eco-villa-sunrise.jpg",
    title: "Eco Villa at Sunrise",
    caption: "Cabanas and a stepped pool deck on the ridge.",
    category: "villas",
    span: "wide",
  },
  {
    src: "/renders/private-pool-night.jpg",
    title: "Private Pool",
    caption: "Full-length water running the length of the villa deck.",
    category: "water",
    span: "tall",
  },
  {
    src: "/renders/pod-villa-firepit.jpg",
    title: "Eco Pod Retreat",
    caption: "Curved shells with green roofs and a sunken fire-pit lounge.",
    category: "villas",
  },
  {
    src: "/renders/common-pool-aerial.jpg",
    title: "Common Pool",
    caption: "Infinity edge facing south over the Sreemangal estates.",
    category: "water",
    span: "wide",
  },
  {
    src: "/renders/kayaking-lake-aerial.jpg",
    title: "The Eco-Lake",
    caption: "A natural valley between three hills, shaped for kayaking.",
    category: "water",
    span: "wide",
  },
  {
    src: "/renders/kayaking.jpg",
    title: "Morning Paddle",
    caption: "Natural edges, planted with tea and bamboo.",
    category: "water",
    span: "tall",
  },
  {
    src: "/renders/spa-wellness-courtyard.jpg",
    title: "Spa Courtyard",
    caption: "Hammam, Thai spa, Ayurveda and sauna around a meditation garden.",
    category: "wellness",
    span: "tall",
  },
  {
    src: "/renders/yoga-tea-garden.jpg",
    title: "Yoga Pavilion",
    caption: "Sunrise practice above the terraces.",
    category: "wellness",
    span: "tall",
  },
  {
    src: "/renders/spa-treatment.jpg",
    title: "Treatment Rooms",
    caption: "Oriented to the hill rather than inward.",
    category: "wellness",
  },
  {
    src: "/renders/fitness-studio.jpg",
    title: "Fitness Studio",
    caption: "Part of the wellness floor in the main building.",
    category: "wellness",
  },
  {
    src: "/renders/wellness-nutrition.jpg",
    title: "Wellness Consultation",
    caption: "Nutrition and programme planning alongside treatment.",
    category: "wellness",
  },
  {
    src: "/renders/barefoot-earthing.jpg",
    title: "Earthing Walk",
    caption: "A barefoot path through the estate's wet ground.",
    category: "wellness",
  },
  {
    src: "/renders/glass-tea-restaurant.jpg",
    title: "Valley Restaurant",
    caption: "Open on every side to the slope and the tea.",
    category: "dining",
    span: "tall",
  },
  {
    src: "/renders/tea-house-lounge.jpg",
    title: "The Tea Lounge",
    caption: "Tasting bar working through the Sylhet and Moulvibazar gardens.",
    category: "dining",
    span: "tall",
  },
  {
    src: "/renders/tea-library.jpg",
    title: "The Tea Library",
    caption: "A reading room attached to the tasting bar.",
    category: "nature",
    span: "tall",
  },
  {
    src: "/renders/barbecue-lakeside.jpg",
    title: "Lakeside Barbecue",
    caption: "Private chef evenings and acoustic nights at the water's edge.",
    category: "dining",
    span: "tall",
  },
  {
    src: "/renders/barbecue-grill.jpg",
    title: "Chef Grill",
    caption: "Open-fire service on the lake decks.",
    category: "dining",
  },
  {
    src: "/renders/organic-farm.jpg",
    title: "Organic Farm",
    caption: "Farm-to-table supply, grown on the estate.",
    category: "nature",
  },
  {
    src: "/renders/amphitheatre-event-lawn.jpg",
    title: "Amphitheatre & Event Lawn",
    caption: "A stepped amphitheatre cut into the slope for weddings.",
    category: "events",
    span: "wide",
  },
  {
    src: "/renders/grand-ballroom.jpg",
    title: "The Grand Ballroom",
    caption: "Two hundred guests within the main building.",
    category: "events",
    span: "tall",
  },
  {
    src: "/renders/event-lawn-dinner.jpg",
    title: "Lawn Dinner",
    caption: "The outdoor half of the events programme.",
    category: "events",
    span: "tall",
  },
  {
    src: "/renders/kids-zone.jpg",
    title: "Kids Zone",
    caption: "A bamboo adventure world built into the landscape.",
    category: "nature",
    span: "wide",
  },
  {
    src: "/renders/kids-playground.jpg",
    title: "Adventure Play",
    caption: "Slides and climbs cut into the slope itself.",
    category: "nature",
    span: "tall",
  },
  {
    src: "/renders/tea-tree-house.jpg",
    title: "Tea Tree House",
    caption: "Timber stays raised into the canopy.",
    category: "nature",
    span: "tall",
  },
  {
    src: "/renders/nature-viewing-deck.jpg",
    title: "Viewing Deck",
    caption: "A platform on the ridge, looking out over the valley.",
    category: "nature",
    span: "tall",
  },
  {
    src: "/renders/zipline.jpg",
    title: "Zipline",
    caption: "The valley at speed.",
    category: "nature",
    span: "tall",
  },
  {
    src: "/renders/sports-turf.jpg",
    title: "Sports Turf",
    caption: "Floodlit play on the open ground.",
    category: "nature",
    span: "tall",
  },
  {
    src: "/renders/parking-ev-buggy.jpg",
    title: "Arrival & Buggy Station",
    caption: "EV-ready parking, screened by planting.",
    category: "masterplan",
    span: "wide",
  },
  {
    src: "/renders/helipad.jpg",
    title: "Helipad",
    caption: "Direct arrival for the estate.",
    category: "masterplan",
  },
  {
    src: "/renders/location-map.jpg",
    title: "Srimangal Context",
    caption: "The site within Bangladesh's tea capital, Moulvibazar.",
    category: "masterplan",
    span: "wide",
  },
];
