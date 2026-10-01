"use client";

import { useState } from "react";
import { Badge, Btn, Card, StatusBadge, firstError, send, useToast } from "./kit";
import type { AdminHolding } from "@/lib/admin-types";
import { daysUntil, formatDate, paymentPlanLabel } from "@/lib/account";
import { formatBDT } from "@/lib/shares";
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
  const pct = h.totalAmountBDT ? Math.round((h.paidBDT / h.totalAmountBDT) * 100) : 0;

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

      <div className="grid grid-cols-3 border-y border-[#EEF0EC] bg-[#FAFBF9] text-center">
        {[
          ["Total", formatBDT(h.totalAmountBDT)],
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
          <span>{h.steps.filter((s) => s.status === "SUCCESS").length} of {h.steps.length} installments</span>
        </div>
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
                    {s.paidAt ? `Paid ${formatDate(s.paidAt)}` : overdue ? `Overdue · ${-d}d late` : "Upcoming"}
                  </p>
                </td>
                <td className="py-2.5 text-right tabular-nums text-[#14201B]">{formatBDT(s.amountBDT)}</td>
                <td className="py-2.5 pl-4">
                  <StatusBadge status={overdue ? "OVERDUE" : s.status} />
                </td>
                <td className="py-2.5 pr-5 text-right">
                  {s.status !== "SUCCESS" && h.status !== "CANCELLED" && (
                    <Btn size="sm" variant="ghost" onClick={() => onRecord(h, s.n)}>Record</Btn>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

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
          <Btn size="sm" variant="ghost" onClick={() => setConfirmCancel(true)}>Cancel holding</Btn>
        )}
        {!h.fullyPaid && h.status !== "CANCELLED" && (
          <Btn size="sm" variant="primary" icon="wallet" onClick={() => onRecord(h)}>
            Record payment
          </Btn>
        )}
      </div>
    </Card>
  );
}
