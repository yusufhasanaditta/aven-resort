"use client";

import { useMemo, useState } from "react";
import { Btn, Field, Modal, SelectInput, TextArea, TextInput, firstError, send, useToast } from "./kit";
import type { AdminHolding } from "@/lib/admin-types";
import { daysUntil } from "@/lib/account";
import { formatBDT } from "@/lib/shares";
import { cn } from "@/lib/utils";

export const METHOD_LABEL: Record<string, string> = {
  SSLCOMMERZ: "SSLCommerz (online)",
  BANK_TRANSFER: "Bank transfer / deposit",
  CASH: "Cash",
  CHEQUE: "Cheque",
  BKASH: "bKash",
  NAGAD: "Nagad",
  CARD: "Card (POS)",
  OTHER: "Other",
};

function todayDhaka() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

type Step = AdminHolding["steps"][number];
type Effect = { step: Step; applied: number; clears: boolean };

/** What an amount would do to the schedule — the same in-order rule the ledger uses. */
function preview(unpaid: Step[], amount: number): Effect[] {
  const out: Effect[] = [];
  let left = amount;
  for (const s of unpaid) {
    if (left <= 0) break;
    const applied = Math.min(left, s.dueBDT);
    out.push({ step: s, applied, clears: applied === s.dueBDT });
    left -= applied;
  }
  return out;
}

/**
 * Records money received outside the gateway — any amount, from a ৳5,000
 * part payment to the whole balance. It becomes one payment with one money
 * receipt and fills the schedule in order: what's owed on the earliest
 * installment first, then the next.
 */
export function RecordPaymentModal({
  holding,
  initialStep,
  onClose,
  onRecorded,
}: {
  holding: AdminHolding | null;
  initialStep?: number;
  onClose: () => void;
  onRecorded: () => void;
}) {
  const toast = useToast();
  const unpaid = useMemo(() => holding?.steps.filter((s) => s.status !== "SUCCESS") ?? [], [holding]);
  const remaining = holding?.remainingBDT ?? 0;

  // Quick amounts: the next due, everything overdue, a few installments, or the whole balance.
  const quick = useMemo(() => {
    const now = new Date().toISOString();
    const upTo = (k: number) => unpaid.slice(0, k).reduce((s, x) => s + x.dueBDT, 0);
    const overdue = unpaid.filter((s) => daysUntil(s.dueDate, now) < 0);
    const list: { label: string; amount: number }[] = [];
    if (unpaid[0]) list.push({ label: unpaid[0].paidBDT ? `Rest of ${unpaid[0].part.toLowerCase()}` : `Next: ${unpaid[0].part.toLowerCase()}`, amount: unpaid[0].dueBDT });
    if (overdue.length > 1) list.push({ label: `All overdue (${overdue.length})`, amount: upTo(overdue.length) });
    for (const k of [2, 3, 6]) if (unpaid.length > k) list.push({ label: `Next ${k} payments`, amount: upTo(k) });
    if (unpaid.length > 1) list.push({ label: "Full balance", amount: remaining });
    return list.filter((q, i, all) => all.findIndex((x) => x.amount === q.amount) === i);
  }, [unpaid, remaining]);

  const initial = useMemo(() => {
    if (!initialStep) return unpaid[0]?.dueBDT ?? 0;
    // "Record" on a later installment: everything owed up to and including it.
    return unpaid.filter((s) => s.n <= initialStep).reduce((s, x) => s + x.dueBDT, 0);
  }, [initialStep, unpaid]);

  const [amountText, setAmountText] = useState(initial ? String(initial) : "");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(todayDhaka());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; covered: string; next: { label: string; amountBDT: number } | null; remainingBDT: number } | null>(null);

  const amount = Number(amountText.replace(/[^0-9]/g, "")) || 0;
  const tooMuch = amount > remaining;
  const effects = useMemo(() => (tooMuch ? [] : preview(unpaid, amount)), [unpaid, amount, tooMuch]);

  async function submit() {
    if (!holding || !amount || tooMuch) return;
    setBusy(true);
    setError(null);
    const { ok, json } = await send("/api/admin/payments", "POST", {
      holdingId: holding.id,
      amountBDT: amount,
      method,
      reference: reference || undefined,
      note: note || undefined,
      paidAt,
    });
    setBusy(false);
    if (!ok) return setError(firstError(json));
    toast(`${formatBDT(amount)} recorded for ${holding.customer.name}`);
    setDone({ id: String(json.paymentId), covered: String(json.covered ?? ""), next: (json.next as { label: string; amountBDT: number } | null) ?? null, remainingBDT: Number(json.remainingBDT ?? 0) });
    onRecorded();
  }

  const close = () => {
    setDone(null);
    onClose();
  };

  return (
    <Modal
      open={!!holding}
      onClose={close}
      title={done ? "Payment recorded" : "Record a payment"}
      footer={
        done ? (
          <>
            <Btn onClick={close}>Done</Btn>
            <a
              href={`/account/invoices/${done.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-forest-700 px-3.5 text-[0.8125rem] font-medium text-white hover:bg-forest-800"
            >
              Open money receipt
            </a>
          </>
        ) : (
          <>
            <Btn onClick={close}>Cancel</Btn>
            <Btn variant="primary" onClick={submit} disabled={busy || !amount || tooMuch || !unpaid.length}>
              {busy ? "Saving…" : unpaid.length ? `Record ${formatBDT(amount)}` : "Nothing due"}
            </Btn>
          </>
        )
      }
    >
      {holding &&
        (done ? (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</span>
            <p className="mt-4 text-sm text-[#3D4A44]">
              <strong>{formatBDT(amount)}</strong> from <strong>{holding.customer.name}</strong> is recorded for{" "}
              <strong>{done.covered}</strong>, with a money receipt.
            </p>
            <p className="mt-2 text-xs text-[#6B756F]">
              {done.next ? `Next: ${done.next.label} · ${formatBDT(done.next.amountBDT)}` : "The holding is now fully paid."}
              {done.remainingBDT > 0 && ` · ${formatBDT(done.remainingBDT)} left in all`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#F5F7F3] p-4 text-[0.8125rem]">
              <p className="font-semibold text-[#14201B]">{holding.customer.name}</p>
              <p className="text-[#6B756F]">
                {holding.plan.name} · {holding.units} shares · paid {formatBDT(holding.paidBDT)} of {formatBDT(holding.totalAmountBDT)} ·{" "}
                <span className="font-medium text-[#14201B]">{formatBDT(remaining)} left</span>
              </p>
            </div>
            {unpaid.length === 0 ? (
              <p className="text-sm text-emerald-700">This holding is fully paid.</p>
            ) : (
              <>
                <Field label="Amount received" error={tooMuch ? `Only ${formatBDT(remaining)} is left to pay on this holding.` : undefined}>
                  {(id) => (
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8A948E]">৳</span>
                      <TextInput
                        id={id}
                        inputMode="numeric"
                        autoFocus
                        className="h-11 pl-7 text-lg font-semibold tabular-nums"
                        placeholder="Any amount, e.g. 5000"
                        value={amountText}
                        onChange={(e) => setAmountText(e.target.value)}
                      />
                    </div>
                  )}
                </Field>
                <div className="flex flex-wrap gap-1.5">
                  {quick.map((q) => (
                    <button
                      key={q.label}
                      type="button"
                      onClick={() => setAmountText(String(q.amount))}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-left text-xs transition-colors",
                        amount === q.amount ? "border-forest-700 bg-forest-50 text-forest-900" : "border-[#DDE1DB] bg-white text-[#3D4A44] hover:border-forest-400",
                      )}
                    >
                      <span className="block font-medium">{q.label}</span>
                      <span className="block tabular-nums text-[#6B756F]">{formatBDT(q.amount)}</span>
                    </button>
                  ))}
                </div>

                {effects.length > 0 && (
                  <div className="rounded-xl border border-[#E3E7E1] p-3">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[#8A948E]">This payment will</p>
                    <ul className="mt-1.5 space-y-1 text-[0.8125rem]">
                      {effects.map((e) => (
                        <li key={e.step.n} className="flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-[#14201B]">
                            <span className={cn("flex h-4 w-4 items-center justify-center rounded-full text-[0.5625rem] text-white", e.clears ? "bg-emerald-600" : "bg-sky-500")}>
                              {e.clears ? "✓" : "½"}
                            </span>
                            {e.clears ? (e.step.paidBDT ? `Finish ${e.step.part.toLowerCase()}` : `Pay ${e.step.part.toLowerCase()}`) : `Part-pay ${e.step.part.toLowerCase()}`}
                            {!e.clears && <span className="text-xs text-[#6B756F]">({formatBDT(e.step.dueBDT - e.applied)} still owed)</span>}
                          </span>
                          <span className="tabular-nums text-[#3D4A44]">{formatBDT(e.applied)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Method">
                    {(id) => (
                      <SelectInput id={id} value={method} onChange={(e) => setMethod(e.target.value)}>
                        {Object.entries(METHOD_LABEL)
                          .filter(([k]) => k !== "SSLCOMMERZ")
                          .map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                      </SelectInput>
                    )}
                  </Field>
                  <Field label="Date received">
                    {(id) => <TextInput id={id} type="date" value={paidAt} max={todayDhaka()} onChange={(e) => setPaidAt(e.target.value)} />}
                  </Field>
                </div>
                <Field label="Reference" hint="Bank slip, bKash TrxID or cheque number">
                  {(id) => <TextInput id={id} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. DBBL-0925-4471" />}
                </Field>
                <Field label="Internal note">
                  {(id) => <TextArea id={id} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />}
                </Field>
                {error && <p className="text-xs text-red-600">{error}</p>}
              </>
            )}
          </div>
        ))}
    </Modal>
  );
}
