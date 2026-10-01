"use client";

import { useMemo, useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import {
  ExportButton,
  Avatar,
  Btn,
  Badge,
  Card,
  DefinitionGrid,
  Drawer,
  Empty,
  ErrorNote,
  LoadingRows,
  PageHeader,
  SearchInput,
  Segmented,
  StatusBadge,
  Stat,
  relTime,
  useAdminFetch,
} from "../kit";
import { HoldingLedger } from "../HoldingLedger";
import { PhotoUploader } from "@/components/sections/account/PhotoUploader";
import { AddShareholderModal, AllocateSharesModal, EditCustomerModal, MessageModal, PasswordHelpModal } from "../CustomerActions";
import { RecordPaymentModal } from "../RecordPayment";
import { PaymentRows } from "./PaymentsTab";
import type { AdminCustomer, AdminCustomerDetail, AdminHolding } from "@/lib/admin-types";
import type { TabFocus } from "../AdminShell";
import { formatDate } from "@/lib/account";
import { formatBDT, formatBDTCompact, ownershipPercent } from "@/lib/shares";

type Filter = "all" | "overdue" | "owing" | "paid";

export function CustomersTab({ focus, onChanged }: { focus: TabFocus; onChanged: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ customers: AdminCustomer[] }>("/api/admin/customers");
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(focus.id ?? null);
  const [adding, setAdding] = useState(!!focus.create);
  const [messagingAll, setMessagingAll] = useState(false);

  const customers = useMemo(() => data?.customers ?? [], [data]);
  const shown = customers.filter((c) => {
    if (filter === "overdue" && c.overdueCount === 0) return false;
    if (filter === "owing" && c.remainingBDT === 0) return false;
    if (filter === "paid" && (c.remainingBDT > 0 || c.holdingCount === 0)) return false;
    const n = q.trim().toLowerCase();
    return !n || [c.name, c.email, c.phone, c.memberId].some((v) => v.toLowerCase().includes(n));
  });

  return (
    <>
      <PageHeader
        title="Shareholders"
        description="Every customer account, their holdings, balances and payment history."
        actions={
          <>
            <ExportButton kind="customers" />
            <Btn icon="mail" onClick={() => setMessagingAll(true)}>Message all</Btn>
            <Btn variant="primary" icon="user" onClick={() => setAdding(true)}>Add shareholder</Btn>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: customers.length },
            { value: "overdue", label: "Overdue", count: customers.filter((c) => c.overdueCount > 0).length },
            { value: "owing", label: "Balance due", count: customers.filter((c) => c.remainingBDT > 0).length },
            { value: "paid", label: "Fully paid", count: customers.filter((c) => c.remainingBDT === 0 && c.holdingCount > 0).length },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Name, phone, member ID…" className="w-64" />
      </div>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : shown.length === 0 ? (
        <Card><Empty icon="users" title="No shareholders here">Registered accounts appear once someone signs up.</Empty></Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[60rem] text-left text-[0.8125rem]">
            <thead className="border-b border-[#EEF0EC] bg-[#FAFBF9] text-[0.6875rem] uppercase tracking-wide text-[#6B756F]">
              <tr>
                <th className="px-5 py-3 font-medium">Shareholder</th>
                <th className="py-3 text-right font-medium">Shares</th>
                <th className="py-3 text-right font-medium">Committed</th>
                <th className="py-3 text-right font-medium">Paid</th>
                <th className="py-3 text-right font-medium">Remaining</th>
                <th className="py-3 pl-6 font-medium">Next due</th>
                <th className="px-5 py-3 text-right font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0EC]">
              {shown.map((c) => {
                const pct = c.committedBDT ? (c.paidBDT / c.committedBDT) * 100 : 0;
                return (
                  <tr key={c.id} onClick={() => setOpenId(c.id)} className="cursor-pointer hover:bg-[#FAFBF9]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} src={c.photoUrl} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-[#14201B]">{c.name}</p>
                          <p className="truncate text-xs text-[#6B756F]">
                            <span className="font-mono">{c.memberId}</span> · {c.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right tabular-nums">{c.units}</td>
                    <td className="py-3 text-right tabular-nums">{c.committedBDT ? formatBDTCompact(c.committedBDT) : "—"}</td>
                    <td className="py-3 text-right">
                      <span className="tabular-nums">{c.paidBDT ? formatBDTCompact(c.paidBDT) : "—"}</span>
                      {c.committedBDT > 0 && (
                        <span className="ml-auto mt-1 block h-1 w-20 overflow-hidden rounded-full bg-[#EEF1EC] [margin-left:auto]">
                          <span className="block h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right tabular-nums">{c.remainingBDT ? formatBDTCompact(c.remainingBDT) : "—"}</td>
                    <td className="py-3 pl-6 text-xs">
                      {c.overdueCount > 0 ? (
                        <Badge tone="red">{c.overdueCount} overdue</Badge>
                      ) : c.nextDue ? (
                        <span className="text-[#3D4A44]">{formatBDTCompact(c.nextDue.amountBDT)} · {formatDate(c.nextDue.dueDate)}</span>
                      ) : (
                        <span className="text-[#9AA39E]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-[#6B756F]">{relTime(c.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <CustomerDrawer
        id={openId}
        onClose={() => setOpenId(null)}
        onChanged={() => {
          reload();
          onChanged();
        }}
      />
      <AddShareholderModal
        open={adding}
        onClose={() => setAdding(false)}
        onCreated={(id) => {
          setAdding(false);
          reload();
          onChanged();
          setOpenId(id);
        }}
      />
      <MessageModal to={messagingAll ? "all" : null} onClose={() => setMessagingAll(false)} />
    </>
  );
}

export function CustomerDrawer({ id, onClose, onChanged }: { id: string | null; onClose: () => void; onChanged: () => void }) {
  const { data, reload } = useAdminFetch<{ customer: AdminCustomerDetail }>(id ? `/api/admin/customers/${id}` : null);
  const c = id && data?.customer.id === id ? data.customer : null;
  const [section, setSection] = useState<"holdings" | "payments" | "applications">("holdings");
  const [recording, setRecording] = useState<{ holding: AdminHolding; step?: number } | null>(null);
  const [action, setAction] = useState<"edit" | "message" | "password" | "allocate" | null>(null);
  const [now] = useState(() => new Date().toISOString());

  const refresh = () => {
    reload();
    onChanged();
  };

  return (
    <>
      <Drawer
        open={!!id}
        onClose={onClose}
        width="max-w-3xl"
        title={
          c ? (
            <span className="flex items-center gap-3">
              <Avatar name={c.name} src={c.photoUrl} className="h-11 w-11 text-sm" />
              <span className="min-w-0">
                <span className="block truncate">{c.name}</span>
                <span className="block font-mono text-xs font-normal text-[#6B756F]">{c.memberId}</span>
              </span>
            </span>
          ) : (
            "Loading…"
          )
        }
      >
        {!c && <LoadingRows rows={6} />}
        {c && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2 text-xs">
              <a href={`tel:${c.phone}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8E3] bg-white px-3 py-1.5 text-[#24312B] hover:border-forest-300">
                <AdminIcon icon="bell" className="h-3.5 w-3.5" /> {c.phone}
              </a>
              <a href={`mailto:${c.email}`} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6E8E3] bg-white px-3 py-1.5 text-[#24312B] hover:border-forest-300">
                <AdminIcon icon="mail" className="h-3.5 w-3.5" /> {c.email}
              </a>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#F0F2EF] px-3 py-1.5 text-[#3D4A44]">
                {c.location} · joined {formatDate(c.createdAt)}
              </span>
            </div>

            <PhotoUploader key={c.id} name={c.name} photoUrl={c.photoUrl} endpoint={`/api/admin/customers/${c.id}/photo`} tone="light" size="md" onChanged={refresh} />

            <Card className="p-5">
              <DefinitionGrid
                cols={3}
                items={[
                  { k: "Shareholder ID", v: <span className="font-mono">{c.memberId}</span> },
                  { k: "Share number", v: c.shareNumbers.length ? <span className="font-mono">{c.shareNumbers.join(", ")}</span> : null },
                  { k: "NID number", v: c.nid && <span className="font-mono">{c.nid}</span> },
                  { k: "Nominee", v: c.nomineeName && `${c.nomineeName}${c.nomineeRelation ? ` (${c.nomineeRelation})` : ""}` },
                  { k: "Referred by", v: c.referredBy },
                  { k: "Photo", v: c.photoUrl ? "On file" : <span className="text-amber-700">Missing — upload above</span> },
                ]}
              />
            </Card>

            <div className="flex flex-wrap gap-2">
              <Btn size="sm" variant="primary" icon="layers" onClick={() => setAction("allocate")}>Allocate shares</Btn>
              <Btn size="sm" icon="mail" onClick={() => setAction("message")}>Send message</Btn>
              <Btn size="sm" icon="user" onClick={() => setAction("edit")}>Edit details</Btn>
              <Btn size="sm" icon="bell" onClick={() => setAction("password")}>Password help</Btn>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat label="Shares" value={c.units} sub={`${ownershipPercent(c.units).toFixed(2)}% of resort`} icon="layers" />
              <Stat label="Paid" value={formatBDTCompact(c.paidBDT)} sub={`of ${formatBDTCompact(c.committedBDT)}`} icon="wallet" />
              <Stat label="Remaining" value={formatBDTCompact(c.remainingBDT)} icon="bell" tone={c.overdueCount ? "red" : "gold"} sub={c.overdueCount ? `${c.overdueCount} overdue` : "On schedule"} />
              <Stat label="Next due" value={c.nextDue ? formatBDTCompact(c.nextDue.amountBDT) : "—"} sub={c.nextDue ? formatDate(c.nextDue.dueDate) : "Nothing due"} icon="calendar" tone="sky" />
            </div>

            <Segmented
              value={section}
              onChange={setSection}
              options={[
                { value: "holdings", label: "Holdings & schedule", count: c.holdings.length },
                { value: "payments", label: "Payment history", count: c.payments.length },
                { value: "applications", label: "Applications", count: c.applications.length },
              ]}
            />

            {section === "holdings" &&
              (c.holdings.length === 0 ? (
                <Card><Empty icon="layers" title="No holdings yet" /></Card>
              ) : (
                <div className="space-y-4">
                  {c.holdings.map((h) => (
                    <HoldingLedger
                      key={h.id}
                      holding={{ ...h, customer: { id: c.id, name: c.name, email: c.email, phone: c.phone } }}
                      now={now}
                      onRecord={(holding, step) => setRecording({ holding, step })}
                      onChanged={refresh}
                    />
                  ))}
                </div>
              ))}

            {section === "payments" && (
              <Card className="overflow-x-auto">
                {c.payments.length === 0 ? <Empty icon="wallet" title="No payments yet" /> : <PaymentRows payments={c.payments} compact onChanged={refresh} />}
              </Card>
            )}

            {section === "applications" && (
              <Card>
                {c.applications.length === 0 ? (
                  <Empty icon="invoice" title="No applications" />
                ) : (
                  <ul className="divide-y divide-[#EEF0EC]">
                    {c.applications.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-3 text-[0.8125rem]">
                        <span>
                          <span className="font-medium capitalize text-[#14201B]">{a.planSlug} · {a.units} shares</span>
                          <span className="block text-xs text-[#6B756F]">{formatBDT(a.quotedTotalBDT)} · {formatDate(a.createdAt)}</span>
                        </span>
                        <StatusBadge status={a.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            )}
          </div>
        )}
      </Drawer>
      <EditCustomerModal key={`edit-${c?.id ?? ""}`} person={action === "edit" ? c : null} onClose={() => setAction(null)} onSaved={refresh} />
      <MessageModal to={action === "message" ? c : null} onClose={() => setAction(null)} />
      <PasswordHelpModal person={action === "password" ? c : null} onClose={() => setAction(null)} />
      <AllocateSharesModal person={action === "allocate" ? c : null} onClose={() => setAction(null)} onDone={refresh} />
      <RecordPaymentModal
        key={recording ? `${recording.holding.id}-${recording.step ?? "next"}` : "none"}
        holding={recording?.holding ?? null}
        initialStep={recording?.step}
        onClose={() => setRecording(null)}
        onRecorded={refresh}
      />
    </>
  );
}
