"use client";

import { useMemo, useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import {
  ExportButton,
  Avatar,
  Badge,
  Btn,
  Card,
  DefinitionGrid,
  Drawer,
  Empty,
  ErrorNote,
  Field,
  LeadBadge,
  LoadingRows,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  SelectInput,
  TextArea,
  TextInput,
  firstError,
  leadStages,
  relTime,
  send,
  useAdminFetch,
  useToast,
} from "../kit";
import type { AdminLead, AdminLeadNote, LeadStatus } from "@/lib/admin-types";
import type { TabFocus } from "../AdminShell";
import { ownershipTiers } from "@/data/ownership";
import { daysUntil, formatDate } from "@/lib/account";
import { formatBDT, formatBDTCompact } from "@/lib/shares";
import { cn } from "@/lib/utils";

type Filter = "ALL" | "DUE" | LeadStatus;

const NOTE_KINDS = [
  { value: "NOTE", label: "Note", icon: "invoice" },
  { value: "CALL", label: "Call", icon: "bell" },
  { value: "WHATSAPP", label: "WhatsApp", icon: "mail" },
  { value: "EMAIL", label: "Email", icon: "mail" },
  { value: "MEETING", label: "Meeting", icon: "users" },
  { value: "SITE_VISIT", label: "Site visit", icon: "calendar" },
] as const;

function followUpState(iso: string | null, now: string) {
  if (!iso) return null;
  const d = daysUntil(iso, now);
  return { d, label: d < 0 ? `${-d}d overdue` : d === 0 ? "Today" : d === 1 ? "Tomorrow" : formatDate(iso) };
}

function isOpen(l: AdminLead) {
  return l.status !== "CONVERTED" && l.status !== "CLOSED";
}

export function LeadsTab({ focus, onChanged }: { focus: TabFocus; onChanged: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ leads: AdminLead[] }>("/api/admin/leads");
  const [view, setView] = useState<"board" | "list">("board");
  const [filter, setFilter] = useState<Filter>((focus.filter?.toUpperCase() as Filter) ?? "ALL");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(focus.id ?? null);
  const [creating, setCreating] = useState(!!focus.create);
  const toast = useToast();
  const [now] = useState(() => new Date().toISOString());

  const leads = useMemo(() => data?.leads ?? [], [data]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (filter === "DUE") {
        const f = followUpState(l.nextFollowUpAt, now);
        if (!f || f.d > 0 || !isOpen(l)) return false;
      } else if (filter !== "ALL" && l.status !== filter) return false;
      if (!needle) return true;
      return [l.name, l.email, l.phone, l.location ?? "", l.packageSlug ?? ""].some((v) => v.toLowerCase().includes(needle));
    });
  }, [leads, filter, q, now]);

  const dueCount = leads.filter((l) => {
    const f = followUpState(l.nextFollowUpAt, now);
    return f && f.d <= 0 && isOpen(l);
  }).length;

  async function moveTo(lead: AdminLead, status: LeadStatus) {
    if (lead.status === status) return;
    const { ok, json } = await send(`/api/admin/leads/${lead.id}`, "PATCH", { status });
    if (!ok) return toast(firstError(json), "error");
    toast(`${lead.name} → ${leadStages.find((s) => s.value === status)?.label}`);
    reload();
    onChanged();
  }

  const pipelineValue = leads.filter(isOpen).reduce((s, l) => s + (l.investmentBDT ?? 0), 0);

  return (
    <>
      <PageHeader
        title="Leads CRM"
        description={`Every interest-form and contact-form submission, plus leads the team adds. Open pipeline value ${formatBDTCompact(pipelineValue)}.`}
        actions={
          <>
            <ExportButton kind="leads" />
            <Btn variant="primary" icon="users" onClick={() => setCreating(true)}>
              New lead
            </Btn>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: "All", count: leads.length },
            { value: "DUE", label: "Follow-ups due", count: dueCount },
            ...leadStages.map((s) => ({ value: s.value as Filter, label: s.label, count: leads.filter((l) => l.status === s.value).length })),
          ]}
        />
        <div className="flex items-center gap-2">
          <SearchInput value={q} onChange={setQ} placeholder="Name, phone, email…" className="w-56" />
          <Segmented value={view} onChange={setView} options={[{ value: "board", label: "Board" }, { value: "list", label: "List" }]} />
        </div>
      </div>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : view === "board" ? (
        <Board leads={shown} now={now} onOpen={setOpenId} onMove={moveTo} />
      ) : (
        <LeadTable leads={shown} now={now} onOpen={setOpenId} />
      )}

      <LeadDrawer
        id={openId}
        onClose={() => setOpenId(null)}
        onChanged={() => {
          reload();
          onChanged();
        }}
      />
      <NewLeadModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={(id) => {
          setCreating(false);
          reload();
          onChanged();
          setOpenId(id);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ board */

function Board({
  leads,
  now,
  onOpen,
  onMove,
}: {
  leads: AdminLead[];
  now: string;
  onOpen: (id: string) => void;
  onMove: (lead: AdminLead, status: LeadStatus) => void;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<string | null>(null);

  return (
    <div className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
      {leadStages.map((stage) => {
        const col = leads.filter((l) => l.status === stage.value);
        const value = col.reduce((s, l) => s + (l.investmentBDT ?? 0), 0);
        return (
          <section
            key={stage.value}
            aria-label={stage.label}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(stage.value);
            }}
            onDragLeave={() => setOver((o) => (o === stage.value ? null : o))}
            onDrop={() => {
              const lead = leads.find((l) => l.id === dragId);
              if (lead) onMove(lead, stage.value);
              setDragId(null);
              setOver(null);
            }}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-2xl border bg-[#F1F3EF] transition-colors",
              over === stage.value ? "border-forest-400 bg-emerald-50/60" : "border-transparent",
            )}
          >
            <header className="flex items-center justify-between px-3.5 pb-2 pt-3">
              <span className="flex items-center gap-2">
                <LeadBadge status={stage.value} />
                <span className="text-xs font-semibold tabular-nums text-[#3D4A44]">{col.length}</span>
              </span>
              {value > 0 && <span className="text-[0.6875rem] tabular-nums text-[#6B756F]">{formatBDTCompact(value)}</span>}
            </header>
            <div className="flex min-h-[8rem] flex-1 flex-col gap-2 px-2.5 pb-2.5">
              {col.map((l) => {
                const f = followUpState(l.nextFollowUpAt, now);
                return (
                  <button
                    key={l.id}
                    type="button"
                    draggable
                    onDragStart={() => setDragId(l.id)}
                    onDragEnd={() => setDragId(null)}
                    onClick={() => onOpen(l.id)}
                    className={cn(
                      "group rounded-xl border border-[#E6E8E3] bg-white p-3 text-left shadow-[0_1px_2px_rgba(16,24,20,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-14px_rgba(16,24,20,0.4)]",
                      dragId === l.id && "opacity-40",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <Avatar name={l.name} className="h-8 w-8 text-[0.6875rem]" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[0.8125rem] font-semibold text-[#14201B]">
                          {l.priority === 2 && <span className="mr-1 text-amber-500" title="Hot lead">●</span>}
                          {l.name}
                        </p>
                        <p className="truncate text-[0.6875rem] text-[#6B756F]">{l.phone}</p>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {l.packageSlug && <Badge tone="gray" className="capitalize">{l.packageSlug}</Badge>}
                      {l.investmentBDT ? <span className="text-[0.6875rem] font-medium tabular-nums text-[#3D4A44]">{formatBDTCompact(l.investmentBDT)}</span> : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[0.6875rem] text-[#8A948E]">
                      {f && isOpen(l) ? (
                        <span className={cn("inline-flex items-center gap-1 font-medium", f.d < 0 ? "text-red-600" : f.d === 0 ? "text-amber-700" : "text-[#6B756F]")}>
                          <AdminIcon icon="calendar" className="h-3 w-3" /> {f.label}
                        </span>
                      ) : (
                        <span>{relTime(l.createdAt)}</span>
                      )}
                      {!!l._count?.notes && <span>{l._count.notes} notes</span>}
                    </div>
                  </button>
                );
              })}
              {col.length === 0 && (
                <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-[#D5DAD3] py-6 text-[0.6875rem] text-[#9AA39E]">
                  Drop a lead here
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ table */

function LeadTable({ leads, now, onOpen }: { leads: AdminLead[]; now: string; onOpen: (id: string) => void }) {
  if (!leads.length) {
    return (
      <Card>
        <Empty icon="users" title="No leads match">Try another stage or search.</Empty>
      </Card>
    );
  }
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[56rem] text-left text-[0.8125rem]">
        <thead className="border-b border-[#EEF0EC] bg-[#FAFBF9] text-[0.6875rem] uppercase tracking-wide text-[#6B756F]">
          <tr>
            <th className="px-5 py-3 font-medium">Lead</th>
            <th className="py-3 font-medium">Stage</th>
            <th className="py-3 font-medium">Interest</th>
            <th className="py-3 text-right font-medium">Budget</th>
            <th className="py-3 pl-6 font-medium">Follow-up</th>
            <th className="py-3 font-medium">Source</th>
            <th className="px-5 py-3 text-right font-medium">Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#EEF0EC]">
          {leads.map((l) => {
            const f = followUpState(l.nextFollowUpAt, now);
            return (
              <tr key={l.id} onClick={() => onOpen(l.id)} className="cursor-pointer transition-colors hover:bg-[#FAFBF9]">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={l.name} className="h-8 w-8" />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[#14201B]">{l.name}</p>
                      <p className="truncate text-xs text-[#6B756F]">{l.phone} · {l.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3"><LeadBadge status={l.status} /></td>
                <td className="py-3 capitalize text-[#3D4A44]">
                  {l.packageSlug ?? "—"}
                  {l.units ? <span className="text-[#8A948E]"> · {l.units} sh</span> : null}
                </td>
                <td className="py-3 text-right tabular-nums text-[#14201B]">{l.investmentBDT ? formatBDTCompact(l.investmentBDT) : "—"}</td>
                <td className={cn("py-3 pl-6 text-xs", f && f.d < 0 && isOpen(l) ? "font-medium text-red-600" : "text-[#3D4A44]")}>
                  {f && isOpen(l) ? f.label : "—"}
                </td>
                <td className="py-3 text-xs text-[#6B756F]">{l.source}</td>
                <td className="px-5 py-3 text-right text-xs text-[#6B756F]">{relTime(l.createdAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

/* ----------------------------------------------------------------- drawer */

function dateInput(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }) : "";
}

function plusDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

function LeadDrawer({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const { data, reload } = useAdminFetch<{ lead: AdminLead }>(id ? `/api/admin/leads/${id}` : null);
  const lead = id && data?.lead.id === id ? data.lead : null;
  const toast = useToast();
  const [kind, setKind] = useState<string>("CALL");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function patch(update: Record<string, unknown>, message?: string) {
    if (!lead) return;
    const { ok, json } = await send(`/api/admin/leads/${lead.id}`, "PATCH", update);
    if (!ok) return toast(firstError(json), "error");
    if (message) toast(message);
    reload();
    onChanged();
  }

  async function addNote() {
    if (!lead || !body.trim()) return;
    setBusy(true);
    const { ok, json } = await send(`/api/admin/leads/${lead.id}/notes`, "POST", { kind, body });
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    setBody("");
    toast("Logged on the timeline");
    reload();
    onChanged();
  }

  async function remove() {
    if (!lead) return;
    const { ok, json } = await send(`/api/admin/leads/${lead.id}`, "DELETE");
    if (!ok) return toast(firstError(json), "error");
    toast("Lead deleted");
    setConfirmDelete(false);
    onClose();
    onChanged();
  }

  const wa = lead ? `https://wa.me/${lead.phone.replace(/[^0-9]/g, "").replace(/^0/, "880")}` : "#";

  return (
    <Drawer
      open={!!id}
      onClose={onClose}
      title={
        lead ? (
          <span className="flex items-center gap-3">
            <Avatar name={lead.name} />
            <span className="min-w-0">
              <span className="block truncate">{lead.name}</span>
              <span className="block text-xs font-normal text-[#6B756F]">Added {relTime(lead.createdAt)} · {lead.source}</span>
            </span>
          </span>
        ) : (
          "Loading…"
        )
      }
      footer={
        lead && (
          <div className="flex items-center justify-between gap-2">
            {confirmDelete ? (
              <span className="flex items-center gap-2 text-xs text-red-600">
                Delete permanently?
                <Btn size="sm" variant="danger" onClick={remove}>Yes, delete</Btn>
                <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>Keep</Btn>
              </span>
            ) : (
              <Btn size="sm" variant="ghost" onClick={() => setConfirmDelete(true)}>Delete lead</Btn>
            )}
            {lead.status !== "CONVERTED" && (
              <Btn variant="primary" icon="layers" onClick={() => patch({ status: "CONVERTED" }, "Marked as converted")}>
                Mark converted
              </Btn>
            )}
          </div>
        )
      }
    >
      {!lead && <LoadingRows rows={6} />}
      {lead && (
        <div className="space-y-5">
          {/* Quick contact */}
          <div className="grid grid-cols-3 gap-2">
            <a href={`tel:${lead.phone}`} className="flex flex-col items-center gap-1 rounded-xl border border-[#E6E8E3] bg-white py-3 text-xs font-medium text-[#24312B] hover:border-forest-300">
              <AdminIcon icon="bell" className="h-4 w-4 text-forest-600" /> Call
            </a>
            <a href={wa} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 rounded-xl border border-[#E6E8E3] bg-white py-3 text-xs font-medium text-[#24312B] hover:border-forest-300">
              <AdminIcon icon="mail" className="h-4 w-4 text-emerald-600" /> WhatsApp
            </a>
            <a href={`mailto:${lead.email}`} className="flex flex-col items-center gap-1 rounded-xl border border-[#E6E8E3] bg-white py-3 text-xs font-medium text-[#24312B] hover:border-forest-300">
              <AdminIcon icon="mail" className="h-4 w-4 text-sky-600" /> Email
            </a>
          </div>

          {/* Stage */}
          <Card className="p-4">
            <p className="mb-2.5 text-xs font-medium text-[#6B756F]">Pipeline stage</p>
            <div className="flex flex-wrap gap-1.5">
              {leadStages.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => patch({ status: s.value }, `Moved to ${s.label}`)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    lead.status === s.value ? "border-forest-600 bg-forest-600 text-white" : "border-[#DDE1DB] bg-white text-[#3D4A44] hover:border-forest-300",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Next follow-up">
                {(fid) => (
                  <div>
                    <TextInput
                      id={fid}
                      type="date"
                      value={dateInput(lead.nextFollowUpAt)}
                      onChange={(e) => patch({ nextFollowUpAt: e.target.value ? `${e.target.value}T09:00:00+06:00` : null }, "Follow-up updated")}
                    />
                    <div className="mt-1.5 flex gap-1">
                      {[["Tomorrow", 1], ["+3 days", 3], ["+1 week", 7]].map(([l, n]) => (
                        <button
                          key={l}
                          type="button"
                          onClick={() => patch({ nextFollowUpAt: `${plusDays(n as number)}T09:00:00+06:00` }, "Follow-up scheduled")}
                          className="rounded-md bg-[#F0F2EF] px-2 py-0.5 text-[0.6875rem] text-[#3D4A44] hover:bg-[#E4E8E2]"
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </Field>
              <Field label="Priority">
                {(fid) => (
                  <SelectInput id={fid} value={lead.priority} onChange={(e) => patch({ priority: Number(e.target.value) }, "Priority updated")}>
                    <option value={0}>Normal</option>
                    <option value={1}>Warm</option>
                    <option value={2}>Hot</option>
                  </SelectInput>
                )}
              </Field>
            </div>
          </Card>

          {/* Details */}
          <Card className="p-4">
            <DefinitionGrid
              items={[
                { k: "Phone", v: lead.phone },
                { k: "Email", v: lead.email },
                { k: "Location", v: lead.location },
                { k: "Preferred package", v: <span className="capitalize">{lead.packageSlug}</span> },
                { k: "Shares wanted", v: lead.units },
                { k: "Investment budget", v: lead.investmentBDT ? formatBDT(lead.investmentBDT) : null },
                { k: "Payment preference", v: lead.paymentPref?.toLowerCase() },
                { k: "Last contacted", v: lead.lastContactedAt ? relTime(lead.lastContactedAt) : "Not yet" },
                { k: "Owner", v: lead.assignedTo },
              ]}
            />
            {lead.message && (
              <p className="mt-4 whitespace-pre-line rounded-xl bg-[#F5F7F3] p-3 text-[0.8125rem] leading-relaxed text-[#3D4A44]">{lead.message}</p>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-4">
            <p className="mb-3 text-xs font-medium text-[#6B756F]">Log activity</p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {NOTE_KINDS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  onClick={() => setKind(k.value)}
                  className={cn(
                    "rounded-lg px-2.5 py-1 text-xs font-medium",
                    kind === k.value ? "bg-[#14201B] text-white" : "bg-[#F0F2EF] text-[#3D4A44] hover:bg-[#E4E8E2]",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
            <TextArea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What happened? What's next?" aria-label="Activity details" />
            <div className="mt-2 flex justify-end">
              <Btn variant="primary" size="sm" onClick={addNote} disabled={busy || !body.trim()}>
                {busy ? "Saving…" : "Add to timeline"}
              </Btn>
            </div>

            <ol className="relative mt-5 space-y-4 before:absolute before:inset-y-1 before:left-[11px] before:w-px before:bg-[#E6E8E3]">
              {(lead.notes ?? []).map((n: AdminLeadNote) => (
                <li key={n.id} className="relative pl-8">
                  <span
                    className={cn(
                      "absolute left-0 top-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-[0.5625rem] font-bold",
                      n.kind === "STATUS" ? "bg-violet-100 text-violet-700" : n.kind === "NOTE" ? "bg-[#EEF1EC] text-[#4B5751]" : "bg-emerald-100 text-emerald-700",
                    )}
                  >
                    {n.kind === "STATUS" ? "↻" : n.kind[0]}
                  </span>
                  <p className="text-[0.8125rem] text-[#14201B]">{n.body}</p>
                  <p className="mt-0.5 text-[0.6875rem] text-[#8A948E]">
                    {n.kind === "STATUS" ? "Update" : NOTE_KINDS.find((k) => k.value === n.kind)?.label} · {n.authorName} · {relTime(n.createdAt)}
                  </p>
                </li>
              ))}
              {!lead.notes?.length && <li className="pl-8 text-xs text-[#9AA39E]">No activity yet.</li>}
            </ol>
          </Card>
        </div>
      )}
    </Drawer>
  );
}

/* -------------------------------------------------------------- new lead */

function NewLeadModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const toast = useToast();
  const empty = { name: "", phone: "", email: "", location: "", packageSlug: "", investmentBDT: "", message: "", source: "walk-in" };
  const [f, setF] = useState(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((v) => ({ ...v, [k]: e.target.value }));

  async function save() {
    setBusy(true);
    const { ok, json } = await send("/api/admin/leads", "POST", {
      ...f,
      investmentBDT: f.investmentBDT ? Number(f.investmentBDT) : undefined,
      packageSlug: f.packageSlug || undefined,
    });
    setBusy(false);
    if (!ok) {
      setErrors(json.errors ?? {});
      if (json.error) toast(json.error, "error");
      return;
    }
    toast("Lead added");
    setF(empty);
    setErrors({});
    onCreated(String((json.lead as { id: string }).id));
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add a lead"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Add lead"}</Btn>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name} className="sm:col-span-2">{(id) => <TextInput id={id} value={f.name} onChange={set("name")} />}</Field>
        <Field label="Phone" error={errors.phone}>{(id) => <TextInput id={id} value={f.phone} onChange={set("phone")} placeholder="+880 1…" />}</Field>
        <Field label="Email" error={errors.email}>{(id) => <TextInput id={id} type="email" value={f.email} onChange={set("email")} />}</Field>
        <Field label="Preferred package">
          {(id) => (
            <SelectInput id={id} value={f.packageSlug} onChange={set("packageSlug")}>
              <option value="">Not sure yet</option>
              {ownershipTiers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field label="Investment budget (৳)">{(id) => <TextInput id={id} inputMode="numeric" value={f.investmentBDT} onChange={set("investmentBDT")} placeholder="2500000" />}</Field>
        <Field label="Location">{(id) => <TextInput id={id} value={f.location} onChange={set("location")} />}</Field>
        <Field label="Source">
          {(id) => (
            <SelectInput id={id} value={f.source} onChange={set("source")}>
              {["walk-in", "phone", "referral", "facebook", "event", "site-visit", "other"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </SelectInput>
          )}
        </Field>
        <Field label="Notes" className="sm:col-span-2">{(id) => <TextArea id={id} rows={3} value={f.message} onChange={set("message")} />}</Field>
      </div>
    </Modal>
  );
}
