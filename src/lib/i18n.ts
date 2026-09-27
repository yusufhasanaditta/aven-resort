/**
 * English / Bangla. The chosen language lives in the `lang` cookie so every
 * page renders on the server in that language. Parts of the site written by
 * hand in Bangla are marked `translate="no"`; everything else is translated
 * automatically (see `AutoTranslate`) until it gets a hand-written version.
 */

export type Lang = "en" | "bn";

export const LANG_COOKIE = "lang";

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "bn";
}

/** 2,700 → ২,৭০০ */
export function bnDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);
}

/** Digits in the reader's script. */
export function num(lang: Lang, value: string | number) {
  return lang === "bn" ? bnDigits(value) : String(value);
}

/** Navigation labels and descriptions, keyed by href. */
export const navBn: Record<string, { label: string; description: string }> = {
  "/": { label: "হোম", description: "এক নজরে পুরো স্বপ্ন" },
  "/ownership": { label: "মালিকানা", description: "পাঁচটি মেম্বারশিপ প্ল্যান, ক্যালকুলেটর ও পেমেন্ট" },
  "/wellness": { label: "ওয়েলনেস", description: "নয়টি থেরাপি — অ্যাভেন আপনার যত্ন নেয়" },
  "/amenities": { label: "সুবিধাসমূহ", description: "লাইব্রেরি থেকে হেলিপ্যাড পর্যন্ত ২০টি সুবিধা" },
  "/accommodations": { label: "থাকার ব্যবস্থা", description: "১৪০ রুমের হোটেল ও ৪০টি প্রাইভেট-পুল ভিলা" },
  "/masterplan": { label: "মাস্টারপ্ল্যান", description: "পাঁচটি পাহাড় জুড়ে পুরো পরিকল্পনা" },
  "/gallery": { label: "গ্যালারি", description: "রেন্ডার ও ছবি" },
  "/about": { label: "আমাদের সম্পর্কে", description: "অ্যাভেন লিমিটেড ও আমাদের লক্ষ্য" },
  "/contact": { label: "যোগাযোগ", description: "ফোন, ইমেইল ও সাইট ভিজিট" },
};

/** Short interface strings used across the header and footer. */
export const ui = {
  en: {
    signIn: "Sign in",
    signUp: "Sign up",
    myAccount: "My account",
    adminPanel: "Admin panel",
    hi: "Hi",
    requestDetails: "Request Details",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    explore: "Explore",
    company: "Company",
    getInTouch: "Get in touch",
    applyForShares: "Apply for shares",
    faq: "FAQ",
    whatsapp: "WhatsApp us →",
    resortMap: "Resort · View on map ↗",
    corporateOffice: "Corporate office",
    followAven: "Follow Aven",
    followSub: "News, construction progress and life in the tea hills.",
    rights: "All rights reserved",
    terms: "Terms",
    privacy: "Privacy",
    disclaimer: "This is the vision of Aven. Renders are artistic impressions; current vision and design can be adapted based on the project demands.",
  },
  bn: {
    signIn: "সাইন ইন",
    signUp: "সাইন আপ",
    myAccount: "আমার অ্যাকাউন্ট",
    adminPanel: "অ্যাডমিন প্যানেল",
    hi: "হ্যালো",
    requestDetails: "বিস্তারিত জানুন",
    openMenu: "মেনু খুলুন",
    closeMenu: "মেনু বন্ধ করুন",
    language: "ভাষা",
    explore: "ঘুরে দেখুন",
    company: "প্রতিষ্ঠান",
    getInTouch: "যোগাযোগ করুন",
    applyForShares: "শেয়ারের জন্য আবেদন",
    faq: "সাধারণ প্রশ্ন",
    whatsapp: "হোয়াটসঅ্যাপে লিখুন →",
    resortMap: "রিসোর্ট · ম্যাপে দেখুন ↗",
    corporateOffice: "কর্পোরেট অফিস",
    followAven: "অ্যাভেনকে অনুসরণ করুন",
    followSub: "খবর, নির্মাণের অগ্রগতি ও চা-পাহাড়ের জীবন।",
    rights: "সর্বস্বত্ব সংরক্ষিত",
    terms: "শর্তাবলি",
    privacy: "গোপনীয়তা",
    disclaimer: "এটি অ্যাভেনের স্বপ্ন। রেন্ডারগুলো শিল্পীর কল্পনা; প্রকল্পের প্রয়োজনে বর্তমান পরিকল্পনা ও নকশা পরিবর্তিত হতে পারে।",
  },
} satisfies Record<Lang, Record<string, string>>;
