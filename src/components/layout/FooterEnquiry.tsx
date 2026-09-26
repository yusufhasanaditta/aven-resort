"use client";

import { usePathname } from "next/navigation";
import { Button, ArrowRight } from "@/components/ui/Button";

/**
 * Pages that already close on their own call to action — the homepage's
 * "Let's make the empire together", and the account, admin and auth screens —
 * skip the footer's enquiry band so the same pitch isn't made twice in a row.
 */
const HIDDEN = [/^\/$/, /^\/account/, /^\/admin/, /^\/login/, /^\/register/];

export function FooterEnquiry() {
  const pathname = usePathname();
  if (HIDDEN.some((re) => re.test(pathname))) return null;

  return (
    <div className="border-b border-cream-50/10">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-8 px-5 py-16 sm:px-8 lg:flex-row lg:items-end lg:justify-between lg:py-20">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-gold-400">Ownership enquiries</p>
          <h2 className="mt-4 font-display text-display-md text-balance text-cream-50">
            Own a piece of the hills of Sreemangal.
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-sm leading-relaxed text-cream-200/65">
            Unit shares are offered across six membership plans, Executive to
            Royal — each carrying Saf-Kabla registered land, annual halal
            profits and free stays. Speak to the Aven team for current
            availability.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <Button href="/contact" variant="light" size="lg">
            Request details
            <ArrowRight />
          </Button>
          <Button href="/ownership" variant="outline-light" size="lg">
            Membership plans
          </Button>
        </div>
      </div>
    </div>
  );
}
