import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ApplicationForm } from "@/components/sections/ApplicationForm";
import { Container, Eyebrow } from "@/components/ui/Section";
import { fallbackPlans } from "@/data/planFallback";

export const metadata: Metadata = {
  title: "Apply for shares",
  description: "Submit your Aven share-purchase application online — choose a package, add your details and nominee, and track approval from your dashboard.",
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
    discountPercent: p.discountPercent,
    accentColor: p.accentColor,
    featured: p.featured,
  }));

  return (
    <div className="bg-leaf-swirl min-h-[100svh] bg-cream-100 pb-24 pt-[calc(var(--header-height)+3rem)]">
      <Container>
        <div className="mb-10 max-w-2xl">
          <Eyebrow>Share purchase application</Eyebrow>
          <h1 className="mt-3 font-display text-display-md text-forest-900">Apply for your shares.</h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-forest-900/60">
            Four short steps. Nothing is charged now — once the Aven team approves your application,
            your instalment schedule appears on your dashboard, ready to pay online or by bank.
          </p>
        </div>

        {user ? (
          <ApplicationForm
            plans={list}
            initialPlan={plan}
            prefill={{ name: user.name, email: user.email, phone: user.phone, location: user.location }}
          />
        ) : (
          <div className="max-w-xl rounded-3xl bg-cream-50 p-8 shadow-lift ring-1 ring-forest-600/8">
            <h2 className="font-display text-3xl text-forest-900">First, your shareholder account.</h2>
            <p className="mt-2 text-sm text-forest-900/60">
              Applications are tied to your account so you can track approval, pay instalments and download receipts.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register?next=/apply" className="inline-flex h-12 items-center rounded-full bg-forest-600 px-7 text-sm font-medium text-cream-50 hover:bg-forest-700">
                Create an account
              </Link>
              <Link href="/login?next=/apply" className="inline-flex h-12 items-center rounded-full px-6 text-sm font-medium text-forest-700 ring-1 ring-forest-600/20 hover:bg-forest-600/5">
                I already have one
              </Link>
            </div>
            <p className="mt-6 text-xs text-forest-900/45">
              Just exploring? <Link href="/ownership#interest" className="font-medium text-forest-700 underline">Register your interest</Link> and we&rsquo;ll call you.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
