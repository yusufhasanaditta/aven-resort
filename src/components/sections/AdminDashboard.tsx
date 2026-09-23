"use client";

import { useState } from "react";
import { Container, Eyebrow, Section } from "@/components/ui/Section";
import { LogoutButton } from "@/components/sections/AccountActions";
import { OverviewTab } from "@/components/sections/admin/OverviewTab";
import { UsersTab } from "@/components/sections/admin/UsersTab";
import { InquiriesTab } from "@/components/sections/admin/InquiriesTab";
import { PlansTab } from "@/components/sections/admin/PlansTab";
import { AssetsTab } from "@/components/sections/admin/AssetsTab";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "shareholders", label: "Shareholders" },
  { id: "inquiries", label: "Enquiries" },
  { id: "plans", label: "Membership plans" },
  { id: "assets", label: "Site media" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AdminDashboard({ adminName }: { adminName: string }) {
  const [active, setActive] = useState<TabId>("overview");

  return (
    <div className="pt-[var(--header-height)]">
      <Section tone="forest" className="py-12">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Eyebrow tone="light">Admin panel</Eyebrow>
              <h1 className="mt-2 font-display text-display-sm text-cream-50">
                Control room
              </h1>
              <p className="mt-1 text-[0.8125rem] text-cream-200/55">
                Signed in as {adminName}
              </p>
            </div>
            <LogoutButton />
          </div>
        </Container>
      </Section>

      <Section tone="white" className="py-10 sm:py-14">
        <Container>
          <div
            role="tablist"
            aria-label="Admin sections"
            className="flex flex-wrap gap-2 border-b border-forest-600/10 pb-6"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active === tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  "rounded-full px-4 py-2 text-[0.8125rem] font-medium transition-colors",
                  active === tab.id
                    ? "bg-forest-600 text-cream-50"
                    : "bg-forest-600/7 text-forest-800/75 hover:bg-forest-600/12",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8">
            {active === "overview" && <OverviewTab />}
            {active === "shareholders" && <UsersTab />}
            {active === "inquiries" && <InquiriesTab />}
            {active === "plans" && <PlansTab />}
            {active === "assets" && <AssetsTab />}
          </div>
        </Container>
      </Section>
    </div>
  );
}
