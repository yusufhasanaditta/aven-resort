import { RichText } from "@/components/ui/RichText";
import { Container, Eyebrow } from "@/components/ui/Section";
import { formatDate } from "@/lib/account";
import type { LegalPage as LegalContent } from "@/data/cms-defaults";

/** Shared layout for the CMS-edited Terms and Privacy pages. */
export function LegalPage({ eyebrow, content }: { eyebrow: string; content: LegalContent }) {
  const updated = /^\d{4}-\d{2}-\d{2}$/.test(content.updated) ? formatDate(`${content.updated}T12:00:00+06:00`) : content.updated;
  return (
    <div className="bg-leaf-swirl min-h-[80svh] bg-cream-100 pb-24 pt-[calc(var(--header-height)+3.5rem)]">
      <Container>
        <article className="mx-auto max-w-3xl rounded-3xl bg-cream-50 p-8 shadow-lift ring-1 ring-forest-600/8 sm:p-14">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-3 font-display text-display-sm text-forest-900">{content.title}</h1>
          <p className="mt-2 text-xs text-forest-900/45">Last updated {updated}</p>
          <RichText text={content.body} className="mt-8" />
        </article>
      </Container>
    </div>
  );
}
