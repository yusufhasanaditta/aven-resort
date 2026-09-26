import Link from "next/link";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { fallbackPlans } from "@/data/planFallback";

/**
 * The six membership cards fanned out like a dealt hand. Hovering (or
 * focusing) a card straightens it and lifts it clear of the others. On small
 * screens the fan becomes a horizontal snap-scroll row instead.
 *
 * Uses the static brochure plan data — this is a showcase of the plans, and
 * only the terms printed on the cards are shown here; live pricing lives in
 * the calculator on /ownership.
 */
export function MembershipSpread() {
  const n = fallbackPlans.length;
  return (
    <>
      {/* Desktop: the fan */}
      <div className="relative mx-auto hidden h-[25rem] max-w-[76rem] lg:block">
        {fallbackPlans.map((plan, i) => {
          const t = i - (n - 1) / 2; // -2.5 … 2.5
          return (
            <Link
              key={plan.slug}
              href={`/ownership?plan=${plan.slug}#calculator`}
              aria-label={`${plan.name} membership — calculate this plan`}
              className="absolute left-1/2 top-10 origin-bottom outline-none transition-[transform,filter] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:translateX(calc(-50%_+_var(--x)))_translateY(var(--y))_rotate(var(--r))] hover:z-50 hover:[transform:translateX(calc(-50%_+_var(--x)))_translateY(-2.25rem)_rotate(0deg)_scale(1.04)] focus-visible:z-50 focus-visible:[transform:translateX(calc(-50%_+_var(--x)))_translateY(-2.25rem)_rotate(0deg)_scale(1.04)]"
              style={
                {
                  "--x": `${t * 9.5}rem`,
                  "--y": `${Math.abs(t) * 0.9}rem`,
                  "--r": `${t * 4}deg`,
                  zIndex: 10 + i,
                } as React.CSSProperties
              }
            >
              <MembershipCard plan={plan} />
            </Link>
          );
        })}
      </div>

      {/* Mobile & tablet: a snap row */}
      <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:px-8 lg:hidden">
        {fallbackPlans.map((plan) => (
          <Link
            key={plan.slug}
            href={`/ownership?plan=${plan.slug}#calculator`}
            className="shrink-0 snap-center"
          >
            <MembershipCard plan={plan} className="w-[19rem] sm:w-[23rem]" />
          </Link>
        ))}
      </div>
    </>
  );
}
