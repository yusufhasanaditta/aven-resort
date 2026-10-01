import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApplicationForm } from "@/components/sections/ApplicationForm";
import { Container, Eyebrow } from "@/components/ui/Section";
import { fallbackPlans } from "@/data/planFallback";

export const metadata: Metadata = {
  title: "Apply for shares",
  description: "Apply to become an Aven shareholder — choose a package, add your details and nominee. Once approved, your account and installment schedule are set up for you.",
};

export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const [user, { plan }] = await Promise.all([getCurrentUser(), searchParams]);

  const plans = await prisma.membershipPlan
    .findMany({ orderBy: { sortOrder: "asc" } })
    .catch(() => []);
  const list = (plans.length ? plans : fallbackPlans).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    minUnits: p.minUnits,
    maxUnits: p.maxUnits,
    unitPriceBDT: p.unitPriceBDT,
    freeStayNights: p.freeStayNights,
    fullPriceBDT: p.fullPriceBDT,
    downPaymentBDT: p.downPaymentBDT,
    installmentCount: p.installmentCount,
    accentColor: p.accentColor,
    featured: p.featured,
  }));

  return (
    <div className="bg-leaf-swirl min-h-[100svh] bg-cream-100 pb-24 pt-[calc(var(--header-height)+3rem)]">
      <Container>
        <div className="mb-10 max-w-2xl">
          <Eyebrow>Become a shareholder</Eyebrow>
          <h1 className="mt-3 font-display text-display-md text-forest-900">Apply for your shares.</h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-forest-900/60">
            Four short steps and nothing is charged now. The Aven team reviews every application; once it&rsquo;s
            approved, we open your shareholder account and send you your membership number, sign-in details and
            installment schedule.
          </p>
          {!user && (
            <p className="mt-3 text-xs text-forest-900/50">
              Already a shareholder?{" "}
              <Link href="/login?next=/apply" className="font-medium text-forest-700 underline">Sign in</Link> first so this application is added to your account.
            </p>
          )}
        </div>

        <ApplicationForm
          plans={list}
          initialPlan={plan}
          signedIn={!!user}
          prefill={user ? { name: user.name, email: user.email, phone: user.phone, location: user.location } : { name: "", email: "", phone: "", location: "" }}
        />
      </Container>
    </div>
  );
}
