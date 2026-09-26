"use client";

import { useMemo, useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import {
  ExportButton,
  Btn,
  Card,
  Empty,
  ErrorNote,
  Field,
  LoadingRows,
  Modal,
  PageHeader,
  SearchInput,
  Segmented,
  SelectInput,
  Stat,
  StatusBadge,
  firstError,
  send,
  useAdminFetch,
  useToast,
} from "../kit";
import { METHOD_LABEL, RecordPaymentModal } from "../RecordPayment";
import type { AdminHolding, AdminPayment } from "@/lib/admin-types";
import type { TabFocus } from "../AdminShell";
import { formatDate } from "@/lib/account";
import { formatBDT, formatBDTCompact } from "@/lib/shares";

type Filter = "ALL" | "SUCCESS" | "PENDING" | "VOID";

export function PaymentsTab({ focus, onChanged }: { focus: TabFocus; onChanged: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ payments: AdminPayment[] }>("/api/admin/payments");
  const [filter, setFilter] = useState<Filter>((focus.filter as Filter) ?? "ALL");
  const [method, setMethod] = useState("ALL");
  const [q, setQ] = useState("");
  const [picking, setPicking] = useState(false);
  const [recording, setRecording] = useState<AdminHolding | null>(null);

  const payments = useMemo(() => data?.payments ?? [], [data]);
  const shown = payments.filter((p) => {
    if (filter === "SUCCESS" && p.status !== "SUCCESS") return false;
    if (filter === "PENDING" && p.status !== "PENDING") return false;
    if (filter === "VOID" && !(p.status === "FAILED" || p.status === "CANCELLED")) return false;
    if (method !== "ALL" && p.method !== method) return false;
    const n = q.trim().toLowerCase();
    return !n || [p.customer.name, p.receiptNo, p.tranId, p.reference ?? "", p.customer.phone].some((v) => v.toLowerCase().includes(n));
  });

  const paid = payments.filter((p) => p.status === "SUCCESS");
  const thisMonth = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }).slice(0, 7);
  const monthTotal = paid
    .filter((p) => p.paidAt && new Date(p.paidAt).toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" }).startsWith(thisMonth))
    .reduce((s, p) => s + p.amountBDT, 0);
  const refresh = () => {
    reload();
    onChanged();
  };

  return (
    <>
      <PageHeader
        title="Payments & receipts"
        description="Every transaction — online, bank, cash or mobile banking — with its money receipt."
        actions={
          <>
            <ExportButton kind="payments" />
            <Btn variant="primary" icon="wallet" onClick={() => setPicking(true)}>Record payment</Btn>
          </>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total received" value={formatBDTCompact(paid.reduce((s, p) => s + p.amountBDT, 0))} sub={`${paid.length} receipts`} icon="wallet" />
        <Stat label="This month" value={formatBDTCompact(monthTotal)} icon="calendar" tone="sky" />
        <Stat label="Awaiting confirmation" value={payments.filter((p) => p.status === "PENDING").length} sub="Pending online reservations" icon="bell" tone="gold" onClick={() => setFilter("PENDING")} />
        <Stat label="Offline share" value={`${paid.length ? Math.round((paid.filter((p) => p.method !== "SSLCOMMERZ").length / paid.length) * 100) : 0}%`} sub="Recorded by the team" icon="users" tone="violet" />
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "ALL", label: "All", count: payments.length },
            { value: "SUCCESS", label: "Paid", count: paid.length },
            { value: "PENDING", label: "Pending", count: payments.filter((p) => p.status === "PENDING").length },
            { value: "VOID", label: "Failed / void", count: payments.filter((p) => p.status === "FAILED" || p.status === "CANCELLED").length },
          ]}
        />
        <div className="flex gap-2">
          <SelectInput value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Method" className="w-44">
            <option value="ALL">All methods</option>
            {Object.entries(METHOD_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </SelectInput>
          <SearchInput value={q} onChange={setQ} placeholder="Receipt, TrxID, customer…" className="w-60" />
        </div>
      </div>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : (
        <Card className="overflow-x-auto">
          {shown.length === 0 ? <Empty icon="wallet" title="No payments match" /> : <PaymentRows payments={shown} onChanged={refresh} />}
        </Card>
      )}

      <HoldingPicker
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(h) => {
          setPicking(false);
          setRecording(h);
        }}
      />
      <RecordPaymentModal key={recording?.id ?? "none"} holding={recording} onClose={() => setRecording(null)} onRecorded={refresh} />
    </>
  );
}

/** The payment history table — also embedded in the shareholder drawer. */
export function PaymentRows({ payments, compact, onChanged }: { payments: AdminPayment[]; compact?: boolean; onChanged: () => void }) {
  const toast = useToast();
  async function settle(p: AdminPayment, status: "SUCCESS" | "CANCELLED") {
    const { ok, json } = await send(`/api/admin/payments/${p.id}`, "PATCH", { status });
    if (!ok) return toast(firstError(json), "error");
    toast(status === "SUCCESS" ? "Payment confirmed — receipt ready" : "Payment voided");
    onChanged();
  }

  return (
    <table className="w-full min-w-[52rem] text-left text-[0.8125rem]">
      <thead className="border-b border-[#EEF0EC] bg-[#FAFBF9] text-[0.6875rem] uppercase tracking-wide text-[#6B756F]">
        <tr>
          <th className="px-5 py-3 font-medium">Receipt</th>
          {!compact && <th className="py-3 font-medium">Customer</th>}
          <th className="py-3 font-medium">For</th>
          <th className="py-3 font-medium">Method</th>
          <th className="py-3 text-right font-medium">Amount</th>
          <th className="py-3 pl-5 font-medium">Status</th>
          <th className="px-5 py-3 text-right font-medium"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#EEF0EC]">
        {payments.map((p) => (
          <tr key={p.id} className="hover:bg-[#FAFBF9]">
            <td className="px-5 py-3">
              <p className="font-mono text-xs text-[#14201B]">{p.receiptNo}</p>
              <p className="text-[0.6875rem] text-[#8A948E]">{formatDate(p.paidAt ?? p.createdAt)}</p>
            </td>
            {!compact && (
              <td className="py-3">
                <p className="font-medium text-[#14201B]">{p.customer.name}</p>
                <p className="text-[0.6875rem] text-[#8A948E]">{p.customer.phone}</p>
              </td>
            )}
            <td className="py-3">
              <p className="text-[#14201B]">{p.planName} · {p.units} sh</p>
              <p className="text-[0.6875rem] text-[#8A948E]">{p.installmentLabel}</p>
            </td>
            <td className="py-3">
              <p className="text-[#3D4A44]">{METHOD_LABEL[p.method] ?? p.method}</p>
              <p className="max-w-[11rem] truncate font-mono text-[0.625rem] text-[#9AA39E]" title={p.reference ?? p.tranId}>
                {p.reference ?? p.tranId}
              </p>
            </td>
            <td className="py-3 text-right font-semibold tabular-nums text-[#14201B]">{formatBDT(p.amountBDT)}</td>
            <td className="py-3 pl-5">
              <StatusBadge status={p.status} />
              {p.recordedBy && <p className="mt-0.5 text-[0.625rem] text-[#9AA39E]">by {p.recordedBy}</p>}
            </td>
            <td className="px-5 py-3 text-right">
              <div className="flex justify-end gap-1.5">
                {p.status === "PENDING" && (
                  <>
                    <Btn size="sm" variant="primary" onClick={() => settle(p, "SUCCESS")}>Confirm</Btn>
                    <Btn size="sm" variant="ghost" onClick={() => settle(p, "CANCELLED")}>Void</Btn>
                  </>
                )}
                <a
                  href={`/account/invoices/${p.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-[#DDE1DB] bg-white px-2.5 text-xs font-medium text-[#24312B] hover:bg-[#F5F7F3]"
                >
                  <AdminIcon icon="invoice" className="h-3.5 w-3.5" />
                  {p.status === "SUCCESS" ? "Receipt" : "Invoice"}
                </a>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Pick which customer's holding a payment is for. */
function HoldingPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (h: AdminHolding) => void }) {
  const { data } = useAdminFetch<{ holdings: AdminHolding[] }>(open ? "/api/admin/holdings" : null);
  const [q, setQ] = useState("");
  const [id, setId] = useState("");
  const payable = (data?.holdings ?? []).filter((h) => h.status !== "CANCELLED" && !h.fullyPaid);
  const n = q.trim().toLowerCase();
  const matches = payable.filter((h) => !n || [h.customer.name, h.customer.phone, h.plan.name].some((v) => v.toLowerCase().includes(n)));
  const picked = payable.find((h) => h.id === id);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a payment — choose the holding"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" disabled={!picked} onClick={() => picked && onPick(picked)}>Continue</Btn>
        </>
      }
    >
      <SearchInput value={q} onChange={setQ} placeholder="Customer name or phone" />
      <Field label="Holdings with a balance" className="mt-4">
        {(fid) => (
          <SelectInput id={fid} value={id} onChange={(e) => setId(e.target.value)} size={Math.min(8, Math.max(3, matches.length))} className="h-auto py-1">
            {matches.map((h) => (
              <option key={h.id} value={h.id} className="py-1.5">
                {h.customer.name} — {h.plan.name} {h.units} sh · {formatBDT(h.remainingBDT)} left
              </option>
            ))}
          </SelectInput>
        )}
      </Field>
      {!data && <p className="mt-3 text-xs text-[#8A948E]">Loading holdings…</p>}
      {data && payable.length === 0 && <p className="mt-3 text-xs text-[#8A948E]">No holding has a balance to pay.</p>}
    </Modal>
  );
}
