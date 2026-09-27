"use client";

import { useState } from "react";
import { MembershipCard } from "@/components/ui/MembershipCard";
import { Btn, Card, ErrorNote, Field, LoadingRows, PageHeader, TextInput, Toggle, firstError, send, useAdminFetch, useToast } from "../kit";
import type { AdminPlan } from "@/lib/admin-types";
import { formatBDTCompact, stayDays } from "@/lib/shares";

type Plan = AdminPlan & { _count?: { holdings: number } };

export function PackagesTab() {
  const { data, error, loading, reload } = useAdminFetch<{ plans: Plan[] }>("/api/admin/plans");
  return (
    <>
      <PageHeader
        title="Investment packages"
        description="The membership plans from the share price chart. Changes apply to new purchases and refresh the website immediately; existing holdings keep the price and schedule they were bought on."
      />
      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows rows={6} /></Card>
      ) : (
        <div className="grid gap-4 2xl:grid-cols-2">
          {data?.plans.map((p) => <PlanEditor key={p.id} plan={p} onSaved={reload} />)}
        </div>
      )}
    </>
  );
}

function PlanEditor({ plan, onSaved }: { plan: Plan; onSaved: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({
    name: plan.name,
    subtitle: plan.subtitle,
    unitPriceBDT: String(plan.unitPriceBDT),
    fullPriceBDT: String(plan.fullPriceBDT),
    downPaymentBDT: String(plan.downPaymentBDT),
    installmentCount: String(plan.installmentCount),
    minUnits: String(plan.minUnits),
    maxUnits: plan.maxUnits === null ? "" : String(plan.maxUnits),
    stayDays: String(stayDays(plan.freeStayNights)),
    accentColor: plan.accentColor,
    featured: plan.featured,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((v) => ({ ...v, [k]: e.target.value }));

  const preview = {
    ...plan,
    name: f.name || plan.name,
    subtitle: f.subtitle,
    unitPriceBDT: Number(f.unitPriceBDT) || 0,
    fullPriceBDT: Number(f.fullPriceBDT) || 0,
    downPaymentBDT: Number(f.downPaymentBDT) || 0,
    installmentCount: Number(f.installmentCount) || 1,
    minUnits: Number(f.minUnits) || 1,
    maxUnits: f.maxUnits ? Number(f.maxUnits) : null,
    freeStayNights: Math.max(0, (Number(f.stayDays) || 1) - 1),
    featured: f.featured,
  };
  const dirty =
    preview.name !== plan.name ||
    preview.subtitle !== plan.subtitle ||
    preview.unitPriceBDT !== plan.unitPriceBDT ||
    preview.fullPriceBDT !== plan.fullPriceBDT ||
    preview.downPaymentBDT !== plan.downPaymentBDT ||
    preview.installmentCount !== plan.installmentCount ||
    preview.minUnits !== plan.minUnits ||
    preview.maxUnits !== plan.maxUnits ||
    preview.freeStayNights !== plan.freeStayNights ||
    f.accentColor !== plan.accentColor ||
    f.featured !== plan.featured;

  async function save() {
    setBusy(true);
    const { ok, json } = await send("/api/admin/plans", "PATCH", {
      id: plan.id,
      name: preview.name,
      subtitle: preview.subtitle,
      unitPriceBDT: preview.unitPriceBDT,
      fullPriceBDT: preview.fullPriceBDT,
      downPaymentBDT: preview.downPaymentBDT,
      installmentCount: preview.installmentCount,
      minUnits: preview.minUnits,
      maxUnits: preview.maxUnits,
      freeStayNights: preview.freeStayNights,
      accentColor: f.accentColor,
      featured: f.featured,
    });
    setBusy(false);
    if (!ok) {
      setErrors(json.errors ?? {});
      return toast(firstError(json), "error");
    }
    setErrors({});
    toast(`${preview.name} saved — live on the website`);
    onSaved();
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid gap-0 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#F2F4F0] to-[#E7EBE4] p-6">
          <div className="relative h-[11.1rem] w-[18rem]">
            <div className="absolute left-0 top-0 origin-top-left scale-[0.72]">
              <MembershipCard plan={preview} className="w-[25rem] sm:w-[25rem]" />
            </div>
          </div>
          <p className="text-center text-xs text-[#6B756F]">
            {plan._count?.holdings ?? 0} holding{plan._count?.holdings === 1 ? "" : "s"} ·{" "}
            {preview.minUnits} share{preview.minUnits > 1 ? "s" : ""}: {formatBDTCompact(preview.unitPriceBDT * preview.minUnits)} by installment ·{" "}
            {formatBDTCompact(preview.fullPriceBDT * preview.minUnits)} in full
          </p>
        </div>
        <div className="grid content-start gap-3 p-5 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>{(id) => <TextInput id={id} value={f.name} onChange={set("name")} />}</Field>
          <Field label="Subtitle">{(id) => <TextInput id={id} value={f.subtitle} onChange={set("subtitle")} />}</Field>
          <Field label="Installment price / share (৳)" error={errors.unitPriceBDT}>{(id) => <TextInput id={id} inputMode="numeric" value={f.unitPriceBDT} onChange={set("unitPriceBDT")} />}</Field>
          <Field label="Full-payment price / share (৳)" error={errors.fullPriceBDT}>{(id) => <TextInput id={id} inputMode="numeric" value={f.fullPriceBDT} onChange={set("fullPriceBDT")} />}</Field>
          <Field label="Down payment (৳)" hint="For the package size (min shares); prorated per share" error={errors.downPaymentBDT}>{(id) => <TextInput id={id} inputMode="numeric" value={f.downPaymentBDT} onChange={set("downPaymentBDT")} />}</Field>
          <Field label="Monthly installments" hint="After the down payment" error={errors.installmentCount}>{(id) => <TextInput id={id} inputMode="numeric" value={f.installmentCount} onChange={set("installmentCount")} />}</Field>
          <Field label="Min shares" error={errors.minUnits}>{(id) => <TextInput id={id} inputMode="numeric" value={f.minUnits} onChange={set("minUnits")} />}</Field>
          <Field label="Max shares" hint="Blank = no upper limit" error={errors.maxUnits}>{(id) => <TextInput id={id} inputMode="numeric" value={f.maxUnits} onChange={set("maxUnits")} />}</Field>
          <Field label="Free stay (days / year)" error={errors.freeStayNights}>{(id) => <TextInput id={id} inputMode="numeric" value={f.stayDays} onChange={set("stayDays")} />}</Field>
          <Field label="Accent colour" error={errors.accentColor}>
            {(id) => (
              <div className="flex gap-2">
                <input type="color" value={f.accentColor} onChange={set("accentColor")} aria-label="Pick colour" className="h-9 w-11 cursor-pointer rounded-lg border border-[#DDE1DB] bg-white p-1" />
                <TextInput id={id} value={f.accentColor} onChange={set("accentColor")} className="font-mono" />
              </div>
            )}
          </Field>
          <div className="flex items-center justify-between gap-3 pt-1 sm:col-span-2">
            <Toggle checked={f.featured} onChange={(v) => setF((x) => ({ ...x, featured: v }))} label="Mark as “Most chosen”" />
            <Btn variant="primary" onClick={save} disabled={!dirty || busy}>{busy ? "Saving…" : dirty ? "Save changes" : "Saved"}</Btn>
          </div>
        </div>
      </div>
    </Card>
  );
}
