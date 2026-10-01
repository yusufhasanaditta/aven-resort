"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/components/sections/AccountActions";
import { Glass, PanelTitle } from "./ui";
import { ChangePasswordForm, EditProfileForm } from "./ProfileForms";
import { PhotoUploader } from "./PhotoUploader";
import { formatDate, type DashboardData } from "@/lib/account";
import type { ContactContent } from "@/data/cms-defaults";

export function ProfilePanel({ data, contact }: { data: DashboardData; contact: ContactContent }) {
  const { user } = data;
  const [editing, setEditing] = useState(false);
  const rows = [
    { k: "Full name", v: user.name },
    { k: "Email", v: user.email },
    { k: "Phone", v: user.phone },
    { k: "Location", v: user.location },
    { k: "Shareholder ID", v: user.memberId, mono: true },
    { k: "Share number", v: user.shareNumbers.join(", ") || "Issued with your first share", mono: user.shareNumbers.length > 0 },
    { k: "NID number", v: user.nid || "Not on file", mono: !!user.nid },
    { k: "Nominee", v: user.nomineeName ? `${user.nomineeName}${user.nomineeRelation ? ` (${user.nomineeRelation})` : ""}` : "Not on file" },
    { k: "Referred by", v: user.referredBy || "—" },
    { k: "Member since", v: formatDate(user.memberSince) },
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-5">
        <Glass>
          <PanelTitle
            eyebrow="Profile"
            title="Your details"
            action={
              !editing && (
                <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-gold-300 hover:underline">
                  Edit details
                </button>
              )
            }
          />
          <div className="mt-6">
            <PhotoUploader name={user.name} photoUrl={user.photoUrl} endpoint="/api/account/photo" />
          </div>
          {editing ? (
            <div className="mt-6 max-w-md">
              <EditProfileForm initial={{ name: user.name, phone: user.phone, location: user.location }} onDone={() => setEditing(false)} />
            </div>
          ) : (
            <dl className="mt-6 divide-y divide-white/6">
              {rows.map((r) => (
                <div key={r.k} className="grid grid-cols-[8rem_1fr] gap-4 py-3.5 text-sm">
                  <dt className="text-cream-200/50">{r.k}</dt>
                  <dd className={r.mono ? "font-mono text-cream-50" : "break-words text-cream-50"}>{r.v}</dd>
                </div>
              ))}
            </dl>
          )}
          <p className="mt-5 text-xs leading-relaxed text-cream-200/45">
            These details appear on your invoices and share documents. To change your email, NID or nominee, contact the Aven team.
          </p>
        </Glass>

        <Glass>
          <PanelTitle eyebrow="Security" title="Change password" />
          <div className="mt-6 max-w-md">
            <ChangePasswordForm />
          </div>
        </Glass>
      </div>

      <div className="space-y-5">
        <Glass>
          <PanelTitle eyebrow="Support" title="Your Aven team" />
          <ul className="mt-5 space-y-3 text-sm">
            <li>
              <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="text-cream-50 hover:text-gold-300">{contact.phone}</a>
              <p className="text-xs text-cream-200/45">{contact.hours}</p>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="break-all text-cream-50 hover:text-gold-300">{contact.email}</a>
            </li>
            <li className="text-xs leading-relaxed text-cream-200/55">{contact.headOffice}</li>
          </ul>
          <Link href="/contact" className="mt-5 inline-block text-xs font-semibold text-gold-300 hover:underline">
            Send a message →
          </Link>
        </Glass>
        <Glass className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 break-all text-sm text-cream-200/65">Signed in as {user.email}</p>
          <LogoutButton tone="light" />
        </Glass>
      </div>
    </div>
  );
}
