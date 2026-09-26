import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  return <LegalPage eyebrow="Legal" content={await getContent("privacy")} />;
}
