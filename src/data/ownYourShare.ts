/**
 * Copy for the bilingual "Own Your Share" page, in English and Bangla.
 *
 * Structure follows the ownership landing page the client pointed to
 * (hero with fact cards → why own → business model → process → plans →
 * gallery → FAQ → locations → call to action). Every claim is Aven's own,
 * taken from the brochure data used elsewhere on the site, not from the
 * reference site.
 */

export type Lang = "en" | "bn";

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "bn";
}

/** 2,700 → ২,৭০০ */
export function bnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

type Copy = {
  switchTo: string;
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    lede: string;
    enquire: string;
    apply: string;
    chips: string[];
    facts: { icon: string; value: string; label: string }[];
  };
  why: { eyebrow: string; title: string; lede: string; items: { icon: string; title: string; body: string }[] };
  model: { eyebrow: string; title: string; lede: string; items: { title: string; body: string }[]; note: string; cta: string };
  process: { eyebrow: string; title: string; steps: { title: string; body: string }[] };
  plans: { eyebrow: string; title: string; lede: string; shares: (min: number, max: number | null) => string; stay: (days: number) => string; cta: string };
  gallery: { eyebrow: string; title: string; lede: string; items: { src: string; caption: string }[] };
  faq: { eyebrow: string; title: string; items: { q: string; a: string }[]; more: string };
  locations: { eyebrow: string; title: string; lede: string; resort: string; office: string; openMap: string };
  cta: { title: string; lede: string; hours: string; apply: string; interest: string; call: string };
};

const galleryImages = [
  "/renders/masterplan-aerial.jpg",
  "/renders/main-hotel-aerial.jpg",
  "/renders/hillside-villas-valley.jpg",
  "/renders/glass-tea-restaurant.jpg",
  "/renders/spa-wellness-courtyard.jpg",
  "/renders/hanging-bridge-dusk.jpg",
];

export const shareCopy: Record<Lang, Copy> = {
  en: {
    switchTo: "বাংলা",
    hero: {
      eyebrow: "Share ownership opportunity",
      title: "Own a Share of",
      titleAccent: "Aven Eco Luxury Resort",
      lede: "Saf-Kabla registered ownership in an eco-luxury wellness resort in the tea hills of Sreemangal — with annual halal income and free stays every year.",
      enquire: "Ownership enquiry",
      apply: "Apply online",
      chips: ["Saf-Kabla registered land", "Annual halal income", "20 amenities", "Free stay every year"],
      facts: [
        { icon: "map", value: "5 Acres · 15.15 Bigha", label: "Land area" },
        { icon: "layers", value: "2,700", label: "Total shares" },
        { icon: "calendar", value: "140 · 40", label: "Rooms · Villas" },
        { icon: "crown", value: "5 Plans", label: "Executive to Royal" },
      ],
    },
    why: {
      eyebrow: "Why own",
      title: "Why own a share of Aven?",
      lede: "A secure asset in the hills, an income every year, and a place to come back to.",
      items: [
        { icon: "document", title: "Saf-Kabla registered land", body: "Your share is backed by registered land title in the Radhanagar tea hills of Sreemangal." },
        { icon: "building", title: "The whole resort", body: "Every share is a fraction of the entire hotel and resort — all 20 amenities, not a single room." },
        { icon: "chart", title: "Annual halal income", body: "Your share of the profit from rooms, dining, wellness and events, paid out every year." },
        { icon: "key", title: "Free stays & resale", body: "Up to 35 free days at the resort each year, and the freedom to sell or transfer." },
      ],
    },
    model: {
      eyebrow: "Business model",
      title: "Where the profit comes from",
      lede: "Five income streams under one roof, shared transparently with every shareholder.",
      items: [
        { title: "Room & villa booking", body: "140 hotel rooms and 40 private-pool villas, let to guests all year round." },
        { title: "Events & conference", body: "Weddings, corporate retreats and conferences in the ballroom and pavilion." },
        { title: "Wellness & retreat", body: "Yoga, spa and nine wellness therapies set in the tea gardens." },
        { title: "Restaurant & more", body: "The glass tea restaurant, lounges and adventure activities across the estate." },
        { title: "Organic farm", body: "Fresh produce from the resort's own organic farm." },
      ],
      note: "Profit is distributed to shareholders every year, in proportion to the shares they hold.",
      cta: "Start your ownership",
    },
    process: {
      eyebrow: "How it works",
      title: "Ownership process",
      steps: [
        { title: "Initial consultation", body: "Call us or register your interest — an ownership advisor walks you through the plans and pricing." },
        { title: "Site visit & documents", body: "Visit Sreemangal and review the Saf-Kabla papers and project documents." },
        { title: "Application & payment", body: "Apply online with your NID and nominee details, then pay in full or in monthly installments." },
        { title: "Registration", body: "Your shares are registered and your Aven membership card is issued." },
        { title: "Earn & enjoy", body: "Receive your annual profit and enjoy your free stays at the resort." },
      ],
    },
    plans: {
      eyebrow: "Membership plans",
      title: "Five plans, set by the shares you hold",
      lede: "Every plan owns the same resort — more shares bring more free days in the hills each year.",
      shares: (min, max) => (max === null ? `${min}+ shares` : min === max ? `${min} share` : `${min}–${max} shares`),
      stay: (days) => `${days} free days a year`,
      cta: "Calculate your share",
    },
    gallery: {
      eyebrow: "Gallery",
      title: "Project gallery",
      lede: "Architectural renders of the resort in the Radhanagar tea hills.",
      items: [
        "The masterplan across five tea hills",
        "The main hotel on the ridge",
        "Hillside villas above the valley",
        "The glass tea restaurant",
        "The spa and wellness courtyard",
        "The cloud walkway at dusk",
      ].map((caption, i) => ({ src: galleryImages[i], caption })),
    },
    faq: {
      eyebrow: "FAQ",
      title: "Common questions",
      items: [
        { q: "Is my ownership legally protected?", a: "Yes. Every share is backed by Saf-Kabla registered land, and each purchase is documented with a signed agreement and a money receipt for every payment." },
        { q: "What is the minimum I can buy?", a: "One share. Your plan is set by the number of shares you hold: Executive 1–4, Gold 5–9, Platinum 10–19, Diamond 20–29 and Royal 30 or more." },
        { q: "Can I pay in installments?", a: "Yes. Pay a down payment, then 12 to 24 monthly installments depending on your plan — or pay in full at once. Every share is ৳5,00,000 either way. Your schedule, amount paid and remaining balance are always visible in your shareholder dashboard." },
        { q: "Can I visit the site before buying?", a: "Of course. Book a guided site visit to Sreemangal and meet the team on the land itself." },
        { q: "Can I sell or transfer my shares later?", a: "Yes. Shares can be transferred or sold at any time." },
      ],
      more: "More questions",
    },
    locations: {
      eyebrow: "Locations",
      title: "Visit us",
      lede: "See the land in Sreemangal, or meet us at our office in Dhaka.",
      resort: "Aven Eco Luxury Resort",
      office: "Corporate office, Dhaka",
      openMap: "Open in Google Maps",
    },
    cta: {
      title: "Start your ownership journey today",
      lede: "Our ownership advisors are ready to help you make an informed decision.",
      hours: "Available",
      apply: "Apply online",
      interest: "Register interest",
      call: "Call now",
    },
  },

  bn: {
    switchTo: "English",
    hero: {
      eyebrow: "নিরাপদ সম্পদ গড়ার সুযোগ",
      title: "‘অ্যাভেন ইকো লাক্সারি রিসোর্ট’-এ",
      titleAccent: "আপনার মালিকানা",
      lede: "শ্রীমঙ্গলের চা-পাহাড়ে ইকো-লাক্সারি ওয়েলনেস রিসোর্টে সাফ কাবলা নিবন্ধিত মালিকানা — বাৎসরিক হালাল আয় ও প্রতি বছর ফ্রি অবকাশসহ।",
      enquire: "মালিকানা সংক্রান্ত জিজ্ঞাসা",
      apply: "অনলাইনে আবেদন",
      chips: ["সাফ কাবলা নিবন্ধিত জমি", "বাৎসরিক হালাল আয়", "২০টি সুবিধা", "প্রতি বছর ফ্রি অবকাশ"],
      facts: [
        { icon: "map", value: "৫ একর · ১৫.১৫ বিঘা", label: "জমির পরিমাণ" },
        { icon: "layers", value: "২,৭০০", label: "মোট শেয়ার" },
        { icon: "calendar", value: "১৪০ · ৪০", label: "রুম · ভিলা" },
        { icon: "crown", value: "৫টি প্ল্যান", label: "এক্সিকিউটিভ থেকে রয়্যাল" },
      ],
    },
    why: {
      eyebrow: "কেন মালিক হবেন",
      title: "কেন অ্যাভেনের শেয়ারের মালিক হবেন?",
      lede: "পাহাড়ে একটি নিরাপদ সম্পদ, প্রতি বছর নিয়মিত আয়, আর বারবার ফিরে আসার একটি ঠিকানা।",
      items: [
        { icon: "document", title: "সাফ কাবলা নিবন্ধিত জমি", body: "শ্রীমঙ্গলের রাধানগর চা-পাহাড়ে নিবন্ধিত জমির দলিল দ্বারা আপনার শেয়ার সুরক্ষিত।" },
        { icon: "building", title: "পুরো রিসোর্টের মালিকানা", body: "প্রতিটি শেয়ার পুরো হোটেল ও রিসোর্টের অংশ — একটি রুম নয়, ২০টি সুবিধার সবগুলোতেই।" },
        { icon: "chart", title: "বাৎসরিক হালাল আয়", body: "রুম, রেস্টুরেন্ট, ওয়েলনেস ও ইভেন্ট থেকে অর্জিত মুনাফার অংশ প্রতি বছর।" },
        { icon: "key", title: "ফ্রি অবকাশ ও হস্তান্তর", body: "প্রতি বছর সর্বোচ্চ ৩৫ দিন ফ্রি অবকাশ, এবং যেকোনো সময় বিক্রি বা হস্তান্তরের সুযোগ।" },
      ],
    },
    model: {
      eyebrow: "ব্যবসায়িক মডেল",
      title: "মুনাফা কোথা থেকে আসে",
      lede: "এক ছাদের নিচে পাঁচটি আয়ের উৎস, প্রত্যেক শেয়ারহোল্ডারের সাথে স্বচ্ছভাবে বণ্টিত।",
      items: [
        { title: "রুম ও ভিলা বুকিং", body: "১৪০টি হোটেল রুম ও ৪০টি প্রাইভেট-পুল ভিলা, সারা বছর অতিথিদের কাছে ভাড়া।" },
        { title: "ইভেন্ট ও কনফারেন্স", body: "বলরুম ও প্যাভিলিয়নে বিয়ে, কর্পোরেট রিট্রিট ও কনফারেন্স।" },
        { title: "ওয়েলনেস এন্ড রিট্রিট", body: "চা-বাগানের মাঝে যোগব্যায়াম, স্পা ও নয়টি ওয়েলনেস থেরাপি।" },
        { title: "রেস্টুরেন্ট ও অন্যান্য", body: "গ্লাস টি রেস্টুরেন্ট, লাউঞ্জ ও পুরো এস্টেট জুড়ে অ্যাডভেঞ্চার অ্যাক্টিভিটি।" },
        { title: "অর্গানিক ফার্ম", body: "রিসোর্টের নিজস্ব অর্গানিক ফার্মের তাজা উৎপাদন।" },
      ],
      note: "প্রতি বছর শেয়ারহোল্ডারদের মধ্যে তাদের শেয়ারের অনুপাতে মুনাফা বণ্টন করা হয়।",
      cta: "মালিকানা শুরু করুন",
    },
    process: {
      eyebrow: "কিভাবে কাজ করে",
      title: "মালিকানা প্রক্রিয়া",
      steps: [
        { title: "প্রাথমিক পরামর্শ", body: "আমাদের কল করুন বা আগ্রহ জানান — একজন মালিকানা উপদেষ্টা প্ল্যান ও মূল্য বিস্তারিত জানাবেন।" },
        { title: "সাইট ভিজিট ও কাগজপত্র যাচাই", body: "শ্রীমঙ্গলে সরেজমিনে দেখুন এবং সাফ কাবলা দলিল ও প্রকল্পের কাগজপত্র যাচাই করুন।" },
        { title: "আবেদন ও পেমেন্ট", body: "এনআইডি ও নমিনির তথ্য দিয়ে অনলাইনে আবেদন করুন, তারপর এককালীন বা মাসিক কিস্তিতে পরিশোধ করুন।" },
        { title: "মালিকানা নিবন্ধন", body: "আপনার শেয়ার নিবন্ধিত হবে এবং অ্যাভেন মেম্বারশিপ কার্ড প্রদান করা হবে।" },
        { title: "আয় ও সুবিধা উপভোগ", body: "প্রতি বছর মুনাফা পান এবং রিসোর্টে আপনার ফ্রি অবকাশ উপভোগ করুন।" },
      ],
    },
    plans: {
      eyebrow: "মেম্বারশিপ প্ল্যান",
      title: "আপনার শেয়ার সংখ্যা অনুযায়ী পাঁচটি প্ল্যান",
      lede: "প্রতিটি প্ল্যানই একই রিসোর্টের মালিক — শেয়ার যত বেশি, প্রতি বছর পাহাড়ে ফ্রি অবকাশ তত বেশি।",
      shares: (min, max) =>
        max === null ? `${bnDigits(min)}+ শেয়ার` : min === max ? `${bnDigits(min)}টি শেয়ার` : `${bnDigits(min)}–${bnDigits(max)}টি শেয়ার`,
      stay: (days) => `বছরে ${bnDigits(days)} দিন ফ্রি অবকাশ`,
      cta: "আপনার শেয়ার হিসাব করুন",
    },
    gallery: {
      eyebrow: "গ্যালারি",
      title: "প্রকল্প গ্যালারি",
      lede: "রাধানগর চা-পাহাড়ে রিসোর্টের আর্কিটেকচারাল রেন্ডার।",
      items: [
        "পাঁচটি চা-পাহাড় জুড়ে মাস্টারপ্ল্যান",
        "পাহাড়ের চূড়ায় মূল হোটেল",
        "উপত্যকার উপরে পাহাড়ি ভিলা",
        "গ্লাস টি রেস্টুরেন্ট",
        "স্পা ও ওয়েলনেস কোর্টইয়ার্ড",
        "গোধূলিতে ক্লাউড ওয়াকওয়ে",
      ].map((caption, i) => ({ src: galleryImages[i], caption })),
    },
    faq: {
      eyebrow: "প্রশ্নোত্তর",
      title: "সাধারণ প্রশ্নসমূহ",
      items: [
        { q: "আমার মালিকানা কি আইনগতভাবে সুরক্ষিত?", a: "হ্যাঁ। প্রতিটি শেয়ার সাফ কাবলা নিবন্ধিত জমি দ্বারা সুরক্ষিত, এবং প্রতিটি ক্রয় স্বাক্ষরিত চুক্তি ও প্রতিটি পেমেন্টের মানি রিসিটের মাধ্যমে নথিভুক্ত।" },
        { q: "সর্বনিম্ন কতটি শেয়ার কেনা যায়?", a: "একটি শেয়ার। আপনার শেয়ার সংখ্যা অনুযায়ী প্ল্যান নির্ধারিত হয়: এক্সিকিউটিভ ১–৪, গোল্ড ৫–৯, প্লাটিনাম ১০–১৯, ডায়মন্ড ২০–২৯ এবং রয়্যাল ৩০ বা তার বেশি।" },
        { q: "কিস্তিতে পরিশোধ করা যাবে কি?", a: "হ্যাঁ। প্ল্যান অনুযায়ী ডাউন পেমেন্টের পর ১২ থেকে ২৪টি মাসিক কিস্তিতে পরিশোধ করতে পারবেন — অথবা এককালীন পরিশোধ করতে পারবেন। উভয় ক্ষেত্রেই প্রতি শেয়ার ৫,০০,০০০ টাকা। আপনার কিস্তির সময়সূচি, পরিশোধিত ও বাকি টাকা সবসময় শেয়ারহোল্ডার ড্যাশবোর্ডে দেখা যাবে।" },
        { q: "কেনার আগে কি সাইট পরিদর্শন করা যাবে?", a: "অবশ্যই। শ্রীমঙ্গলে গাইডেড সাইট ভিজিট বুক করুন এবং সরাসরি জমিতে আমাদের টিমের সাথে দেখা করুন।" },
        { q: "পরে কি শেয়ার বিক্রি বা হস্তান্তর করা যাবে?", a: "হ্যাঁ। যেকোনো সময় শেয়ার হস্তান্তর বা বিক্রি করা যায়।" },
      ],
      more: "আরও প্রশ্ন",
    },
    locations: {
      eyebrow: "অবস্থানসমূহ",
      title: "আমাদের সাথে দেখা করুন",
      lede: "শ্রীমঙ্গলে জমি সরেজমিনে দেখুন, অথবা ঢাকায় আমাদের অফিসে আসুন।",
      resort: "অ্যাভেন ইকো লাক্সারি রিসোর্ট",
      office: "কর্পোরেট অফিস, ঢাকা",
      openMap: "গুগল ম্যাপে দেখুন",
    },
    cta: {
      title: "আজই আপনার মালিকানা যাত্রা শুরু করুন",
      lede: "আমাদের মালিকানা উপদেষ্টারা আপনাকে সঠিক সিদ্ধান্ত নিতে সাহায্য করতে প্রস্তুত।",
      hours: "সময়",
      apply: "অনলাইনে আবেদন",
      interest: "আগ্রহ জানান",
      call: "এখনই কল করুন",
    },
  },
};
