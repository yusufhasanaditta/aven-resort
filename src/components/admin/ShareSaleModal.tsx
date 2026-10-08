"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { Avatar, Btn, Field, Modal, Segmented, TextArea, TextInput, firstError, send, useToast } from "./kit";
import { METHOD_LABEL } from "./RecordPayment";
import { DiscountField, NO_DISCOUNT, type DiscountValue } from "./DiscountField";
import { calculate, discountProblem, formatBDT, maxDiscountBDT, stayDays, withDiscount, type PlanLike } from "@/lib/shares";
import type { AdminCustomer } from "@/lib/admin-types";
import { cn } from "@/lib/utils";

type Person = { id: string; name: string; email: string; phone: string; memberId?: string; photoUrl?: string | null };
type Plan = PlanLike & { name: string };
type Done = {
  holdingId: string;
  person: Person;
  shareNo: string | null;
  units: number;
  planName: string;
  totalBDT: number;
  discountBDT: number;
  receivedBDT: number;
  covered: string[];
  next: { label: string; amountBDT: number } | null;
  remainingBDT: number;
  paymentIds: string[];
};

const OFFLINE_METHODS = ["CASH", "BANK_TRANSFER", "BKASH", "NAGAD", "CHEQUE", "CARD", "OTHER"] as const;
type Method = (typeof OFFLINE_METHODS)[number];

function todayDhaka() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
}

/**
 * A share sale closed at the office, in one go: pick the shareholder, the
 * shares and how they pay, and record the money they handed over (cash, bank,
 * bKash…). Their account then shows the shares, a money receipt for every
 * payment covered, and the next installment due.
 */
export function ShareSaleModal({
  open,
  person: preset,
  onClose,
  onDone,
  onOpenCustomer,
  onAddShareholder,
}: {
  open: boolean;
  /** The buyer, when the sale starts from their profile; otherwise the admin picks one. */
  person?: Person | null;
  onClose: () => void;
  onDone: () => void;
  onOpenCustomer?: (id: string) => void;
  onAddShareholder?: () => void;
}) {
  const toast = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [people, setPeople] = useState<Person[] | null>(null);
  const [buyer, setBuyer] = useState<Person | null>(preset ?? null);
  const [q, setQ] = useState("");
  const [units, setUnits] = useState(1);
  const [paymentPlan, setPaymentPlan] = useState<"INSTALLMENT" | "FULL">("INSTALLMENT");
  const [paidNow, setPaidNow] = useState(true);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountValue>(NO_DISCOUNT);
  const [count, setCount] = useState(1);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Method>("CASH");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(todayDhaka);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    if (!open) return;
    if (!plans.length) fetch("/api/plans").then((r) => r.json()).then((j) => setPlans(j.plans ?? [])).catch(() => setErrors({ form: "Could not load the plans." }));
    if (!preset && !people) {
      fetch("/api/admin/customers")
        .then((r) => r.json())
        .then((j) => setPeople((j.customers ?? []).map((c: AdminCustomer) => ({ id: c.id, name: c.name, email: c.email, phone: c.phone, memberId: c.memberId, photoUrl: c.photoUrl }))))
        .catch(() => setPeople([]));
    }
  }, [open, plans.length, preset, people]);

  const chart = useMemo(() => (plans.length ? calculate(plans, units, paymentPlan) : null), [plans, units, paymentPlan]);
  // The price after the office discount — what the schedule and the receipt use.
  const discountIssue = chart && discount.amountBDT ? discountProblem(chart, discount.amountBDT) : null;
  const discountBDT = discountIssue ? 0 : discount.amountBDT;
  const result = useMemo(() => (chart ? withDiscount(chart, discountBDT) : null), [chart, discountBDT]);
  const parts = useMemo(
    () => (result ? (result.installments ?? [{ index: 1, label: "Full payment", amountBDT: result.totalBDT }]) : []),
    [result],
  );
  // Running totals: what "down payment", "down payment + 1st installment"… come to.
  const cumulative = useMemo(() => parts.map((_, i) => parts.slice(0, i + 1).reduce((s, l) => s + l.amountBDT, 0)), [parts]);
  const n = Math.min(count, parts.length || 1);
  const due = cumulative[n - 1] ?? 0;
  const typed = Number(amount.replace(/[^0-9]/g, "")) || 0;
  const received = amount ? typed : due;
  const saleTotal = result?.totalBDT ?? 0;
  // Any amount from ৳1 to the whole price; it fills the schedule in order.
  const amountOk = !paidNow || (received >= 1 && received <= saleTotal);
  // What's due next once today's money is in — the same in-order rule the ledger uses.
  const afterPay = (() => {
    let left = paidNow ? received : 0;
    for (const l of parts) {
      if (left < l.amountBDT) return { label: left > 0 ? `Rest of ${l.label.toLowerCase()}` : l.label, amountBDT: l.amountBDT - left };
      left -= l.amountBDT;
    }
    return null;
  })();

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!people) return [];
    return people.filter((p) => !needle || [p.name, p.email, p.phone, p.memberId ?? ""].some((v) => v.toLowerCase().includes(needle))).slice(0, 6);
  }, [people, q]);

  function onAmount(v: string) {
    setAmount(v);
    // Typing an amount that matches a whole number of payments selects them.
    const value = Number(v.replace(/[^0-9]/g, "")) || 0;
    const i = cumulative.indexOf(value);
    if (i >= 0) setCount(i + 1);
  }

  function reset() {
    setBuyer(preset ?? null);
    setQ("");
    setUnits(1);
    setPaymentPlan("INSTALLMENT");
    setPaidNow(true);
    setDiscountOpen(false);
    setDiscount(NO_DISCOUNT);
    setCount(1);
    setAmount("");
    setMethod("CASH");
    setReference("");
    setPaidAt(todayDhaka());
    setNote("");
    setErrors({});
    setDone(null);
  }

  function close() {
    reset();
    onClose();
  }

  async function save() {
    if (!buyer) return setErrors({ userId: "Choose who is buying." });
    if (!result) return;
    if (discountIssue) return setErrors({ discountBDT: discountIssue });
    if (!amountOk) return setErrors({ amountBDT: received < 1 ? "Enter the amount received." : `The whole sale comes to ${formatBDT(saleTotal)}.` });
    setBusy(true);
    setErrors({});
    const { ok, json } = await send("/api/admin/sales", "POST", {
      userId: buyer.id,
      units,
      paymentPlan,
      discountBDT,
      discountNote: discountBDT ? discount.note.trim() || undefined : undefined,
      payment: paidNow ? { amountBDT: received, method, reference, note, paidAt } : undefined,
    });
    setBusy(false);
    if (!ok) return setErrors(json.errors ?? { form: firstError(json) });
    const s = json.shareNo as { from: number | null; to: number | null };
    const pad = (x: number) => String(x).padStart(4, "0");
    setDone({
      holdingId: String(json.holdingId),
      person: buyer,
      shareNo: s?.from ? (s.to && s.to !== s.from ? `#${pad(s.from)}–${pad(s.to)}` : `#${pad(s.from)}`) : null,
      units: result.units,
      planName: result.plan.name,
      totalBDT: result.totalBDT,
      discountBDT,
      receivedBDT: Number(json.receivedBDT),
      covered: json.covered as string[],
      next: json.next as Done["next"],
      remainingBDT: Number(json.remainingBDT),
      paymentIds: json.paymentIds as string[],
    });
    toast(`${result.units} share${result.units > 1 ? "s" : ""} added to ${buyer.name}`);
    onDone();
  }

  return (
    <Modal
      open={open}
      onClose={close}
      wide
      title={done ? "Sale recorded" : "New share sale"}
      footer={
        done ? (
          <>
            <Btn onClick={reset}>Record another sale</Btn>
            {onOpenCustomer && (
              <Btn
                variant="primary"
                onClick={() => {
                  const id = done.person.id;
                  close();
                  onOpenCustomer(id);
                }}
              >
                Open shareholder
              </Btn>
            )}
          </>
        ) : (
          <>
            <Btn onClick={close}>Cancel</Btn>
            <Btn variant="primary" icon="check" onClick={save} disabled={busy || !result || !buyer}>
              {busy ? "Saving…" : paidNow ? `Save sale & receipt` : "Save sale"}
            </Btn>
          </>
        )
      }
    >
      {done ? (
        <SaleDone done={done} />
      ) : (
        <div className="space-y-6">
          {/* 1 · Buyer */}
          <Section n={1} title="Who is buying?">
            {buyer ? (
              <div className="flex items-center gap-3 rounded-xl border border-[#E3E7E1] bg-[#FAFBF9] px-3 py-2.5">
                <Avatar name={buyer.name} src={buyer.photoUrl} className="h-9 w-9 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#14201B]">{buyer.name}</p>
                  <p className="truncate text-xs text-[#6B756F]">
                    {buyer.memberId && <span className="font-mono">{buyer.memberId} · </span>}
                    {buyer.phone}
                  </p>
                </div>
                {!preset && (
                  <Btn size="sm" variant="ghost" onClick={() => setBuyer(null)}>
                    Change
                  </Btn>
                )}
              </div>
            ) : (
              <div>
                <TextInput
                  aria-label="Search shareholders"
                  placeholder="Search by name, membership no., phone or email…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoFocus
                />
                <ul className="mt-2 max-h-56 divide-y divide-[#F0F2EF] overflow-y-auto rounded-xl border border-[#E6E8E3]">
                  {people === null && <li className="px-3 py-3 text-xs text-[#6B756F]">Loading shareholders…</li>}
                  {people && matches.length === 0 && (
                    <li className="px-3 py-3 text-xs text-[#6B756F]">No shareholder matches “{q}”.</li>
                  )}
                  {matches.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setBuyer(p)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-[#F5F7F3]"
                      >
                        <Avatar name={p.name} src={p.photoUrl} className="h-8 w-8 text-[0.625rem]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8125rem] font-medium text-[#14201B]">{p.name}</span>
                          <span className="block truncate text-xs text-[#6B756F]">
                            {p.memberId && <span className="font-mono">{p.memberId} · </span>}
                            {p.phone}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {onAddShareholder && (
                  <p className="mt-2 text-xs text-[#6B756F]">
                    New buyer?{" "}
                    <button type="button" onClick={onAddShareholder} className="font-medium text-forest-700 hover:underline">
                      Open their account first
                    </button>
                  </p>
                )}
                {errors.userId && <p className="mt-1.5 text-xs text-red-600">{errors.userId}</p>}
              </div>
            )}
          </Section>

          {/* 2 · Shares */}
          <Section n={2} title="Shares">
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
              <Field label="Number of shares" error={errors.units}>
                {(id) => (
                  <div className="flex items-center gap-1.5">
                    <Btn size="sm" aria-label="One share fewer" onClick={() => { setUnits((u) => Math.max(1, u - 1)); setCount(1); setAmount(""); }}>−</Btn>
                    <TextInput
                      id={id}
                      type="number"
                      min={1}
                      max={2700}
                      className="w-20 text-center tabular-nums"
                      value={units}
                      onChange={(e) => { setUnits(Math.max(1, Math.min(2700, Number(e.target.value) || 1))); setCount(1); setAmount(""); }}
                    />
                    <Btn size="sm" aria-label="One share more" onClick={() => { setUnits((u) => Math.min(2700, u + 1)); setCount(1); setAmount(""); }}>+</Btn>
                  </div>
                )}
              </Field>
              <div>
                <p className="mb-1.5 text-xs font-medium text-[#3D4A44]">How they pay</p>
                <Segmented<"INSTALLMENT" | "FULL">
                  value={paymentPlan}
                  onChange={(v) => { setPaymentPlan(v); setCount(1); setAmount(""); }}
                  options={[
                    { value: "INSTALLMENT", label: "Installments" },
                    { value: "FULL", label: "Pay in full" },
                  ]}
                />
              </div>
            </div>
            {result && (
              <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-[#E6E8E3] text-[0.8125rem] sm:grid-cols-4">
                {[
                  { k: "Package", v: result.plan.name },
                  { k: discountBDT ? "Price after discount" : "Total price", v: formatBDT(result.totalBDT) },
                  { k: paymentPlan === "INSTALLMENT" ? "Payments" : "Payment", v: paymentPlan === "INSTALLMENT" ? `${parts.length} (down + ${parts.length - 1})` : "1, in full" },
                  { k: "Free stay", v: `${stayDays(result.freeStayNights)} days / yr` },
                ].map((c) => (
                  <div key={c.k} className="bg-[#FAFBF9] px-3 py-2.5">
                    <p className="text-[0.6875rem] text-[#8A948E]">{c.k}</p>
                    <p className="mt-0.5 font-semibold tabular-nums text-[#14201B]">{c.v}</p>
                  </div>
                ))}
              </div>
            )}
            {chart &&
              (discountOpen ? (
                <div className="mt-4 rounded-xl border border-[#E3E7E1] p-3.5">
                  <DiscountField
                    listPriceBDT={chart.totalBDT}
                    maxBDT={maxDiscountBDT(chart)}
                    value={discount}
                    onChange={(v) => { setDiscount(v); setCount(1); setAmount(""); }}
                    error={errors.discountBDT}
                  />
                  <button
                    type="button"
                    onClick={() => { setDiscountOpen(false); setDiscount(NO_DISCOUNT); setCount(1); setAmount(""); }}
                    className="mt-2 text-xs font-medium text-[#6B756F] hover:text-red-600"
                  >
                    Remove discount
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setDiscountOpen(true)} className="mt-3 text-xs font-semibold text-forest-700 hover:underline">
                  + Give a discount
                </button>
              ))}
          </Section>

          {/* 3 · Money received */}
          <Section
            n={3}
            title="Money received now"
            action={
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#3D4A44]">
                <input type="checkbox" checked={paidNow} onChange={(e) => setPaidNow(e.target.checked)} className="h-4 w-4 accent-forest-700" />
                They paid today
              </label>
            }
          >
            {paidNow ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-[1.5fr_1fr]">
                  <Field label="Quick fill" error={errors.count}>
                    {(id) => (
                      <select
                        id={id}
                        value={n}
                        onChange={(e) => { setCount(Number(e.target.value)); setAmount(""); }}
                        className="h-9 w-full rounded-lg border border-[#DDE1DB] bg-white px-3 text-[0.8125rem] text-[#14201B] outline-none focus:border-forest-500"
                      >
                        {parts.map((l, i) => (
                          <option key={l.index} value={i + 1}>
                            {i === 0 ? l.label : i === parts.length - 1 ? `Everything (${i + 1} payments)` : `${parts[0].label} + ${i} installment${i > 1 ? "s" : ""}`} — {formatBDT(cumulative[i])}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>
                  <Field
                    label="Amount received (BDT) — any amount"
                    error={errors.amountBDT ?? (!amountOk ? (received < 1 ? "Enter the amount received." : `The whole sale comes to ${formatBDT(saleTotal)}.`) : undefined)}
                  >
                    {(id) => (
                      <TextInput
                        id={id}
                        inputMode="numeric"
                        className="font-semibold tabular-nums"
                        value={amount || String(due)}
                        onChange={(e) => onAmount(e.target.value)}
                      />
                    )}
                  </Field>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-[#3D4A44]">Paid by</p>
                  <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Payment method">
                    {OFFLINE_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        role="radio"
                        aria-checked={method === m}
                        onClick={() => setMethod(m)}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                          method === m ? "border-forest-700 bg-forest-700 text-white" : "border-[#DDE1DB] bg-white text-[#3D4A44] hover:border-forest-400",
                        )}
                      >
                        {METHOD_LABEL[m]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label={method === "CASH" ? "Office receipt no. (optional)" : method === "CHEQUE" ? "Cheque no." : "Transaction / reference no."}
                    error={errors.reference}
                  >
                    {(id) => <TextInput id={id} value={reference} onChange={(e) => setReference(e.target.value)} placeholder={method === "BANK_TRANSFER" ? "e.g. bank slip / TT reference" : method === "BKASH" || method === "NAGAD" ? "e.g. 8N7A6X2KQ" : ""} />}
                  </Field>
                  <Field label="Date received" error={errors.paidAt}>
                    {(id) => <TextInput id={id} type="date" max={todayDhaka()} value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />}
                  </Field>
                </div>
                <Field label="Note (optional)">
                  {(id) => <TextArea id={id} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Received by Rahim at the Dhaka office" />}
                </Field>
              </div>
            ) : (
              <p className="rounded-xl bg-[#F5F7F3] px-4 py-3 text-xs leading-relaxed text-[#3D4A44]">
                The shares are reserved in their name and the first payment ({parts[0] ? `${parts[0].label}, ${formatBDT(parts[0].amountBDT)}` : "—"}) shows
                as due on their dashboard. Record the money later from their profile or Installments &amp; dues.
              </p>
            )}
          </Section>

          {/* Summary */}
          {result && (
            <div className="rounded-xl bg-gradient-to-br from-forest-800 to-forest-950 p-4 text-white">
              <p className="text-[0.6875rem] uppercase tracking-wide text-white/55">After saving</p>
              <dl className="mt-2 grid grid-cols-3 gap-3 text-[0.8125rem]">
                <div>
                  <dt className="text-white/55">Received</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{paidNow ? formatBDT(received) : "—"}</dd>
                </div>
                <div>
                  <dt className="text-white/55">Next payment</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">
                    {afterPay ? `${afterPay.label} · ${formatBDT(afterPay.amountBDT)}` : "Fully paid"}
                  </dd>
                </div>
                <div>
                  <dt className="text-white/55">Balance left</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums">{formatBDT(Math.max(0, result.totalBDT - (paidNow ? received : 0)))}</dd>
                </div>
              </dl>
            </div>
          )}
          {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
        </div>
      )}
    </Modal>
  );
}

function Section({ n, title, action, children }: { n: number; title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-[#14201B]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-700 text-[0.625rem] text-white">{n}</span>
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SaleDone({ done }: { done: Done }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">
          <AdminIcon icon="check" className="h-5 w-5" />
        </span>
        <div className="min-w-0 text-[0.8125rem] text-emerald-900">
          <p className="font-semibold">
            {done.units} {done.planName} share{done.units > 1 ? "s" : ""} added to {done.person.name}
          </p>
          <p className="text-emerald-800/80">They&rsquo;ve been notified, and it&rsquo;s on their dashboard now.</p>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[0.8125rem] sm:grid-cols-3">
        {[
          { k: "Share number", v: done.shareNo ?? "—", mono: true },
          { k: done.discountBDT ? "Price after discount" : "Total price", v: formatBDT(done.totalBDT) },
          ...(done.discountBDT ? [{ k: "Discount given", v: formatBDT(done.discountBDT) }] : []),
          { k: "Received", v: done.receivedBDT ? formatBDT(done.receivedBDT) : "Nothing yet" },
          { k: "Covers", v: done.covered.length ? done.covered.join(", ") : "—" },
          { k: "Next payment", v: done.next ? `${done.next.label} · ${formatBDT(done.next.amountBDT)}` : "Fully paid" },
          { k: "Balance left", v: formatBDT(done.remainingBDT) },
        ].map((r) => (
          <div key={r.k} className="min-w-0">
            <dt className="text-[0.6875rem] font-medium uppercase tracking-wide text-[#8A948E]">{r.k}</dt>
            <dd className={cn("mt-0.5 break-words text-[#14201B]", r.mono && "font-mono")}>{r.v}</dd>
          </div>
        ))}
      </dl>
      {done.paymentIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {done.paymentIds.map((id, i) => (
            <a
              key={id}
              href={`/account/invoices/${id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#DDE1DB] bg-white px-3 py-1.5 text-xs font-medium text-[#24312B] hover:border-forest-400"
            >
              <AdminIcon icon="invoice" className="h-3.5 w-3.5" />
              Money receipt{done.paymentIds.length > 1 ? ` ${i + 1}` : ""}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
