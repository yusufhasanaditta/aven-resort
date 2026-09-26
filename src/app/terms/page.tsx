import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { LegalPage } from "@/components/sections/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default async function TermsPage() {
  return <LegalPage eyebrow="Legal" content={await getContent("terms")} />;
}
