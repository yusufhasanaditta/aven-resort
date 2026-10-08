"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { Btn, Field, Modal, SelectInput, TextInput, firstError, send, useToast } from "./kit";
import type { AdminHolding } from "@/lib/admin-types";
import { formatDate, scheduleProblems } from "@/lib/account";
import { addMonths, formatBDT, scheduleLabel, splitIntoPayments, toDhakaDay, type ScheduleRow } from "@/lib/shares";
import { cn } from "@/lib/utils";

type Row = ScheduleRow & { key: number };

let nextKey = 1;
const withKey = (r: ScheduleRow): Row => ({ ...r, key: nextKey++ });

/**
 * The team's own payment plan for one holding: how many payments, when each
 * is due and how much. Paid payments stay put; everything still owed can be
 * moved, split, merged or re-planned in one go. The schedule must add up to
 * the holding's price before it can be saved.
 */
export function ScheduleEditor({ holding: h, onClose, onSaved }: { holding: AdminHolding; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(() =>
    h.steps.map((s) => withKey({ due: toDhakaDay(new Date(s.dueDate)), amountBDT: s.amountBDT, label: s.part })),
  );
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [planner, setPlanner] = useState(false);

  // A payment is locked once it is paid in full; one part-paid can grow but not drop below what's in.
  const lockedCount = h.steps.filter((s) => s.status === "SUCCESS").length;
  const paidOn = (i: number) => h.steps[i]?.paidBDT ?? 0;

  const clean = rows.map(({ due, amountBDT, label }) => ({ due, amountBDT, label }));
  const problems = scheduleProblems(clean, h);
  const scheduled = rows.reduce((s, r) => s + (r.amountBDT || 0), 0);
  const diff = h.totalAmountBDT - scheduled;
  const canSave = !problems.form && !Object.keys(problems.rows).length;

  function update(i: number, patch: Partial<ScheduleRow>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    setServerError(null);
  }

  function addRow() {
    const last = rows[rows.length - 1];
    const due = last ? addMonths(last.due, 1) : toDhakaDay(new Date());
    setRows((rs) => [...rs, withKey({ due, amountBDT: Math.max(diff, 0) || 1, label: scheduleLabel(rs.length, !!h.downPaymentBDT) })]);
  }

  function removeRow(i: number) {
    setRows((rs) => rs.filter((_, j) => j !== i));
  }

  /** Puts the difference on the last payment that can still change. */
  function balanceLast() {
    for (let i = rows.length - 1; i >= lockedCount; i--) {
      const next = rows[i].amountBDT + diff;
      if (next >= Math.max(1, paidOn(i))) return update(i, { amountBDT: next });
    }
  }

  function sortByDate() {
    const locked = rows.slice(0, lockedCount);
    const rest = rows.slice(lockedCount).sort((a, b) => a.due.localeCompare(b.due));
    setRows([...locked, ...rest]);
  }

  async function save(schedule: ScheduleRow[] | null) {
    setBusy(true);
    setServerError(null);
    const { ok, json } = await send(`/api/admin/holdings/${h.id}`, "PATCH", { schedule });
    setBusy(false);
    if (!ok) return setServerError(firstError(json));
    toast(schedule ? "Payment schedule saved — the shareholder has been notified" : "Back to the standard plan");
    onSaved();
  }

  const first = rows[0]?.due;
  const last = rows[rows.length - 1]?.due;

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Payment schedule"
      footer={
        <>
          {h.customSchedule && (
            <Btn variant="ghost" onClick={() => save(null)} disabled={busy} className="mr-auto">
              Reset to standard plan
            </Btn>
          )}
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" onClick={() => save(clean)} disabled={busy || !canSave}>
            {busy ? "Saving…" : "Save schedule"}
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        {/* Who and how much */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F5F7F3] px-4 py-3 text-[0.8125rem]">
          <div>
            <p className="font-semibold text-[#14201B]">
              {h.customer.name} · {h.plan.name} · {h.units} share{h.units > 1 ? "s" : ""}
            </p>
            <p className="text-[#6B756F]">
              Price {formatBDT(h.totalAmountBDT)} · paid {formatBDT(h.paidBDT)} · {formatBDT(h.remainingBDT)} still owed
            </p>
          </div>
          <Btn size="sm" variant={planner ? "primary" : "secondary"} icon="calendar" onClick={() => setPlanner((p) => !p)}>
            Re-plan the balance
          </Btn>
        </div>

        {planner && (
          <Planner
            holding={h}
            rows={rows}
            lockedCount={lockedCount}
            onApply={(next) => {
              setRows(next.map(withKey));
              setPlanner(false);
              setServerError(null);
            }}
          />
        )}

        {/* Does it add up? */}
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-[0.8125rem]",
            diff === 0 ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-amber-200 bg-amber-50 text-amber-900",
          )}
          role="status"
        >
          <span>
            {rows.length} payment{rows.length === 1 ? "" : "s"}
            {first && last && ` · ${formatDate(`${first}T06:00:00Z`)} → ${formatDate(`${last}T06:00:00Z`)}`} · scheduled{" "}
            <strong className="tabular-nums">{formatBDT(scheduled)}</strong>
            {diff === 0 ? " — adds up to the price ✓" : diff > 0 ? ` — ${formatBDT(diff)} short of the price` : ` — ${formatBDT(-diff)} over the price`}
          </span>
          {diff !== 0 && rows.length > lockedCount && (
            <Btn size="sm" onClick={balanceLast}>
              {diff > 0 ? "Add" : "Take"} {formatBDT(Math.abs(diff))} {diff > 0 ? "to" : "from"} the last payment
            </Btn>
          )}
        </div>

        {/* The payments */}
        <div className="overflow-x-auto rounded-xl border border-[#E6E8E3]">
          <table className="w-full min-w-[40rem] text-left text-[0.8125rem]">
            <thead className="bg-[#FAFBF9] text-[0.6875rem] uppercase tracking-wide text-[#8A948E]">
              <tr>
                <th className="w-10 py-2 pl-3 font-medium">#</th>
                <th className="py-2 font-medium">Name</th>
                <th className="w-40 py-2 font-medium">Due</th>
                <th className="w-40 py-2 font-medium">Amount (৳)</th>
                <th className="w-10 py-2 pr-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F2EF]">
              {rows.map((r, i) => {
                const locked = i < lockedCount;
                const paid = paidOn(i);
                const err = problems.rows[i];
                return (
                  <tr key={r.key} className={cn(locked && "bg-[#FAFBF9] text-[#6B756F]")}>
                    <td className="py-2 pl-3 align-top text-xs tabular-nums text-[#9AA39E]">
                      <span className="mt-2 block">{String(i + 1).padStart(2, "0")}</span>
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <TextInput aria-label={`Name of payment ${i + 1}`} value={r.label} maxLength={60} disabled={locked} onChange={(e) => update(i, { label: e.target.value })} />
                      {locked ? (
                        <p className="mt-1 text-[0.6875rem] text-emerald-700">Paid in full — locked</p>
                      ) : paid > 0 ? (
                        <p className="mt-1 text-[0.6875rem] text-sky-700">{formatBDT(paid)} already paid on this one</p>
                      ) : null}
                      {err && <p className="mt-1 text-[0.6875rem] text-red-600">{err}</p>}
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <TextInput type="date" aria-label={`Due date of payment ${i + 1}`} value={r.due} disabled={locked} onChange={(e) => update(i, { due: e.target.value })} />
                    </td>
                    <td className="py-2 pr-2 align-top">
                      <TextInput
                        inputMode="numeric"
                        aria-label={`Amount of payment ${i + 1}`}
                        className="font-semibold tabular-nums"
                        value={r.amountBDT ? String(r.amountBDT) : ""}
                        disabled={locked}
                        onChange={(e) => update(i, { amountBDT: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })}
                      />
                    </td>
                    <td className="py-2 pr-3 align-top">
                      {!locked && paid === 0 && rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          aria-label={`Remove payment ${i + 1}`}
                          className="mt-1.5 flex h-6 w-6 items-center justify-center rounded-md text-[#9AA39E] hover:bg-red-50 hover:text-red-600"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap gap-2">
          <Btn size="sm" icon="calendar" onClick={addRow}>
            Add a payment
          </Btn>
          <Btn size="sm" variant="ghost" onClick={sortByDate}>
            Sort by due date
          </Btn>
        </div>

        {(problems.form || serverError) && (
          <p className="flex items-start gap-2 text-xs text-red-600">
            <AdminIcon icon="bell" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {serverError ?? problems.form}
          </p>
        )}
        <p className="text-xs leading-relaxed text-[#6B756F]">
          Money is always applied in order — the earliest payment first. Saving notifies {h.customer.name.split(" ")[0]} and updates their
          dashboard, reminders and receipts.
        </p>
      </div>
    </Modal>
  );
}

/**
 * Re-plans everything still owed: keeps payments already made, closes a
 * part-paid one at what's been paid, and splits the rest into equal payments
 * on a regular rhythm.
 */
function Planner({
  holding: h,
  rows,
  lockedCount,
  onApply,
}: {
  holding: AdminHolding;
  rows: Row[];
  lockedCount: number;
  onApply: (rows: ScheduleRow[]) => void;
}) {
  const partial = h.steps[lockedCount]?.paidBDT ?? 0;
  const keep: ScheduleRow[] = [
    ...rows.slice(0, lockedCount).map(({ due, amountBDT, label }) => ({ due, amountBDT, label })),
    ...(partial > 0 && rows[lockedCount] ? [{ due: rows[lockedCount].due, amountBDT: partial, label: rows[lockedCount].label }] : []),
  ];
  const balance = h.totalAmountBDT - keep.reduce((s, r) => s + r.amountBDT, 0);
  const today = toDhakaDay(new Date());
  const [count, setCount] = useState(Math.max(1, Math.min(12, rows.length - keep.length || 6)));
  const [firstDue, setFirstDue] = useState(() => {
    const nextUnpaid = rows[keep.length]?.due;
    return nextUnpaid && nextUnpaid >= today ? nextUnpaid : addMonths(today.slice(0, 8) + "01", 1);
  });
  const [every, setEvery] = useState(1);
  const [roundTo, setRoundTo] = useState(1000);

  const planned = splitIntoPayments({ amountBDT: balance, count, firstDue, everyMonths: every, roundTo });
  const typical = planned[0]?.amountBDT ?? 0;
  const lastPay = planned[planned.length - 1];

  function apply() {
    const start = keep.length;
    onApply([...keep, ...planned.map((p, i) => ({ ...p, label: scheduleLabel(start + i, !!h.downPaymentBDT) }))]);
  }

  return (
    <div className="rounded-xl border border-forest-200 bg-forest-50/40 p-4">
      <p className="text-sm font-semibold text-[#14201B]">Re-plan the {formatBDT(balance)} still to schedule</p>
      <p className="mt-0.5 text-xs text-[#6B756F]">
        Payments already made stay as they are{partial > 0 ? `; the part-paid one closes at the ${formatBDT(partial)} paid on it` : ""}.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Field label="Number of payments">
          {(id) => (
            <TextInput id={id} type="number" min={1} max={240} value={count} onChange={(e) => setCount(Math.max(1, Math.min(240, Number(e.target.value) || 1)))} />
          )}
        </Field>
        <Field label="First one due">
          {(id) => <TextInput id={id} type="date" value={firstDue} onChange={(e) => setFirstDue(e.target.value || today)} />}
        </Field>
        <Field label="Then every">
          {(id) => (
            <SelectInput id={id} value={every} onChange={(e) => setEvery(Number(e.target.value))}>
              <option value={1}>Month</option>
              <option value={2}>2 months</option>
              <option value={3}>3 months (quarterly)</option>
              <option value={6}>6 months</option>
              <option value={12}>Year</option>
            </SelectInput>
          )}
        </Field>
        <Field label="Round to">
          {(id) => (
            <SelectInput id={id} value={roundTo} onChange={(e) => setRoundTo(Number(e.target.value))}>
              <option value={1}>Exact taka</option>
              <option value={100}>৳100</option>
              <option value={1000}>৳1,000</option>
              <option value={5000}>৳5,000</option>
            </SelectInput>
          )}
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-[#3D4A44]">
          {planned.length > 1 ? (
            <>
              {planned.length} payments of about <strong className="tabular-nums">{formatBDT(typical)}</strong>
              {lastPay && lastPay.amountBDT !== typical && <> (last one {formatBDT(lastPay.amountBDT)})</>}, until{" "}
              {lastPay && formatDate(`${lastPay.due}T06:00:00Z`)}
            </>
          ) : (
            <>One payment of {formatBDT(balance)}</>
          )}
        </p>
        <Btn size="sm" variant="primary" icon="check" onClick={apply} disabled={balance <= 0}>
          Use this plan
        </Btn>
      </div>
    </div>
  );
}
