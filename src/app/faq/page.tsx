import type { Metadata } from "next";
import { getContent } from "@/lib/cms";
import { Container, Eyebrow } from "@/components/ui/Section";
import { Button, ArrowRight } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers about owning shares in Aven Eco Luxury Resort & Wellness — plans, instalments, payments, returns, free stays and the project timeline.",
};

/**
 * CMS-edited FAQ, grouped by category. Native <details> keeps the accordion
 * accessible without JavaScript; the JSON-LD lets search engines show the
 * answers directly.
 */
export default async function FaqPage() {
  const [faqs, contact] = await Promise.all([getContent("faqs"), getContent("contact")]);
  const categories = [...new Set(faqs.map((f) => f.category || "General"))];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="bg-leaf-swirl min-h-[80svh] bg-cream-100 pb-24 pt-[calc(var(--header-height)+3.5rem)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Container>
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Questions & answers</Eyebrow>
          <h1 className="mt-3 font-display text-display-md text-forest-900">Everything you&rsquo;d ask before owning a piece of the hills.</h1>

          <nav aria-label="FAQ categories" className="mt-8 flex flex-wrap gap-2">
            {categories.map((c) => (
              <a key={c} href={`#${encodeURIComponent(c)}`} className="rounded-full bg-cream-50 px-4 py-1.5 text-xs font-medium text-forest-800 ring-1 ring-forest-600/12 hover:ring-forest-600/35">
                {c}
              </a>
            ))}
          </nav>

          <div className="mt-10 space-y-10">
            {categories.map((c) => (
              <section key={c} id={encodeURIComponent(c)} className="scroll-mt-32">
                <h2 className="text-eyebrow text-forest-600/70">{c}</h2>
                <div className="mt-4 space-y-3">
                  {faqs
                    .filter((f) => (f.category || "General") === c)
                    .map((f) => (
                      <details key={f.question} className="group rounded-2xl bg-cream-50 shadow-lift ring-1 ring-forest-600/8 open:ring-forest-600/20">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-[0.9375rem] font-medium text-forest-900 [&::-webkit-details-marker]:hidden">
                          {f.question}
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest-600/8 text-forest-700 transition-transform duration-300 group-open:rotate-45">+</span>
                        </summary>
                        <p className="px-6 pb-6 text-[0.9375rem] leading-relaxed text-forest-900/65">{f.answer}</p>
                      </details>
                    ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-3xl bg-forest-950 p-8 text-cream-50 sm:flex sm:items-center sm:justify-between sm:gap-8">
            <div>
              <p className="font-display text-2xl">Still have a question?</p>
              <p className="mt-1 text-sm text-cream-200/65">Call {contact.phone} or leave your details and we&rsquo;ll call you.</p>
            </div>
            <div className="mt-5 shrink-0 sm:mt-0">
              <Button href="/ownership#interest" variant="light">
                Register interest
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
