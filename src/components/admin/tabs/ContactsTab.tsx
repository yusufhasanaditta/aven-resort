"use client";

import { useMemo, useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import {
  Avatar,
  Btn,
  Card,
  Empty,
  ErrorNote,
  LeadBadge,
  LoadingRows,
  PageHeader,
  SearchInput,
  Segmented,
  firstError,
  relTime,
  send,
  useAdminFetch,
  useToast,
} from "../kit";
import type { AdminLead } from "@/lib/admin-types";
import type { AdminNav } from "../AdminShell";
import { formatDate } from "@/lib/account";

type Filter = "OPEN" | "NEW" | "DONE";

/**
 * "Contact me for more information" requests from the Apply now chooser —
 * kept apart from the Leads CRM so the team can work through them as a call
 * list. One worth pursuing moves to the CRM with everything it has so far.
 */
export function ContactsTab({ nav, onChanged }: { nav: AdminNav; onChanged: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ leads: AdminLead[] }>("/api/admin/leads?source=contact-request");
  const [filter, setFilter] = useState<Filter>("OPEN");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const toast = useToast();

  const all = useMemo(() => data?.leads ?? [], [data]);
  const isDone = (l: AdminLead) => l.status === "CLOSED" || l.status === "CONVERTED";
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((l) => {
      if (filter === "NEW" && l.status !== "NEW") return false;
      if (filter === "OPEN" && isDone(l)) return false;
      if (filter === "DONE" && !isDone(l)) return false;
      return !needle || [l.name, l.email, l.phone, l.message ?? ""].some((v) => v.toLowerCase().includes(needle));
    });
  }, [all, filter, q]);

  async function update(l: AdminLead, body: Record<string, unknown>, done: string) {
    setBusy(l.id);
    const { ok, json } = await send(`/api/admin/leads/${l.id}`, "PATCH", body);
    setBusy(null);
    if (!ok) return toast(firstError(json), "error");
    toast(done);
    reload();
    onChanged();
  }

  async function remove(l: AdminLead) {
    if (!window.confirm(`Delete ${l.name}'s request? This can't be undone.`)) return;
    setBusy(l.id);
    const { ok, json } = await send(`/api/admin/leads/${l.id}`, "DELETE");
    setBusy(null);
    if (!ok) return toast(firstError(json), "error");
    toast("Request deleted");
    reload();
    onChanged();
  }

  return (
    <>
      <PageHeader
        title="Contact requests"
        description="Visitors who chose “Contact me for more information” on Apply now — call or email them back, then mark them done."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "OPEN", label: "To follow up", count: all.filter((l) => !isDone(l)).length },
            { value: "NEW", label: "New", count: all.filter((l) => l.status === "NEW").length },
            { value: "DONE", label: "Done", count: all.filter(isDone).length },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Search name, phone, email…" className="w-full sm:w-72" />
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      <Card>
        {loading && !data ? (
          <LoadingRows rows={5} />
        ) : shown.length === 0 ? (
          <Empty icon="mail" title={all.length ? "Nothing here" : "No contact requests yet"}>
            {all.length ? "Try another filter." : "When a visitor asks to be contacted from Apply now, they appear here."}
          </Empty>
        ) : (
          <ul className="divide-y divide-[#EEF0EC]">
            {shown.map((l) => (
              <li key={l.id} className="flex flex-wrap items-start gap-4 px-5 py-4">
                <Avatar name={l.name} className="h-10 w-10 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#14201B]">
                    {l.name} <LeadBadge status={l.status} />
                  </p>
                  <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[0.8125rem]">
                    <a href={`tel:${l.phone.replace(/[^0-9+]/g, "")}`} className="inline-flex items-center gap-1.5 text-forest-700 hover:underline">
                      <AdminIcon icon="bell" className="h-3.5 w-3.5" /> {l.phone}
                    </a>
                    <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 break-all text-forest-700 hover:underline">
                      <AdminIcon icon="mail" className="h-3.5 w-3.5" /> {l.email}
                    </a>
                  </p>
                  {l.message && <p className="mt-2 whitespace-pre-line text-[0.8125rem] text-[#3D4A44]">{l.message}</p>}
                  <p className="mt-1.5 text-xs text-[#8A948E]" title={formatDate(l.createdAt)}>
                    Asked {relTime(l.createdAt)}
                    {l.lastContactedAt && <> · contacted {relTime(l.lastContactedAt)}</>}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!isDone(l) && l.status !== "CONTACTED" && (
                    <Btn size="sm" variant="primary" icon="check" disabled={busy === l.id} onClick={() => update(l, { status: "CONTACTED" }, `${l.name} marked contacted`)}>
                      Contacted
                    </Btn>
                  )}
                  {!isDone(l) && (
                    <Btn size="sm" disabled={busy === l.id} onClick={() => update(l, { status: "CLOSED" }, `${l.name} marked done`)}>
                      Done
                    </Btn>
                  )}
                  <Btn
                    size="sm"
                    icon="users"
                    disabled={busy === l.id}
                    onClick={async () => {
                      await update(l, { source: "apply-contact" }, `${l.name} moved to the Leads CRM`);
                      nav("leads", { id: l.id });
                    }}
                  >
                    Move to CRM
                  </Btn>
                  <Btn size="sm" variant="danger" disabled={busy === l.id} onClick={() => remove(l)} aria-label={`Delete ${l.name}'s request`}>
                    Delete
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
