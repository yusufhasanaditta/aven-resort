import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { InterestForm } from "@/components/sections/InterestForm";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { getContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Register your interest",
  description:
    "Tell the Aven team which membership plan and budget you have in mind — we'll call you with current pricing, installment options and a site visit in Sreemangal.",
};

/**
 * The "Register interest" destination: a no-commitment enquiry, distinct
 * from "Become a shareholder" (the formal application at /apply). Every
 * submission lands in the admin CRM as a lead.
 */
export default async function InterestPage() {
  const contact = await getContent("contact");

  return (
    <div className="bg-leaf-swirl min-h-[100svh] bg-cream-100 pb-24 pt-[calc(var(--header-height)+3rem)]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
          <Reveal>
            <Eyebrow>Register your interest</Eyebrow>
            <h1 className="mt-4 font-display text-display-md text-balance text-forest-900">
              Not ready to apply yet?
              <span className="block italic text-forest-600">Let&rsquo;s talk first.</span>
            </h1>
            <p className="mt-5 max-w-md text-pretty text-[0.9375rem] leading-relaxed text-forest-900/60">
              Share your preferred plan and budget. An Aven ownership advisor will call you — no
              account, no documents and no commitment needed.
            </p>

            <ol className="mt-8 space-y-4">
              {[
                ["We call you", "Within one working day, at a time that suits you."],
                ["You get the details", "Current share prices, down payment and the installment schedule for your plan."],
                ["Visit Sreemangal", "See the land in the Radhanagar tea hills before you decide."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-600 font-numeral text-sm text-cream-50">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block font-medium text-forest-900">{t}</span>
                    <span className="block text-sm text-forest-900/55">{d}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="relative mt-10 hidden aspect-[16/9] overflow-hidden rounded-3xl shadow-lift lg:block">
              <Image src="/renders/eco-villa-sunrise.jpg" alt="An Aven villa with its private pool at sunrise above the tea hills" fill sizes="40vw" className="object-cover" />
            </div>

            <div className="mt-8 rounded-2xl border border-forest-600/12 bg-cream-50 p-5">
              <p className="text-sm font-semibold text-forest-900">Already decided?</p>
              <p className="mt-1 text-xs text-forest-900/55">
                <Link href="/apply" className="font-medium text-forest-700 underline underline-offset-2">Become a shareholder</Link>{" "}
                with the online application, or call us on{" "}
                <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="font-medium text-forest-700 underline underline-offset-2">
                  {contact.phone}
                </a>
                .
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <InterestForm source="interest-page" />
          </Reveal>
        </div>
      </Container>
    </div>
  );
}
