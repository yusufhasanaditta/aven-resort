import Link from "next/link";
import { LogoutButton } from "@/components/sections/AccountActions";
import { Glass, PanelTitle } from "./ui";
import { formatDate, type DashboardData } from "@/lib/account";
import { site } from "@/data/site";

export function ProfilePanel({ data }: { data: DashboardData }) {
  const { user } = data;
  const rows = [
    { k: "Full name", v: user.name },
    { k: "Email", v: user.email },
    { k: "Phone", v: user.phone },
    { k: "Location", v: user.location },
    { k: "Member ID", v: user.memberId, mono: true },
    { k: "Member since", v: formatDate(user.memberSince) },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <Glass>
        <PanelTitle eyebrow="Profile" title="Your details" />
        <dl className="mt-6 divide-y divide-white/6">
          {rows.map((r) => (
            <div key={r.k} className="grid grid-cols-[8rem_1fr] gap-4 py-3.5 text-sm">
              <dt className="text-cream-200/50">{r.k}</dt>
              <dd className={r.mono ? "font-mono text-cream-50" : "text-cream-50"}>{r.v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 text-xs leading-relaxed text-cream-200/45">
          These details appear on your invoices and share documents. To change
          them, contact the Aven team so your registered records stay consistent.
        </p>
      </Glass>

      <div className="space-y-5">
        <Glass>
          <PanelTitle eyebrow="Support" title="Your Aven team" />
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href={site.contact.phoneHref} className="text-cream-50 hover:text-gold-300">{site.contact.phone}</a>
              <p className="text-xs text-cream-200/45">{site.contact.hours}</p>
            </li>
            <li>
              <a href={site.contact.emailHref} className="break-all text-cream-50 hover:text-gold-300">{site.contact.email}</a>
            </li>
            <li className="text-xs leading-relaxed text-cream-200/55">{site.contact.headOffice}</li>
          </ul>
          <Link href="/contact" className="mt-5 inline-block text-xs font-semibold text-gold-300 hover:underline">
            Send a message →
          </Link>
        </Glass>
        <Glass className="flex items-center justify-between">
          <p className="text-sm text-cream-200/65">Signed in as {user.email}</p>
          <LogoutButton tone="light" />
        </Glass>
      </div>
    </div>
  );
}
