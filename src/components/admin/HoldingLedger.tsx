"use client";

import { useState } from "react";
import { Badge, Btn, Card, StatusBadge, firstError, send, useToast } from "./kit";
import type { AdminHolding } from "@/lib/admin-types";
import { daysUntil, formatDate, paymentPlanLabel } from "@/lib/account";
import { DiscountField, type DiscountValue } from "./DiscountField";
import { ScheduleEditor } from "./ScheduleEditor";
import { METHOD_LABEL } from "./RecordPayment";
import { formatBDT, maxDiscountBDT } from "@/lib/shares";
import { cn } from "@/lib/utils";

/** A holding's full installment ledger with the actions the team takes on it. */
export function HoldingLedger({
  holding: h,
  now,
  onRecord,
  onChanged,
}: {
  holding: AdminHolding;
  now: string;
  onRecord: (holding: AdminHolding, step?: number) => void;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [editDiscount, setEditDiscount] = useState(false);
  const [editSchedule, setEditSchedule] = useState(false);
  const [discount, setDiscount] = useState<DiscountValue>({ amountBDT: h.discountBDT, note: h.discountNote ?? "" });
  const [discountError, setDiscountError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const pct = h.totalAmountBDT ? Math.round((h.paidBDT / h.totalAmountBDT) * 100) : 0;
  // The price can change only while nothing has been paid (or started) on it.
  const priceOpen = h.status !== "CANCELLED" && h.steps.every((s) => s.status !== "SUCCESS" && s.status !== "PENDING");
  const maxDiscount = maxDiscountBDT({ totalBDT: h.listPriceBDT, downPaymentBDT: h.downPaymentBDT, installments: h.steps });

  async function saveDiscount() {
    setSaving(true);
    const { ok, json } = await send(`/api/admin/holdings/${h.id}`, "PATCH", {
      discountBDT: discount.amountBDT,
      discountNote: discount.note.trim() || undefined,
    });
    setSaving(false);
    if (!ok) return setDiscountError(json.errors?.discountBDT ?? firstError(json));
    toast(discount.amountBDT ? `Discount of ${formatBDT(discount.amountBDT)} saved` : "Discount removed");
    setEditDiscount(false);
    onChanged();
  }

  async function setStatus(status: "CANCELLED" | "ACTIVE" | "PENDING_PAYMENT") {
    const { ok, json } = await send(`/api/admin/holdings/${h.id}`, "PATCH", { status });
    setConfirmCancel(false);
    if (!ok) return toast(firstError(json), "error");
    toast(status === "CANCELLED" ? "Holding cancelled" : "Holding reinstated");
    onChanged();
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ boxShadow: `inset 3px 0 0 ${h.plan.accentColor}` }}>
        <div>
          <p className="text-sm font-semibold text-[#14201B]">
            {h.plan.name} · {h.units} share{h.units > 1 ? "s" : ""}{h.shareNo && <span className="font-mono text-[#6B756F]"> · {h.shareNo}</span>}
          </p>
          <p className="text-xs text-[#6B756F]">
            Opened {formatDate(h.openedAt)} · {paymentPlanLabel(h)}

          </p>
        </div>
        <div className="flex items-center gap-2">
          {h.overdueCount > 0 && <Badge tone="red">{h.overdueCount} overdue</Badge>}
          <StatusBadge status={h.status} />
        </div>
      </div>

      {h.discountBDT > 0 && (
        <p className="border-t border-[#EEF0EC] bg-emerald-50/60 px-5 py-2 text-xs text-emerald-900">
          Discount <span className="font-semibold tabular-nums">{formatBDT(h.discountBDT)}</span> off{" "}
          <span className="tabular-nums line-through decoration-emerald-900/40">{formatBDT(h.listPriceBDT)}</span>
          {h.discountNote && <span className="text-emerald-800/75"> · {h.discountNote}</span>}
        </p>
      )}
      <div className="grid grid-cols-3 border-y border-[#EEF0EC] bg-[#FAFBF9] text-center">
        {[
          [h.discountBDT ? "Total after discount" : "Total", formatBDT(h.totalAmountBDT)],
          ["Paid", formatBDT(h.paidBDT)],
          ["Remaining", formatBDT(h.remainingBDT)],
        ].map(([k, v]) => (
          <div key={k} className="px-3 py-3">
            <p className="text-[0.6875rem] text-[#8A948E]">{k}</p>
            <p className="text-sm font-semibold tabular-nums text-[#14201B]">{v}</p>
          </div>
        ))}
      </div>
      <div className="px-5 pt-4">
        <div className="flex items-center justify-between text-[0.6875rem] text-[#6B756F]">
          <span>{pct}% paid</span>
          <span>
            {h.steps.length
              ? `${h.steps.filter((s) => s.status === "SUCCESS").length} of ${h.steps.length} installments`
              : "No fixed installments — any amount, any time"}
          </span>
        </div>
        {!h.steps.length && (
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#E4E8E2]">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
        )}
        <div className="mt-1.5 flex gap-1">
          {h.steps.map((s) => {
            const overdue = s.status !== "SUCCESS" && s.status !== "PENDING" && daysUntil(s.dueDate, now) < 0;
            return (
              <span
                key={s.n}
                className={cn(
                  "h-1.5 flex-1 rounded-full",
                  s.status === "SUCCESS" ? "bg-emerald-500" : s.status === "PENDING" ? "bg-amber-400" : overdue ? "bg-red-400" : "bg-[#E4E8E2]",
                )}
              />
            );
          })}
        </div>
      </div>

      <table className="mt-3 w-full text-left text-[0.8125rem]">
        <tbody className="divide-y divide-[#F0F2EF]">
          {h.steps.map((s) => {
            const d = daysUntil(s.dueDate, now);
            const overdue = s.status !== "SUCCESS" && s.status !== "PENDING" && d < 0;
            return (
              <tr key={s.n} className={cn(overdue && "bg-red-50/40")}>
                <td className="w-10 py-2.5 pl-5 text-xs tabular-nums text-[#9AA39E]">{String(s.n).padStart(2, "0")}</td>
                <td className="py-2.5">
                  <p className="text-[#14201B]">{s.label}</p>
                  <p className="text-[0.6875rem] text-[#8A948E]">
                    {s.paidAt
                      ? `Paid ${formatDate(s.paidAt)}`
                      : `Due ${formatDate(s.dueDate)}${overdue ? ` · ${-d}d late` : ""}${s.paidBDT ? ` · ${formatBDT(s.paidBDT)} paid, ${formatBDT(s.dueBDT)} left` : ""}`}
                  </p>
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#14201B]">{formatBDT(s.amountBDT)}</td>
                <td className="py-2.5 pl-4">
                  <StatusBadge status={overdue ? (s.status === "PARTIAL" ? "PARTIAL_OVERDUE" : "OVERDUE") : s.status} />
                </td>
                <td className="py-2.5 pr-5 text-right">
                  {s.status !== "SUCCESS" && h.status !== "CANCELLED" && (
                    <Btn size="sm" variant="ghost" onClick={() => onRecord(h, s.n)}>Record</Btn>
                  )}
                </td>
              </tr>
            );
          })}
          {h.openBalanceBDT > 0 && h.status !== "CANCELLED" && (
            <tr>
              <td className="w-10 py-2.5 pl-5 text-xs text-[#9AA39E]">—</td>
              <td className="py-2.5">
                <p className="text-[#14201B]">Open balance</p>
                <p className="text-[0.6875rem] text-[#8A948E]">Not on an installment — paid in any amount, any time</p>
              </td>
              <td className="py-2.5 text-right tabular-nums text-[#14201B]">{formatBDT(h.openBalanceBDT)}</td>
              <td className="py-2.5 pl-4">
                <Badge tone="gray">Flexible</Badge>
              </td>
              <td className="py-2.5 pr-5" />
            </tr>
          )}
        </tbody>
      </table>

      {h.history.length > 0 && (
        <details className="group border-t border-[#EEF0EC] px-5 py-3" open={!h.steps.length}>
          <summary className="cursor-pointer text-xs font-semibold text-[#3D4A44]">
            Payments received ({h.history.length})
          </summary>
          <ul className="mt-2 divide-y divide-[#F0F2EF] text-[0.8125rem]">
            {h.history.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block truncate text-[#14201B]">{p.label}</span>
                  <span className="block text-[0.6875rem] text-[#8A948E]">
                    {formatDate(p.paidAt)} · {METHOD_LABEL[p.method] ?? p.method}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="font-semibold tabular-nums text-[#14201B]">{formatBDT(p.amountBDT)}</span>
                  <a href={`/account/invoices/${p.id}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-forest-700 hover:underline">
                    Receipt
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {editDiscount && (
        <div className="border-t border-[#EEF0EC] bg-[#FAFBF9] px-5 py-4">
          <DiscountField
            listPriceBDT={h.listPriceBDT}
            maxBDT={maxDiscount}
            value={discount}
            onChange={(v) => { setDiscount(v); setDiscountError(undefined); }}
            error={discountError}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Btn size="sm" onClick={() => { setEditDiscount(false); setDiscount({ amountBDT: h.discountBDT, note: h.discountNote ?? "" }); setDiscountError(undefined); }}>
              Cancel
            </Btn>
            <Btn size="sm" variant="primary" icon="check" onClick={saveDiscount} disabled={saving || discount.amountBDT > maxDiscount}>
              {saving ? "Saving…" : "Save discount"}
            </Btn>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#EEF0EC] px-5 py-3">
        {h.status === "CANCELLED" ? (
          <Btn size="sm" onClick={() => setStatus(h.paidBDT > 0 ? "ACTIVE" : "PENDING_PAYMENT")}>Reinstate</Btn>
        ) : confirmCancel ? (
          <span className="flex items-center gap-2 text-xs text-red-600">
            Cancel this holding?
            <Btn size="sm" variant="danger" onClick={() => setStatus("CANCELLED")}>Yes, cancel</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setConfirmCancel(false)}>No</Btn>
          </span>
        ) : (
          <span className="flex flex-wrap gap-1">
            <Btn size="sm" variant="ghost" onClick={() => setConfirmCancel(true)}>Cancel holding</Btn>
            {!h.fullyPaid && (
              <Btn size="sm" variant="ghost" icon="calendar" onClick={() => setEditSchedule(true)}>
                Installments
              </Btn>
            )}
            {priceOpen && !editDiscount && (
              <Btn size="sm" variant="ghost" icon="percent" onClick={() => setEditDiscount(true)}>
                {h.discountBDT ? "Change discount" : "Give a discount"}
              </Btn>
            )}
          </span>
        )}
        {!h.fullyPaid && h.status !== "CANCELLED" && (
          <Btn size="sm" variant="primary" icon="wallet" onClick={() => onRecord(h)}>
            Record payment
          </Btn>
        )}
      </div>
      {editSchedule && (
        <ScheduleEditor
          holding={h}
          onClose={() => setEditSchedule(false)}
          onSaved={() => {
            setEditSchedule(false);
            onChanged();
          }}
        />
      )}
    </Card>
  );
}
