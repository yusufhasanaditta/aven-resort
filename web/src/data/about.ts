/**
 * Who AVEN is, and how the project is positioned.
 *
 * From "AVEN — Land, Resort, Hotel & Tourism Development" and "The Vision".
 */

export const about = {
  intro:
    "AVEN is a real estate, hotel and resort development company committed to building distinguished, lasting destinations. Aven Tea Empire is our flagship eco-luxury resort project in Srimangal, developed as a 5-star eco-tourism destination with shares available to investors.",
  vision: {
    title: "The Vision",
    body: "AVEN Ltd. is a forward-thinking real estate, hotel and resort development company building sustainable, design-led destinations. We blend investment-grade asset creation with ecological stewardship.",
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
    "Aven Tea Empire is at masterplan and share-sales stage. Figures on this site are transcribed from the project masterplan document; construction and delivery milestones are confirmed directly with the AVEN team.",
} as const;

/** Positioning claims used across the site. */
export const positioning = [
  {
    stat: "5-Star",
    label: "Eco-tourism destination",
    detail: "Positioned as Srimangal's first true eco-luxury resort.",
  },
  {
    stat: "55 / 45",
    label: "Nature to luxury",
    detail: "Built with balance — most of the estate stays green.",
  },
  {
    stat: "17",
    label: "Masterplan zones",
    detail: "Every acre allocated, classified and costed.",
  },
  {
    stat: "60",
    label: "Keys at scale",
    detail: "40 suites plus 10–12 villas, plus nature stays.",
  },
];

/** Contact-page enquiry types. Mirrors the tabbed form in the UI mockups. */
export const inquiryTypes = [
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
  "Unit share pricing",
  "Ownership categories",
  "Masterplan & land allocation",
  "Site visit request",
  "Project documentation",
  "Partnership proposal",
  "Other",
];
