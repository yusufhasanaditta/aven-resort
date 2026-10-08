"use client";

import { useMemo, useState } from "react";
import {
  ExportButton,
  Avatar,
  Badge,
  Btn,
  Card,
  Empty,
  ErrorNote,
  LoadingRows,
  PageHeader,
  SearchInput,
  Segmented,
  Stat,
  firstError,
  relTime,
  send,
  useAdminFetch,
  useToast,
} from "../kit";
import { HoldingLedger } from "../HoldingLedger";
import { RecordPaymentModal } from "../RecordPayment";
import type { AdminHolding } from "@/lib/admin-types";
import type { AdminNav, TabFocus } from "../AdminShell";
import { daysUntil, formatDate } from "@/lib/account";
import { formatBDT, formatBDTCompact } from "@/lib/shares";

type View = "overdue" | "upcoming" | "holdings";

export function InstallmentsTab({ focus, nav, onChanged }: { focus: TabFocus; nav: AdminNav; onChanged: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ holdings: AdminHolding[] }>("/api/admin/holdings");
  const [view, setView] = useState<View>(focus.filter === "overdue" ? "overdue" : "upcoming");
  const [q, setQ] = useState("");
  const [recording, setRecording] = useState<{ holding: AdminHolding; step?: number } | null>(null);
  const [now] = useState(() => new Date().toISOString());
  const toast = useToast();
  const [running, setRunning] = useState(false);
  const log = useAdminFetch<ReminderLog>("/api/admin/reminders");

  async function runReminders() {
    setRunning(true);
    const { ok, json } = await send("/api/admin/reminders", "POST", {});
    setRunning(false);
    if (!ok) return toast(firstError(json), "error");
    const sent = Number(json.sent) || 0;
    const emailed = Number(json.emailed) || 0;
    toast(sent ? `${sent} reminder${sent > 1 ? "s" : ""} sent${emailed ? ` · ${emailed} emailed` : ""}` : "Everyone is already reminded for today");
    log.reload();
  }

  async function remind(h: AdminHolding) {
    const { ok, json } = await send("/api/admin/reminders", "POST", { holdingId: h.id });
    if (!ok) return toast(firstError(json), "error");
    toast(json.emailStatus === "SENT" ? `Reminder emailed to ${h.customer.name}` : `Reminder sent to ${h.customer.name}'s dashboard`);
    log.reload();
  }

  const holdings = useMemo(() => data?.holdings ?? [], [data]);
  const live = holdings.filter((h) => h.status !== "CANCELLED");

  const dues = useMemo(
    () =>
      live
        .flatMap((h) =>
          h.steps
            .filter((s) => s.status !== "SUCCESS" && s.status !== "PENDING")
            .map((s) => ({ h, s, days: daysUntil(s.dueDate, now) })),
        )
        .sort((a, b) => a.s.dueDate.localeCompare(b.s.dueDate)),
    [live, now],
  );
  const overdue = dues.filter((d) => d.days < 0);
  const upcoming = dues.filter((d) => d.days >= 0 && d.days <= 30);
  const n = q.trim().toLowerCase();
  const match = (h: AdminHolding) => !n || [h.customer.name, h.customer.phone, h.plan.name].some((v) => v.toLowerCase().includes(n));

  const rows = (view === "overdue" ? overdue : upcoming).filter((d) => match(d.h));
  const refresh = () => {
    reload();
    onChanged();
  };

  return (
    <>
      <PageHeader
        title="Installments & dues"
        description="The schedule behind every holding — what's overdue, what's coming, and what each customer still owes."
        actions={
          <>
            <ExportButton kind="dues" label="Export dues" />
            <Btn variant="primary" icon="bell" onClick={runReminders} disabled={running}>
              {running ? "Sending…" : "Send reminders now"}
            </Btn>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Overdue" value={formatBDTCompact(overdue.reduce((s, d) => s + d.s.dueBDT, 0))} sub={`${overdue.length} installments`} icon="bell" tone="red" onClick={() => setView("overdue")} />
        <Stat label="Due in 7 days" value={formatBDTCompact(upcoming.filter((d) => d.days <= 7).reduce((s, d) => s + d.s.dueBDT, 0))} sub={`${upcoming.filter((d) => d.days <= 7).length} installments`} icon="calendar" tone="gold" onClick={() => setView("upcoming")} />
        <Stat label="Due in 30 days" value={formatBDTCompact(upcoming.reduce((s, d) => s + d.s.dueBDT, 0))} sub={`${upcoming.length} installments`} icon="calendar" tone="sky" onClick={() => setView("upcoming")} />
        <Stat label="Remaining balance" value={formatBDTCompact(live.reduce((s, h) => s + h.remainingBDT, 0))} sub={`${live.filter((h) => h.fullyPaid).length} of ${live.length} holdings fully paid`} icon="wallet" onClick={() => setView("holdings")} />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<View>
          value={view}
          onChange={setView}
          options={[
            { value: "overdue", label: "Overdue", count: overdue.length },
            { value: "upcoming", label: "Next 30 days", count: upcoming.length },
            { value: "holdings", label: "All holdings", count: holdings.length },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Customer or package…" className="w-60" />
      </div>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : view === "holdings" ? (
        holdings.filter(match).length === 0 ? (
          <Card><Empty icon="layers" title="No holdings" /></Card>
        ) : (
          <div className="grid gap-4 2xl:grid-cols-2">
            {holdings.filter(match).map((h) => (
              <div key={h.id}>
                <button type="button" onClick={() => nav("customers", { id: h.customer.id })} className="mb-1.5 flex items-center gap-2 text-xs font-medium text-[#3D4A44] hover:text-forest-700">
                  <Avatar name={h.customer.name} className="h-6 w-6 text-[0.5625rem]" /> {h.customer.name}
                </button>
                <HoldingLedger holding={h} now={now} onRecord={(holding, step) => setRecording({ holding, step })} onChanged={refresh} />
              </div>
            ))}
          </div>
        )
      ) : rows.length === 0 ? (
        <Card>
          <Empty icon="calendar" title={view === "overdue" ? "Nothing overdue" : "Nothing due in the next 30 days"}>
            {view === "overdue" ? "Every installment is on schedule." : "Upcoming installments will appear here."}
          </Empty>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-[0.8125rem]">
            <thead className="border-b border-[#EEF0EC] bg-[#FAFBF9] text-[0.6875rem] uppercase tracking-wide text-[#6B756F]">
              <tr>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="py-3 font-medium">Installment</th>
                <th className="py-3 font-medium">Due</th>
                <th className="py-3 text-right font-medium">Amount</th>
                <th className="py-3 text-right font-medium">Holding balance</th>
                <th className="px-5 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEF0EC]">
              {rows.map(({ h, s, days }) => (
                <tr key={`${h.id}-${s.n}`} className={days < 0 ? "bg-red-50/30" : undefined}>
                  <td className="px-5 py-3">
                    <button type="button" onClick={() => nav("customers", { id: h.customer.id })} className="flex items-center gap-3 text-left">
                      <Avatar name={h.customer.name} className="h-8 w-8" />
                      <span>
                        <span className="block font-medium text-[#14201B] hover:underline">{h.customer.name}</span>
                        <span className="block text-xs text-[#6B756F]">{h.customer.phone}</span>
                      </span>
                    </button>
                  </td>
                  <td className="py-3">
                    <p className="text-[#14201B]">{s.part} <span className="text-[#8A948E]">· {s.n} of {h.steps.length}</span></p>
                    <p className="text-xs text-[#8A948E]">{h.plan.name} · {h.units} shares · {h.leftCount} left</p>
                  </td>
                  <td className="py-3">
                    <p className="text-[#14201B]">{formatDate(s.dueDate)}</p>
                    {days < 0 ? <Badge tone="red">{-days} days late</Badge> : <p className="text-xs text-[#8A948E]">{days === 0 ? "Today" : `In ${days} days`}</p>}
                  </td>
                  <td className="py-3 text-right tabular-nums">
                    <p className="font-semibold text-[#14201B]">{formatBDT(s.dueBDT)}</p>
                    {s.paidBDT > 0 && <p className="text-[0.6875rem] text-[#6B756F]">{formatBDT(s.paidBDT)} of {formatBDT(s.amountBDT)} paid</p>}
                  </td>
                  <td className="py-3 text-right tabular-nums text-[#6B756F]">{formatBDT(h.remainingBDT)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <a href={`tel:${h.customer.phone}`} className="inline-flex h-8 items-center rounded-lg border border-[#DDE1DB] bg-white px-2.5 text-xs font-medium text-[#24312B] hover:bg-[#F5F7F3]">Call</a>
                      <Btn size="sm" onClick={() => remind(h)}>Remind</Btn>
                      <Btn size="sm" variant="primary" onClick={() => setRecording({ holding: h, step: s.n })}>Record</Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <ReminderLogCard log={log.data} />

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

type ReminderLog = {
  emailConfigured: boolean;
  notifications: { id: string; kind: string; title: string; customer: string; phone: string; emailStatus: string; read: boolean; createdAt: string }[];
};

const kindLabel: Record<string, { label: string; tone: "red" | "amber" | "blue" | "green" | "violet" }> = {
  OVERDUE: { label: "Overdue", tone: "red" },
  DUE_TODAY: { label: "Due today", tone: "amber" },
  DUE_SOON: { label: "Due soon", tone: "blue" },
  REMINDER: { label: "Manual", tone: "violet" },
  PAYMENT_RECEIVED: { label: "Receipt", tone: "green" },
};

/** What the automatic reminders (daily at 9 AM) and manual nudges have sent, newest first. */
function ReminderLogCard({ log }: { log: ReminderLog | null | undefined }) {
  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF0EC] px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-[#14201B]">Reminders &amp; receipts sent</p>
          <p className="text-xs text-[#6B756F]">
            Sent automatically every morning — 7 days and 3 days before a due date, on the day, then weekly while overdue — plus a receipt for every payment.
          </p>
        </div>
        {log && (
          <Badge tone={log.emailConfigured ? "green" : "amber"}>
            {log.emailConfigured ? "Email on" : "Email off — dashboard only"}
          </Badge>
        )}
      </div>
      {!log ? (
        <LoadingRows rows={3} />
      ) : log.notifications.length === 0 ? (
        <Empty icon="bell" title="Nothing sent yet">Reminders appear here as installments come due.</Empty>
      ) : (
        <ul className="divide-y divide-[#EEF0EC]">
          {log.notifications.map((n) => (
            <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-[0.8125rem]">
              <span className="min-w-0">
                <span className="block truncate font-medium text-[#14201B]">{n.title}</span>
                <span className="block text-xs text-[#8A948E]">{n.customer} · {n.phone} · {relTime(n.createdAt)}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Badge tone={kindLabel[n.kind]?.tone ?? "blue"}>{kindLabel[n.kind]?.label ?? n.kind}</Badge>
                <Badge tone={n.emailStatus === "SENT" ? "green" : n.emailStatus === "FAILED" ? "red" : "gray"}>
                  {n.emailStatus === "SENT" ? "Emailed" : n.emailStatus === "FAILED" ? "Email failed" : "In-app"}
                </Badge>
                {n.read && <Badge tone="teal">Seen</Badge>}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
