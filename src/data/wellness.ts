/**
 * The wellness programme — eleven named services drawn from the Spa &
 * Wellness zone (Hill 2) and its "INCLUDES" bullets in the masterplan
 * document, plus the adjacent fitness, nutrition and tea-culture offerings
 * documented elsewhere in the deck. Four services below share one render
 * because the source image itself shows all four pavilions in a single
 * courtyard shot — the same grouping the masterplan document uses.
 */

export type WellnessService = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  includes: string[];
  hill: string;
};

export const wellnessIntro = {
  eyebrow: "Wellness",
  title: "Eleven services, one hillside sanctuary.",
  lede: "The Spa & Wellness zone occupies 10 decimals on Hill 2, overlooking the bird sanctuary — a Turkish hammam, an authentic Thai spa, an Ayurveda centre, sauna and steam rooms, and a yoga pavilion, extended here with the fitness, nutrition and tea-culture services that complete the programme.",
};

export const wellnessServices: WellnessService[] = [
  {
    id: "hammam",
    name: "Turkish Hammam",
    tagline: "Steam, stone and centuries of ritual",
    description:
      "A domed hammam built in the Turkish tradition — heated marble, steam and a full scrub-and-massage ritual, set within the Spa & Wellness courtyard on Hill 2.",
    image: "/renders/spa-wellness-courtyard.jpg",
    includes: ["Heated marble platform", "Traditional scrub", "Steam chamber"],
    hill: "Hill 2 — Spa & Wellness",
  },
  {
    id: "thai-spa",
    name: "Thai Spa",
    tagline: "The golden pavilion beside the hammam",
    description:
      "An authentic Thai spa pavilion, gold-roofed and open-sided, offering traditional Thai massage and herbal compress therapy overlooking the meditation garden.",
    image: "/renders/spa-wellness-courtyard.jpg",
    includes: ["Traditional Thai massage", "Herbal compress therapy", "Open-air pavilion"],
    hill: "Hill 2 — Spa & Wellness",
  },
  {
    id: "ayurveda",
    name: "Ayurveda & Panchakarma",
    tagline: "Herbal wellness, the old way",
    description:
      "A stone-built Ayurveda centre offering Panchakarma and herbal wellness treatments, drawing on Ayurvedic tradition within the same wellness courtyard.",
    image: "/renders/spa-wellness-courtyard.jpg",
    includes: ["Panchakarma", "Herbal wellness therapies", "Consultation room"],
    hill: "Hill 2 — Spa & Wellness",
  },
  {
    id: "sauna-steam",
    name: "Sauna & Steam Therapy",
    tagline: "Timber-lined heat therapy",
    description:
      "A timber sauna and steam room set at the edge of the wellness courtyard, for guests completing a treatment circuit or simply unwinding after a day on the tea trails.",
    image: "/renders/spa-wellness-courtyard.jpg",
    includes: ["Dry sauna", "Steam room", "Cold plunge access"],
    hill: "Hill 2 — Spa & Wellness",
  },
  {
    id: "treatments",
    name: "Hill-View Spa Treatments",
    tagline: "Where the view is part of the therapy",
    description:
      "Private treatment rooms on the spa floor of the main building, each oriented outward to the hill rather than inward — facials, body therapies and signature tea rituals with a 180° outlook.",
    image: "/renders/spa-treatment.jpg",
    includes: ["Signature tea rituals", "Facial & body therapies", "Couples suites"],
    hill: "Hill 2 — Main Building",
  },
  {
    id: "yoga",
    name: "Yoga Pavilion & Sunrise Practice",
    tagline: "Practice facing the first light",
    description:
      "An open timber pavilion sited east so sunrise comes up directly over the tea terraces — guided sunrise yoga, sound bowl sessions and open-air practice through the day.",
    image: "/renders/yoga-tea-garden.jpg",
    includes: ["Sunrise yoga", "Sound bowl sessions", "Open-air deck"],
    hill: "Hill 2 — Spa & Wellness",
  },
  {
    id: "meditation",
    name: "Meditation Garden & Forest Bathing",
    tagline: "A quiet ridge above the valley",
    description:
      "A raised timber deck on the ridge line, built for slow mornings, guided meditation and forest-bathing walks with the valley opening out below.",
    image: "/renders/nature-viewing-deck.jpg",
    includes: ["Guided meditation", "Forest bathing walks", "Ridge-line deck"],
    hill: "Hill 4 — Ridge",
  },
  {
    id: "fitness",
    name: "Fitness Studio",
    tagline: "A full circuit on the wellness floor",
    description:
      "An equipped fitness studio on the spa floor of the main building — free weights, kettlebells and cardio for guests keeping to a routine during their stay.",
    image: "/renders/fitness-studio.jpg",
    includes: ["Free weights & kettlebells", "Cardio equipment", "Personal training on request"],
    hill: "Hill 2 — Main Building",
  },
  {
    id: "nutrition",
    name: "Wellness Nutrition Consultation",
    tagline: "A plan built around your stay",
    description:
      "One-on-one consultations with a wellness nutritionist, building a food plan around the resort's own organic farm and kitchens for the length of a guest's stay.",
    image: "/renders/wellness-nutrition.jpg",
    includes: ["One-on-one consultation", "Farm-to-table meal planning", "Dietary programmes"],
    hill: "Hill 2 — Main Building",
  },
  {
    id: "earthing",
    name: "Barefoot Earthing Trail",
    tagline: "The estate, underfoot",
    description:
      "A dedicated barefoot trail through wet grass and natural ground — a simple, deliberate counterpoint to the resort's more built wellness offerings.",
    image: "/renders/barefoot-earthing.jpg",
    includes: ["Natural-ground barefoot path", "Guided walking sessions", "Morning & dusk slots"],
    hill: "Across the estate",
  },
  {
    id: "tea-ceremony",
    name: "Tea Ceremony Wellness",
    tagline: "The original wellness ritual of the hills",
    description:
      "A guided tea ceremony and tasting at the Tea House on Hill 3 — treated here as a wellness practice in its own right, not only a cultural one: breathwork, slow tasting and the quiet of the tea library.",
    image: "/renders/tea-house-lounge.jpg",
    includes: ["Guided tea ceremony", "Mindful tasting flight", "Tea library access"],
    hill: "Hill 3 — Tea House",
  },
];
