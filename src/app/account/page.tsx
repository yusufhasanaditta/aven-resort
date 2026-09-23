import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatBDT } from "@/lib/shares";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { Num } from "@/components/ui/Number";
import { Button, ArrowRight } from "@/components/ui/Button";
import { LogoutButton, PayNextButton } from "@/components/sections/AccountActions";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "My Account" };

const statusStyle: Record<string, string> = {
  ACTIVE: "bg-forest-600/10 text-forest-700",
  PENDING_PAYMENT: "bg-gold-500/12 text-gold-600",
  CANCELLED: "bg-forest-900/8 text-forest-900/50",
};

const paymentStatusStyle: Record<string, string> = {
  SUCCESS: "text-forest-700",
  PENDING: "text-gold-600",
  FAILED: "text-red-600",
  CANCELLED: "text-forest-900/40",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const { payment } = await searchParams;

  const holdings = await prisma.shareHolding.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { plan: true, payments: { orderBy: { installmentNo: "asc" } } },
  });

  const totalUnits = holdings
    .filter((h) => h.status === "ACTIVE")
    .reduce((sum, h) => sum + h.units, 0);
  const totalInvested = holdings
    .filter((h) => h.status === "ACTIVE")
    .reduce((sum, h) => sum + h.totalAmountBDT, 0);

  return (
    <div className="pt-[var(--header-height)]">
      <Section tone="forest" className="py-14 sm:py-16">
        <Container>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <Eyebrow tone="light">Shareholder account</Eyebrow>
              <h1 className="mt-3 font-display text-display-sm text-cream-50">
                Welcome back, {user.name.split(" ")[0]}
              </h1>
              <p className="mt-2 text-[0.8125rem] text-cream-200/60">
                {user.email} · {user.location}
              </p>
            </div>
            <LogoutButton />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-cream-50/12 bg-cream-50/10 sm:grid-cols-3">
            <div className="bg-forest-950/40 p-6">
              <Num as="dt" size="xl" className="text-cream-50">
                {totalUnits}
              </Num>
              <dd className="mt-1 text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/50">
                Active unit shares
              </dd>
            </div>
            <div className="bg-forest-950/40 p-6">
              <Num as="dt" size="xl" className="text-cream-50">
                {holdings.length}
              </Num>
              <dd className="mt-1 text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/50">
                Holdings on record
              </dd>
            </div>
            <div className="col-span-2 bg-forest-950/40 p-6 sm:col-span-1">
              <p className="font-numeral text-2xl text-cream-50">
                {formatBDT(totalInvested)}
              </p>
              <dd className="mt-1 text-[0.6875rem] uppercase tracking-[0.14em] text-cream-200/50">
                Active investment
              </dd>
            </div>
          </dl>
        </Container>
      </Section>

      {payment && (
        <Container className="mt-8">
          <p
            className={cn(
              "rounded-xl px-5 py-3 text-sm",
              payment === "success" && "bg-forest-600/10 text-forest-700",
              payment === "failed" && "bg-gold-500/12 text-gold-600",
              payment === "cancelled" && "bg-forest-900/8 text-forest-900/60",
            )}
          >
            {payment === "success" &&
              "Payment received — it can take a minute to reflect below while SSLCommerz confirms it."}
            {payment === "failed" && "That payment did not go through. You can retry it below."}
            {payment === "cancelled" && "Payment was cancelled. You can try again below."}
          </p>
        </Container>
      )}

      <Section tone="white">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="font-display text-display-sm text-forest-900">
              Your holdings
            </h2>
            <Button href="/ownership#calculator" variant="secondary" size="sm">
              Buy more shares
              <ArrowRight />
            </Button>
          </div>

          {holdings.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-forest-600/20 p-10 text-center">
              <p className="text-[0.9375rem] text-forest-900/60">
                You don&rsquo;t hold any shares yet.
              </p>
              <div className="mt-5">
                <Button href="/ownership#calculator">
                  Calculate a share plan
                  <ArrowRight />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-6">
              {holdings.map((holding) => {
                const paidCount = holding.payments.filter((p) => p.status === "SUCCESS").length;
                const totalDue =
                  holding.paymentPlan === "INSTALLMENT" ? holding.installmentMonths ?? 1 : 1;
                const fullyPaid = paidCount >= totalDue;
                const hasPending = holding.payments.some((p) => p.status === "PENDING");

                return (
                  <article
                    key={holding.id}
                    className="overflow-hidden rounded-2xl border border-forest-600/10 bg-cream-100"
                  >
                    <div
                      className="flex flex-wrap items-center justify-between gap-4 p-6"
                      style={{
                        borderBottom: `3px solid ${holding.plan.accentColor}`,
                      }}
                    >
                      <div>
                        <p className="text-eyebrow text-forest-600/60">
                          {holding.plan.name} Category
                        </p>
                        <h3 className="mt-1 font-display text-2xl text-forest-900">
                          <Num as="span" size="md">{holding.units}</Num> unit
                          share{holding.units > 1 ? "s" : ""}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-wider",
                            statusStyle[holding.status],
                          )}
                        >
                          {holding.status === "PENDING_PAYMENT"
                            ? "Pending payment"
                            : holding.status === "ACTIVE"
                              ? "Active"
                              : "Cancelled"}
                        </span>
                        <p className="font-numeral text-lg text-forest-900">
                          {formatBDT(holding.totalAmountBDT)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-6 p-6 lg:grid-cols-[1fr_auto]">
                      <div>
                        <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-forest-900/40">
                          {holding.paymentPlan === "INSTALLMENT"
                            ? `Instalment plan · ${holding.installmentMonths} months`
                            : "Full payment"}
                        </p>
                        <ul className="mt-3 space-y-2">
                          {holding.payments.map((p) => (
                            <li
                              key={p.id}
                              className="flex items-center justify-between gap-4 text-[0.8125rem]"
                            >
                              <span className="text-forest-900/70">
                                {holding.paymentPlan === "INSTALLMENT"
                                  ? `Instalment ${p.installmentNo}/${holding.installmentMonths}`
                                  : "Full payment"}
                              </span>
                              <span className="flex items-center gap-3">
                                <span className="font-numeral text-forest-900/80">
                                  {formatBDT(p.amountBDT)}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-semibold uppercase tracking-wide",
                                    paymentStatusStyle[p.status],
                                  )}
                                >
                                  {p.status}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {!fullyPaid && !hasPending && (
                        <div className="flex items-start lg:items-center">
                          <PayNextButton
                            holdingId={holding.id}
                            label={
                              holding.paymentPlan === "INSTALLMENT"
                                ? "Pay next instalment"
                                : "Complete payment"
                            }
                          />
                        </div>
                      )}
                      {hasPending && (
                        <p className="text-xs text-gold-600 lg:self-center">
                          A payment is in progress for this holding.
                        </p>
                      )}
                      {fullyPaid && (
                        <p className="text-xs font-medium text-forest-700 lg:self-center">
                          Fully paid
                        </p>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <p className="mt-10 text-xs leading-relaxed text-forest-900/40">
            Need help with an order or a document?{" "}
            <Link href="/contact" className="font-medium text-forest-700 hover:underline">
              Contact the AVEN team
            </Link>
            .
          </p>
        </Container>
      </Section>
    </div>
  );
}
