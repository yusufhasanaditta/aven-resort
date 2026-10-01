"use client";

import { useState } from "react";
import { Btn, Field, Modal, SelectInput, TextArea, TextInput, firstError, send, useToast } from "./kit";
import type { AdminHolding } from "@/lib/admin-types";
import { formatBDT } from "@/lib/shares";

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

/**
 * Records money received outside the gateway against one installment of a
 * holding. The amount is fixed to the installment's scheduled amount (the
 * ledger settles whole installments), so the team can't mistype a figure.
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
  const unpaid = holding?.steps.filter((s) => s.status !== "SUCCESS") ?? [];
  const [n, setN] = useState<number | undefined>(initialStep ?? unpaid[0]?.n);
  const [method, setMethod] = useState("BANK_TRANSFER");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [paidAt, setPaidAt] = useState(todayDhaka());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);

  const step = unpaid.find((s) => s.n === n) ?? unpaid[0];

  async function submit() {
    if (!holding || !step) return;
    setBusy(true);
    setError(null);
    const { ok, json } = await send("/api/admin/payments", "POST", {
      holdingId: holding.id,
      installmentNo: step.n,
      amountBDT: step.amountBDT,
      method,
      reference: reference || undefined,
      note: note || undefined,
      paidAt,
    });
    setBusy(false);
    if (!ok) return setError(firstError(json));
    toast(`${formatBDT(step.amountBDT)} recorded for ${holding.customer.name}`);
    setReceiptId(String(json.paymentId));
    onRecorded();
  }

  const close = () => {
    setReceiptId(null);
    onClose();
  };

  return (
    <Modal
      open={!!holding}
      onClose={close}
      title={receiptId ? "Payment recorded" : "Record a payment"}
      footer={
        receiptId ? (
          <>
            <Btn onClick={close}>Done</Btn>
            <a
              href={`/account/invoices/${receiptId}`}
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
            <Btn variant="primary" onClick={submit} disabled={busy || !step}>
              {busy ? "Saving…" : step ? `Record ${formatBDT(step.amountBDT)}` : "Nothing due"}
            </Btn>
          </>
        )
      }
    >
      {holding &&
        (receiptId ? (
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">✓</span>
            <p className="mt-4 text-sm text-[#3D4A44]">
              The installment is marked paid, the holding is active and a money receipt has been generated for{" "}
              <strong>{holding.customer.name}</strong>.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl bg-[#F5F7F3] p-4 text-[0.8125rem]">
              <p className="font-semibold text-[#14201B]">{holding.customer.name}</p>
              <p className="text-[#6B756F]">
                {holding.plan.name} · {holding.units} shares · paid {formatBDT(holding.paidBDT)} of {formatBDT(holding.totalAmountBDT)}
              </p>
            </div>
            {unpaid.length === 0 ? (
              <p className="text-sm text-emerald-700">This holding is fully paid.</p>
            ) : (
              <>
                <Field label="Installment">
                  {(id) => (
                    <SelectInput id={id} value={step?.n} onChange={(e) => setN(Number(e.target.value))}>
                      {unpaid.map((s) => (
                        <option key={s.n} value={s.n}>
                          {s.label} — {formatBDT(s.amountBDT)}
                          {s.status === "PENDING" ? " (gateway pending)" : ""}
                        </option>
                      ))}
                    </SelectInput>
                  )}
                </Field>
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
                <div className="flex items-baseline justify-between rounded-xl border border-dashed border-[#D5DAD3] px-4 py-3">
                  <span className="text-xs text-[#6B756F]">Amount (fixed to the schedule)</span>
                  <span className="text-lg font-semibold tabular-nums text-[#14201B]">{step ? formatBDT(step.amountBDT) : "—"}</span>
                </div>
                {error && <p className="text-xs text-red-600">{error}</p>}
              </>
            )}
          </div>
        ))}
    </Modal>
  );
}
