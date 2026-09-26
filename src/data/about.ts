/**
 * Who AVEN is, and how the project is positioned.
 *
 * From "AVEN — Land, Resort, Hotel & Tourism Development" and "The Vision".
 */

export const about = {
  intro:
    "Aven Eco Luxury Resort & Wellness, in the hills of Sreemangal, is envisioned as a top wellness resort where luxury meets the raw, breathtaking beauty of nature. A project brought to life by multiple communities from across the country — and in the process, creating a real-time, impactful community of its own.",
  vision: {
    title: "The Vision",
    body: "Aven Limited is a forward-thinking real estate, hotel and resort development company building sustainable, design-led destinations. We blend investment-grade asset creation with ecological stewardship.",
  },
  designIntent: {
    title: "Connect without cutting hills",
    body: "The masterplan's governing rule is written into the bridge: preserve the topography, create the drama. Buildings step down slopes rather than levelling them, the lake occupies a valley that was already there, and 55% of the estate stays as nature.",
  },
  pillars: [
    {
      title: "Sustainability",
      body: "Organic farm, rainwater harvesting and a protected bird sanctuary, designed in from the masterplan rather than added later.",
    },
    {
      title: "Excellence",
      body: "A 5-star programme — 40 suites, 10–12 villas, spa, ballroom and MICE — built to investment grade throughout.",
    },
    {
      title: "Community",
      body: "Ownership admits investors to a business community, and the project creates long-term livelihoods in Moulvibazar.",
    },
    {
      title: "Integrity",
      body: "Saf-Kabla registered land title, transparent fractional structure and flexible resale from day one.",
    },
  ],
  timelineNote:
    "Aven Eco Luxury Resort & Wellness is at share-sales stage, with a 30-month project timeline. This is the vision of Aven — current vision and design can be adapted based on the project demands, and delivery milestones are confirmed directly with the Aven team.",
} as const;

/** Positioning claims used across the site. */
export const positioning = [
  {
    stat: "5",
    label: "Acres of land",
    detail: "2,17,800 sq ft in the Radhanagar tea hills.",
  },
  {
    stat: "2700",
    label: "Unit shares",
    detail: "Six membership plans, Executive to Royal.",
  },
  {
    stat: "20",
    label: "Amenities",
    detail: "Every shareholder owns a fraction of each.",
  },
  {
    stat: "120",
    label: "Suites & villas",
    detail: "100 hotel suites plus 20 private-pool villas.",
  },
];

/** Contact-page enquiry types. Mirrors the tabbed form in the UI mockups. */
export const inquiryTypes = [
  {
    id: "booking",
    label: "Booking & Site Visit",
    blurb: "Reserve a pre-opening stay or book a guided site visit to the Sreemangal hills.",
  },
  {
    id: "ownership",
    label: "Ownership Interest",
    blurb: "Unit shares, categories and the ownership structure.",
  },
  {
    id: "general",
    label: "General Inquiry",
    blurb: "Anything about the project, the site or the company.",
  },
  {
    id: "partnership",
    label: "Partnership & Media",
    blurb: "Institutional partners, press and collaboration.",
  },
] as const;

export const inquirySubjects = [
  "Room / villa booking",
  "Unit share pricing",
  "Ownership categories",
  "Masterplan & land allocation",
  "Site visit request",
  "Project documentation",
  "Partnership proposal",
  "Other",
];
