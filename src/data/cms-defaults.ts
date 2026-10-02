/**
 * Default content for every CMS section. Public pages render these until an
 * admin saves an edit (stored as JSON in `SiteContent`), and fall back to
 * them if the database is unreachable — the site never renders empty.
 *
 * Legal text below is a plain-language starting draft for Aven Limited to
 * review with counsel before launch; it is not legal advice.
 */
import { ownershipBenefits } from "@/data/ownership";
import { site } from "@/data/site";
import { gallery } from "@/data/gallery";

export type Announcement = { enabled: boolean; text: string; linkLabel: string; href: string };

export type HeroContent = {
  eyebrow: string;
  title: string;
  titleAccent: string;
  lede: string;
  image: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
  /** The line that scrolls across the band under the homepage banner. */
  ticker: string;
};

export type ResortContent = { headline: string; paragraphOne: string; paragraphTwo: string; motto: string };

export type ContactContent = {
  phone: string;
  email: string;
  whatsapp: string;
  headOffice: string;
  resortAddress: string;
  /** Google Maps link for the resort — every map and resort address opens it. */
  mapUrl: string;
  hours: string;
  website: string;
  facebook: string;
  instagram: string;
  youtube: string;
  linkedin: string;
  tiktok: string;
  x: string;
};

export type PaymentInstructions = {
  enabled: boolean;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  routingNumber: string;
  mobileBanking: string;
  note: string;
};

export type Benefit = { title: string; description: string; icon: string };
export type Faq = { question: string; answer: string; category: string };
export type LegalPage = { title: string; updated: string; body: string };
/** A gallery photo. `span`: "wide", "tall" or empty; `category`: one of the gallery filter ids. */
export type GalleryEntry = { src: string; title: string; caption: string; category: string; span: string };

/** The heading block at the top of each main page: `<page>Eyebrow`, `<page>Title`, `<page>Accent`, `<page>Lede`. */
export type PagesContent = Record<string, string>;
/** A message shown at the top of every shareholder's dashboard. */
export type AccountNotice = { enabled: boolean; title: string; text: string; linkLabel: string; href: string };

export type CmsContent = {
  announcement: Announcement;
  hero: HeroContent;
  resort: ResortContent;
  contact: ContactContent;
  payment: PaymentInstructions;
  benefits: Benefit[];
  faqs: Faq[];
  terms: LegalPage;
  privacy: LegalPage;
  gallery: GalleryEntry[];
  pages: PagesContent;
  accountNotice: AccountNotice;
};

export type CmsKey = keyof CmsContent;

export const cmsDefaults: CmsContent = {
  announcement: {
    enabled: false,
    text: "Share sales are open — five membership plans from Executive to Royal.",
    linkLabel: "See the plans",
    href: "/ownership",
  },
  hero: {
    eyebrow: "",
    title: "Welcome",
    titleAccent: "Aven Eco Luxury Resort and Wellness",
    lede: "",
    image: "/renders/hanging-bridge-dusk.jpg",
    primaryLabel: "Book Now",
    primaryHref: "/contact?type=booking#enquiry",
    secondaryLabel: "Own Your Share",
    secondaryHref: "/own-your-share",
    ticker: "Country's first wellness & retreat based resort",
  },
  resort: {
    headline:
      "What if you could find yourself in the ownership of a piece of the hills — surrounded by an almost surreal beauty of nature, making you the king of your own Aven kingdom?",
    paragraphOne:
      "Aven Eco Luxury & Wellness, in the hills of Sreemangal, is envisioned as a top wellness resort where luxury meets the raw, breathtaking beauty of nature — brought to life by communities from across the country.",
    paragraphTwo:
      "Here the next holiday trend is not about escaping, but retreating: your body and mind, towards a stronger, more passionate and peaceful self. A pathway to luxury, rooted in nature.",
    motto: site.motto,
  },
  contact: {
    phone: site.contact.phone,
    email: site.contact.email,
    whatsapp: site.contact.phone,
    headOffice: site.contact.headOffice,
    resortAddress: site.location.full,
    mapUrl: site.location.mapUrl,
    hours: site.contact.hours,
    website: site.contact.website,
    facebook: "",
    instagram: "",
    youtube: "",
    linkedin: "",
    tiktok: "",
    x: "",
  },
  payment: {
    enabled: false,
    bankName: "",
    accountName: "Aven Limited",
    accountNumber: "",
    branch: "",
    routingNumber: "",
    mobileBanking: "",
    note: "After a bank transfer or deposit, send the slip to the Aven team — your payment is confirmed on your dashboard once received.",
  },
  benefits: ownershipBenefits.map(({ title, description, icon }) => ({ title, description, icon })),
  faqs: [
    {
      category: "Ownership",
      question: "What exactly do I own when I buy a share?",
      answer:
        "Fractional ownership in the entire hotel and resort — all 20 features and amenities — backed by Saf-Kabla registered land. It is a share in the business and land, not a single room.",
    },
    {
      category: "Ownership",
      question: "How is my membership plan decided?",
      answer:
        "By the number of shares in your purchase: Executive (1–4), Gold (5–9), Platinum (10–19), Diamond (20–29) and Royal (30+). Each step up lowers the share price and adds more free days each year — from 3 days for Executive to 35 days for Royal.",
    },
    {
      category: "Payments",
      question: "Can I pay in installments?",
      answer:
        "Yes. Each plan has its own installment terms: a down payment at purchase, then 12 to 24 equal monthly installments (Executive 12, Gold 15, Platinum 18, Diamond 20, Royal 24), due on the 1st of each month. Or pay the full amount at once — every share is ৳5,00,000 either way. Your dashboard shows every due date, what you've paid and what remains.",
    },
    {
      category: "Payments",
      question: "How can I pay?",
      answer:
        "Online through SSLCommerz (cards, mobile banking and net banking), or by bank transfer or deposit. Every confirmed payment generates a money receipt you can download from your dashboard.",
    },
    {
      category: "Returns",
      question: "How do I earn from my shares?",
      answer:
        "Shareholders earn a share of annual profits from room stays, dining, events and activities — a halal income source — and can resell or transfer shares with projected capital gains.",
    },
    {
      category: "Stays",
      question: "How does the free stay work?",
      answer:
        "Every plan includes free days at the resort each year — 3 days for Executive, 10 for Gold, 18 for Platinum, 26 for Diamond and 35 for Royal.",
    },
    {
      category: "Project",
      question: "When will the resort be ready?",
      answer:
        "The project timeline is 3 years (36 months). This is the vision of Aven — current vision and design can be adapted based on project demands, and milestones are shared with shareholders as they are reached.",
    },
    {
      category: "Project",
      question: "Can I visit the site?",
      answer:
        "Yes — the resort land is at Begunbari, Radhanagar, Sreemangal. Contact the team to arrange a site visit.",
    },
  ],
  terms: {
    title: "Terms & Conditions",
    updated: "2026-09-26",
    body: `## About these terms
These terms govern use of this website and applications to purchase shares in Aven Eco Luxury Resort & Wellness, a project of Aven Limited.

## Share applications
Submitting an application or reservation does not by itself transfer ownership. Ownership is confirmed once Aven Limited approves the application and the required payment is received, and is documented through Saf-Kabla land registration.

## Pricing
Share prices follow the current Share Price & Membership Chart and apply to purchases made while that chart is valid. Every share is priced at ৳5,00,000, whether paid by installment or in full; the down payment and number of installments are set by the plan.

## Installments
Installment plans are payable on the due dates shown in your dashboard. Aven Limited may contact you about overdue installments and may review holdings with persistent arrears in line with your share agreement.

## Project vision
Renders, layouts and amenities describe the vision of Aven. The current vision and design can be adapted based on project demands.

## Contact
Questions about these terms can be sent to ${site.contact.email}.`,
  },
  privacy: {
    title: "Privacy Policy",
    updated: "2026-09-26",
    body: `## What we collect
When you register, submit an interest form or apply for shares, we collect the details you provide — such as your name, phone number, email, address, national ID and nominee details — along with your payment records.

## How we use it
We use your information to respond to enquiries, process applications and payments, maintain your share records, and contact you about your holding and the project.

## Payments
Online payments are processed by SSLCommerz. We do not store your card details.

## Sharing
We do not sell your information. It is shared only with service providers who help us operate (such as the payment gateway), or where required by law.

## Your choices
You can ask us to correct your details or stop marketing contact at any time by writing to ${site.contact.email}.`,
  },
  gallery: gallery.map((g) => ({ src: g.src, title: g.title, caption: g.caption, category: g.category, span: g.span ?? "" })),
  pages: {
    aboutEyebrow: "About AVEN",
    aboutTitle: "Avenue Towards Self —",
    aboutAccent: "Let's Make the Empire Together",
    aboutLede: site.description,
    ownershipEyebrow: "Ownership & membership",
    ownershipTitle: "Own a Piece",
    ownershipAccent: "of the Hills",
    ownershipLede:
      "Fractional ownership of the entire hotel and resort, backed by Saf-Kabla registered land — five membership plans from Executive to Royal, and a calculator that shows exactly what you'd pay.",
    wellnessEyebrow: "Wellness & Retreat",
    wellnessTitle: "Retreat, Don't Escape.",
    wellnessAccent: "Aven Cares for You",
    wellnessLede:
      "The next holiday trend is not simply about escaping — it is about retreating. Retreating your body and mind towards a stronger, more passionate and peaceful self. Nine therapies, all provided within the resort.",
    amenitiesEyebrow: "Site zoning & functions",
    amenitiesTitle: "Twenty Amenities.",
    amenitiesAccent: "A Share of Every One.",
    amenitiesLede:
      "Every shareholder holds fractional ownership of all the features and amenities of the resort, with Saf-Kabla land registration — from the library and tree house to the cloud walkway and helipad.",
    stayEyebrow: "The product",
    stayTitle: "140 Rooms.",
    stayAccent: "40 Private-Pool Villas.",
    stayLede:
      "Every key in the estate sits where the topography put it — the hotel on the highest point, the villas stepping down a slope, the nature stays lightest of all.",
    galleryEyebrow: "Gallery",
    galleryTitle: "The Estate,",
    galleryAccent: "Render by Render",
    galleryLede: "Architectural impressions of every zone — from the lit bridge across the valley to the tasting bar among the tea bushes.",
    contactEyebrow: "Get in touch",
    contactTitle: "We'd Love to",
    contactAccent: "Hear From You",
    contactLede: "Questions about the project, the land, the ownership structure or a site visit — the AVEN team is here to help.",
  },
  accountNotice: {
    enabled: false,
    title: "",
    text: "",
    linkLabel: "",
    href: "",
  },
};
