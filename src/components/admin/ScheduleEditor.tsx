"use client";

import { useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { Btn, Modal, TextInput, firstError, send, useToast } from "./kit";
import type { AdminHolding } from "@/lib/admin-types";
import { scheduleProblems } from "@/lib/account";
import { addMonths, formatBDT, toDhakaDay, type ScheduleRow } from "@/lib/shares";
import { cn } from "@/lib/utils";

type Row = ScheduleRow & { key: number };

let nextKey = 1;
const withKey = (r: ScheduleRow): Row => ({ ...r, key: nextKey++ });

/** The 1st of next month, YYYY-MM-DD. */
function firstOfNextMonth() {
  return addMonths(`${toDhakaDay(new Date()).slice(0, 8)}01`, 1);
}

/**
 * The installments the team agreed with one shareholder, set by hand: a
 * name, a due date and an amount for each — as many or as few as agreed,
 * or none at all. Nothing is generated automatically. Whatever the
 * installments don't cover stays an open balance, paid in any amount, any
 * time. Paid installments are locked.
 */
export function ScheduleEditor({ holding: h, onClose, onSaved }: { holding: AdminHolding; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const [rows, setRows] = useState<Row[]>(() =>
    h.steps.map((s) => withKey({ due: toDhakaDay(new Date(s.dueDate)), amountBDT: s.amountBDT, label: s.part, added: s.addedAt ?? undefined })),
  );
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // An installment is locked once it is paid in full; one part-paid can grow but not drop below what's in.
  const lockedCount = h.steps.filter((s) => s.status === "SUCCESS").length;
  const paidOn = (i: number) => h.steps[i]?.paidBDT ?? 0;

  // A blank name is saved as "Installment N".
  const clean = rows.map(({ due, amountBDT, label, added }, i) => ({ due, amountBDT, label: label.trim() || `Installment ${i + 1}`, added }));
  const problems = scheduleProblems(clean, h);
  const scheduled = rows.reduce((s, r) => s + (r.amountBDT || 0), 0);
  const open = h.totalAmountBDT - scheduled;
  const canSave = !problems.form && !Object.keys(problems.rows).length;

  function update(i: number, patch: Partial<ScheduleRow>) {
    setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    setServerError(null);
  }

  function addRow() {
    const last = rows[rows.length - 1];
    setRows((rs) => [...rs, withKey({ due: last ? addMonths(last.due, 1) : firstOfNextMonth(), amountBDT: 0, label: "", added: new Date().toISOString() })]);
  }

  async function save() {
    // Installments go in date order — money is applied to the earliest first.
    const ordered = [...clean.slice(0, lockedCount), ...clean.slice(lockedCount).sort((a, b) => a.due.localeCompare(b.due))];
    setBusy(true);
    setServerError(null);
    const { ok, json } = await send(`/api/admin/holdings/${h.id}`, "PATCH", { schedule: ordered });
    setBusy(false);
    if (!ok) return setServerError(firstError(json));
    toast(ordered.length ? "Installments saved — the shareholder has been notified" : "Installments removed — any amount, any time");
    onSaved();
  }

  return (
    <Modal
      open
      onClose={onClose}
      wide
      title="Installments"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="check" onClick={save} disabled={busy || !canSave}>
            {busy ? "Saving…" : "Save"}
          </Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-[#F5F7F3] px-4 py-3 text-[0.8125rem]">
          <p className="font-semibold text-[#14201B]">
            {h.customer.name} · {h.plan.name} · {h.units} share{h.units > 1 ? "s" : ""}
          </p>
          <p className="text-[#6B756F]">
            Price {formatBDT(h.totalAmountBDT)} · paid {formatBDT(h.paidBDT)} · {formatBDT(h.remainingBDT)} still owed
          </p>
        </div>

        <p className="text-xs leading-relaxed text-[#3D4A44]">
          Add an installment only when you&rsquo;ve agreed one with {h.customer.name.split(" ")[0]} — e.g. &ldquo;December&rdquo;, due 1 Dec,
          ৳10,000. They can still pay any amount at any time; whatever isn&rsquo;t on an installment stays an open balance with no due date.
        </p>

        {rows.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-[#E6E8E3]">
            <table className="w-full min-w-[36rem] text-left text-[0.8125rem]">
              <thead className="bg-[#FAFBF9] text-[0.6875rem] uppercase tracking-wide text-[#8A948E]">
                <tr>
                  <th className="py-2 pl-3 font-medium">Name</th>
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
                      <td className="py-2 pl-3 pr-2 align-top">
                        <TextInput
                          aria-label={`Name of installment ${i + 1}`}
                          value={r.label}
                          maxLength={60}
                          placeholder={`e.g. December · Installment ${i + 1}`}
                          disabled={locked}
                          onChange={(e) => update(i, { label: e.target.value })}
                        />
                        {locked ? (
                          <p className="mt-1 text-[0.6875rem] text-emerald-700">Paid in full — locked</p>
                        ) : paid > 0 ? (
                          <p className="mt-1 text-[0.6875rem] text-sky-700">{formatBDT(paid)} already paid on this one</p>
                        ) : null}
                        {err && <p className="mt-1 text-[0.6875rem] text-red-600">{err}</p>}
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <TextInput type="date" aria-label={`Due date of installment ${i + 1}`} value={r.due} disabled={locked} onChange={(e) => update(i, { due: e.target.value })} />
                      </td>
                      <td className="py-2 pr-2 align-top">
                        <TextInput
                          inputMode="numeric"
                          aria-label={`Amount of installment ${i + 1}`}
                          className="font-semibold tabular-nums"
                          placeholder="e.g. 10000"
                          value={r.amountBDT ? String(r.amountBDT) : ""}
                          disabled={locked}
                          onChange={(e) => update(i, { amountBDT: Number(e.target.value.replace(/[^0-9]/g, "")) || 0 })}
                        />
                      </td>
                      <td className="py-2 pr-3 align-top">
                        {!locked && paid === 0 && (
                          <button
                            type="button"
                            onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}
                            aria-label={`Remove installment ${i + 1}`}
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
        )}

        <Btn size="sm" icon="calendar" onClick={addRow}>
          Add an installment
        </Btn>

        <div
          className={cn(
            "rounded-xl border px-4 py-2.5 text-[0.8125rem]",
            open < 0 ? "border-red-200 bg-red-50 text-red-900" : "border-[#E3E7E1] bg-[#FAFBF9] text-[#3D4A44]",
          )}
          role="status"
        >
          {rows.length ? (
            <>
              {rows.length} installment{rows.length === 1 ? "" : "s"} · <strong className="tabular-nums">{formatBDT(scheduled)}</strong>
              {open > 0 ? <> · {formatBDT(open)} open balance — any amount, any time</> : open === 0 ? " — covers the whole price" : null}
            </>
          ) : (
            <>No installments — {formatBDT(h.totalAmountBDT)} is an open balance, paid in any amount, any time.</>
          )}
        </div>

        {(problems.form || serverError) && (
          <p className="flex items-start gap-2 text-xs text-red-600">
            <AdminIcon icon="bell" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {serverError ?? problems.form}
          </p>
        )}
      </div>
    </Modal>
  );
}
