"use client";

import { useEffect, useRef, useState } from "react";
import { Field, TextInput } from "./kit";
import { formatBDT } from "@/lib/shares";
import { cn } from "@/lib/utils";

export type DiscountValue = { amountBDT: number; note: string };

export const NO_DISCOUNT: DiscountValue = { amountBDT: 0, note: "" };

/**
 * An office discount, typed in taka or as a percentage of the price, with an
 * optional reason. Always reports the discount in whole taka — the server
 * stores and checks taka, so a percentage never drifts by rounding.
 */
export function DiscountField({
  listPriceBDT,
  maxBDT,
  value,
  onChange,
  error,
}: {
  /** The chart price the discount comes off. */
  listPriceBDT: number;
  /** The largest discount allowed (see maxDiscountBDT in lib/shares). */
  maxBDT: number;
  value: DiscountValue;
  onChange: (v: DiscountValue) => void;
  error?: string;
}) {
  const [mode, setMode] = useState<"taka" | "percent">("taka");
  const [text, setText] = useState(value.amountBDT ? String(value.amountBDT) : "");

  function toTaka(raw: string, m = mode) {
    const n = Number(raw.replace(/[^0-9.]/g, "")) || 0;
    return m === "percent" ? Math.round((listPriceBDT * Math.min(n, 100)) / 100) : Math.round(n);
  }

  // A percentage follows the price: more shares, same percent, more taka off.
  const lastPrice = useRef(listPriceBDT);
  useEffect(() => {
    if (lastPrice.current === listPriceBDT) return;
    lastPrice.current = listPriceBDT;
    if (mode === "percent" && text) onChange({ ...value, amountBDT: toTaka(text) });
  });

  function onText(raw: string) {
    setText(raw);
    onChange({ ...value, amountBDT: toTaka(raw) });
  }

  function switchMode(m: "taka" | "percent") {
    if (m === mode) return;
    setMode(m);
    // Keep the same discount, shown the other way.
    const amount = value.amountBDT;
    setText(!amount ? "" : m === "percent" ? String(Math.round((amount / listPriceBDT) * 10000) / 100) : String(amount));
  }

  const tooBig = value.amountBDT > maxBDT;
  const pct = listPriceBDT ? Math.round((value.amountBDT / listPriceBDT) * 1000) / 10 : 0;

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_1.4fr]">
        <Field
          label="Discount"
          error={error ?? (tooBig ? `At most ${formatBDT(maxBDT)} on this sale.` : undefined)}
        >
          {(id) => (
            <div className="flex">
              <TextInput
                id={id}
                inputMode="decimal"
                placeholder="0"
                className="rounded-r-none font-semibold tabular-nums"
                value={text}
                onChange={(e) => onText(e.target.value)}
              />
              <div className="flex shrink-0 rounded-r-lg border border-l-0 border-[#DDE1DB] bg-[#F5F7F3] p-0.5" role="radiogroup" aria-label="Discount in">
                {(["taka", "percent"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    onClick={() => switchMode(m)}
                    className={cn(
                      "w-8 rounded-md text-xs font-semibold transition-colors",
                      mode === m ? "bg-white text-forest-800 shadow-sm" : "text-[#6B756F] hover:text-[#14201B]",
                    )}
                  >
                    {m === "taka" ? "৳" : "%"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Field>
        <Field label="Reason (optional)">
          {(id) => (
            <TextInput
              id={id}
              maxLength={200}
              placeholder="e.g. Early-bird offer, referral, management approval"
              value={value.note}
              onChange={(e) => onChange({ ...value, note: e.target.value })}
            />
          )}
        </Field>
      </div>
      {value.amountBDT > 0 && !tooBig && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
          <span className="tabular-nums line-through decoration-emerald-900/40">{formatBDT(listPriceBDT)}</span>
          {" − "}
          <span className="font-semibold tabular-nums">{formatBDT(value.amountBDT)}</span>
          {mode === "taka" && <span className="text-emerald-800/70"> ({pct}%)</span>}
          {" = "}
          <span className="font-semibold tabular-nums">{formatBDT(listPriceBDT - value.amountBDT)}</span> to pay
        </p>
      )}
    </div>
  );
}
