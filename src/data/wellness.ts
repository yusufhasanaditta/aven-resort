/**
 * The wellness programme — the nine services on the brochure's "Wellness &
 * Retreat" and "Aven Cares for You" pages, plus mental health consultancy and
 * physiotherapy, added by Aven. Photography is the brochure's own
 * (higher-resolution originals in /renders where they exist, crops from the
 * brochure pages in /brochure where they don't).
 */

export type WellnessService = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  includes: string[];
  /** Where on the estate it happens. */
  setting: string;
};

export const wellnessIntro = {
  eyebrow: "Wellness & Retreat",
  title: "Aven cares for you.",
  lede: "The next holiday trend is not simply about escaping — it is about retreating. Retreating your body and mind towards a stronger, more passionate and peaceful self. Eleven therapies, all provided within the resort.",
};

export const wellnessServices: WellnessService[] = [
  {
    id: "yoga",
    name: "Yoga",
    tagline: "Practice facing the first light",
    description:
      "Guided sessions on an open timber deck above the tea terraces, timed so sunrise comes up over the hills while you practise.",
    image: "/renders/yoga-tea-garden.jpg",
    includes: ["Sunrise sessions", "Open-air deck", "All levels"],
    setting: "Hillside yoga deck",
  },
  {
    id: "nutrition",
    name: "Nutritional Consultation",
    tagline: "A food plan built around your stay",
    description:
      "One-on-one consultations with a wellness nutritionist, planning meals around the resort's own organic farm and kitchens.",
    image: "/renders/wellness-nutrition.jpg",
    includes: ["One-on-one consultation", "Farm-to-table planning", "Dietary programmes"],
    setting: "Wellness centre",
  },
  {
    id: "mental-health",
    name: "Mental Health Consultancy",
    tagline: "Someone to talk to, in a quiet place",
    description:
      "Private, confidential sessions with a qualified counsellor for stress, anxiety, burnout or simply a mind that needs room — held on a secluded deck looking out over the hills.",
    image: "/renders/nature-viewing-deck.jpg",
    includes: ["Qualified counsellor", "Fully confidential", "Stress & burnout care"],
    setting: "Hillside consultation deck",
  },
  {
    id: "physiotherapy",
    name: "Physiotherapy",
    tagline: "Move freely again",
    description:
      "Assessment and hands-on treatment from a licensed physiotherapist for back and joint pain, posture and recovery after injury, with an exercise plan to take home.",
    image: "/renders/spa-wellness-courtyard.jpg",
    includes: ["Licensed physiotherapist", "Pain & posture", "Injury recovery"],
    setting: "Wellness centre",
  },
  {
    id: "mudwalk",
    name: "Barefoot Mud Walk",
    tagline: "The estate, underfoot",
    description:
      "A dedicated barefoot trail through wet grass and natural earth — a simple, grounding counterpoint to the resort's built therapies.",
    image: "/renders/barefoot-earthing.jpg",
    includes: ["Natural-ground trail", "Guided walks", "Morning & dusk"],
    setting: "Across the estate",
  },
  {
    id: "reflexology",
    name: "Reflexology",
    tagline: "Pressure, precision and release",
    description:
      "Therapeutic foot reflexology in candle-lit treatment rooms, working pressure points to ease tension through the whole body.",
    image: "/brochure/reflexology.jpg",
    includes: ["Foot reflexology", "Warm oil therapy", "Private rooms"],
    setting: "Wellness centre",
  },
  {
    id: "gym",
    name: "Gym Training",
    tagline: "Keep your routine in the hills",
    description:
      "An equipped training studio with free weights, kettlebells and cardio, with personal training for guests keeping to a programme.",
    image: "/renders/fitness-studio.jpg",
    includes: ["Free weights", "Cardio equipment", "Personal training"],
    setting: "Fitness studio",
  },
  {
    id: "cupping",
    name: "Facial Cupping",
    tagline: "Gentle lift, natural glow",
    description:
      "Facial cupping and gua-sha stone therapy to stimulate circulation and relax the face — a quiet hour in a hill-view treatment room.",
    image: "/renders/spa-treatment.jpg",
    includes: ["Facial cupping", "Gua-sha stone", "Hill-view rooms"],
    setting: "Spa treatment rooms",
  },
  {
    id: "acupuncture",
    name: "Acupuncture",
    tagline: "An ancient practice, carefully given",
    description:
      "Traditional acupuncture sessions with a qualified practitioner, for relief, recovery and balance during your retreat.",
    image: "/brochure/acupuncture.jpg",
    includes: ["Qualified practitioner", "Consultation first", "Recovery focus"],
    setting: "Wellness centre",
  },
  {
    id: "quartz",
    name: "Quartz Therapy",
    tagline: "Stillness, crystal and scent",
    description:
      "Crystal and quartz therapy with incense and warm light — a meditative treatment designed purely for calm.",
    image: "/brochure/quartz-therapy.jpg",
    includes: ["Crystal therapy", "Aromatherapy", "Guided stillness"],
    setting: "Meditation rooms",
  },
  {
    id: "sound",
    name: "Sound Healing",
    tagline: "Let the bowls do the work",
    description:
      "Singing-bowl sound healing sessions, the resonance used to slow breath and settle the mind — individually or in small groups.",
    image: "/brochure/sound-healing.jpg",
    includes: ["Singing bowls", "Private or group", "Evening sessions"],
    setting: "Meditation rooms",
  },
];
