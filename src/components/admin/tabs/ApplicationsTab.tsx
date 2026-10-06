"use client";

import { useMemo, useState } from "react";
import {
  Avatar,
  Btn,
  Card,
  DefinitionGrid,
  Drawer,
  Empty,
  ErrorNote,
  Field,
  TextInput,
  LoadingRows,
  PageHeader,
  SearchInput,
  Segmented,
  StatusBadge,
  TextArea,
  firstError,
  relTime,
  send,
  useAdminFetch,
  useToast,
} from "../kit";
import type { AdminApplication, ApplicationStatus } from "@/lib/admin-types";
import type { AdminNav, TabFocus } from "../AdminShell";
import { formatDate } from "@/lib/account";
import { DiscountField, NO_DISCOUNT, type DiscountValue } from "../DiscountField";
import { calculate, discountProblem, formatBDT, maxDiscountBDT, withDiscount, type PlanLike } from "@/lib/shares";

type Filter = "OPEN" | ApplicationStatus | "ALL";

export function ApplicationsTab({ focus, nav, onChanged }: { focus: TabFocus; nav: AdminNav; onChanged: () => void }) {
  const { data, error, loading, reload } = useAdminFetch<{ applications: AdminApplication[] }>("/api/admin/applications");
  const [filter, setFilter] = useState<Filter>("OPEN");
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(focus.id ?? null);

  const apps = useMemo(() => data?.applications ?? [], [data]);
  const shown = apps.filter((a) => {
    if (filter === "OPEN" && !(a.status === "SUBMITTED" || a.status === "UNDER_REVIEW")) return false;
    if (filter !== "OPEN" && filter !== "ALL" && a.status !== filter) return false;
    const n = q.trim().toLowerCase();
    return !n || [a.fullName, a.email, a.phone, a.nid].some((v) => v.toLowerCase().includes(n));
  });
  const count = (s: ApplicationStatus) => apps.filter((a) => a.status === s).length;
  const open = apps.find((a) => a.id === openId) ?? null;

  return (
    <>
      <PageHeader
        title="Share applications"
        description="Online share-purchase applications with KYC details. Approving one creates the holding and its installment schedule on the customer's account."
      />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: "OPEN", label: "To review", count: count("SUBMITTED") + count("UNDER_REVIEW") },
            { value: "APPROVED", label: "Approved", count: count("APPROVED") },
            { value: "REJECTED", label: "Rejected", count: count("REJECTED") },
            { value: "ALL", label: "All", count: apps.length },
          ]}
        />
        <SearchInput value={q} onChange={setQ} placeholder="Name, NID, phone…" className="w-60" />
      </div>

      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : shown.length === 0 ? (
        <Card>
          <Empty icon="invoice" title={filter === "OPEN" ? "Inbox zero" : "No applications here"}>
            New applications from the website&rsquo;s <strong>Apply</strong> page appear in this queue.
          </Empty>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {shown.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setOpenId(a.id)}
              className="group rounded-2xl border border-[#E6E8E3] bg-white p-5 text-left shadow-[0_1px_2px_rgba(16,24,20,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-18px_rgba(16,24,20,0.45)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar name={a.fullName} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#14201B]">{a.fullName}</p>
                    <p className="text-xs text-[#6B756F]">{a.phone}</p>
                  </div>
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-[#F5F7F3] p-3 text-xs">
                <div>
                  <p className="text-[#8A948E]">Package</p>
                  <p className="mt-0.5 font-semibold capitalize text-[#14201B]">{a.planSlug}</p>
                </div>
                <div>
                  <p className="text-[#8A948E]">Shares</p>
                  <p className="mt-0.5 font-semibold tabular-nums text-[#14201B]">{a.units}</p>
                </div>
                <div>
                  <p className="text-[#8A948E]">Quote</p>
                  <p className="mt-0.5 truncate font-semibold tabular-nums text-[#14201B]">{formatBDT(a.quotedTotalBDT)}</p>
                </div>
              </div>
              <p className="mt-3 text-[0.6875rem] text-[#8A948E]">
                {a.paymentPlan === "INSTALLMENT" ? `Down payment + ${a.installmentMonths} monthly` : "Full payment"} · submitted {relTime(a.createdAt)}
              </p>
            </button>
          ))}
        </div>
      )}

      <ApplicationDrawer
        app={open}
        onClose={() => setOpenId(null)}
        nav={nav}
        onChanged={() => {
          reload();
          onChanged();
        }}
      />
    </>
  );
}

function ApplicationDrawer({
  app,
  onClose,
  nav,
  onChanged,
}: {
  app: AdminApplication | null;
  onClose: () => void;
  nav: AdminNav;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<"approve" | "reject" | null>(null);
  const [password, setPassword] = useState("");
  const [issued, setIssued] = useState<{ memberNo: string; oneTimePassword: string | null; passwordNote: string } | null>(null);
  const [discountOpen, setDiscountOpen] = useState(false);
  const [discount, setDiscount] = useState<DiscountValue>(NO_DISCOUNT);
  const [discountError, setDiscountError] = useState<string | undefined>();
  // The chart price for this application, so the discount can be checked before approving.
  const { data: planData } = useAdminFetch<{ plans: PlanLike[] }>(confirm === "approve" ? "/api/plans" : null);
  const chart = useMemo(
    () => (app && planData?.plans?.length ? calculate(planData.plans, app.units, app.paymentPlan) : null),
    [app, planData],
  );
  const discountIssue = chart && discount.amountBDT ? discountProblem(chart, discount.amountBDT) : null;
  const priceNow = chart ? withDiscount(chart, discountIssue ? 0 : discount.amountBDT).totalBDT : app?.quotedTotalBDT ?? 0;

  async function act(action: "review" | "approve" | "reject") {
    if (!app) return;
    if (action === "approve" && discountIssue) return setDiscountError(discountIssue);
    setBusy(action);
    const approve = action === "approve";
    const { ok, json } = await send(`/api/admin/applications/${app.id}`, "PATCH", {
      action,
      adminNote: note || undefined,
      password: approve ? password : undefined,
      discountBDT: approve ? discount.amountBDT : undefined,
      discountNote: approve && discount.amountBDT ? discount.note.trim() || undefined : undefined,
    });
    setBusy(null);
    if (!ok && json.errors?.discountBDT) return setDiscountError(String(json.errors.discountBDT));
    setConfirm(null);
    if (!ok) return toast(firstError(json), "error");
    setDiscount(NO_DISCOUNT);
    setDiscountOpen(false);
    setDiscountError(undefined);
    if (json.memberNo) {
      setIssued({
        memberNo: String(json.memberNo),
        oneTimePassword: (json.oneTimePassword as string | null) ?? null,
        passwordNote: password ? `The one you set: ${password}` : "The one they chose on their application",
      });
    }
    setPassword("");
    toast(action === "approve" ? (json.memberNo ? `Approved — account ${json.memberNo} opened` : "Approved — holding created") : action === "reject" ? "Application rejected" : "Marked under review");
    setNote("");
    onChanged();
  }

  const decided = app && (app.status === "APPROVED" || app.status === "REJECTED");

  return (
    <Drawer
      open={!!app}
      onClose={onClose}
      title={app?.fullName ?? ""}
      subtitle={app && <>Submitted {formatDate(app.createdAt)} · {app.user ? `account ${app.user.email}` : "new applicant — no account yet"}</>}
      footer={
        app &&
        (decided ? (
          <div className="flex items-center justify-between">
            <p className="text-xs text-[#6B756F]">
              {app.status === "APPROVED" ? "Approved" : "Rejected"} by {app.reviewedBy} {app.reviewedAt ? relTime(app.reviewedAt) : ""}
            </p>
            {app.status === "APPROVED" && app.user && (
              <Btn variant="primary" onClick={() => nav("customers", { id: app.user!.id })}>Open customer</Btn>
            )}
          </div>
        ) : confirm ? (
          <div className="space-y-3">
          {confirm === "approve" && !app.user && (
            <Field
              label="Password for their account (optional)"
              hint={
                app.hasPassword
                  ? "They chose a password on their application — leave empty to keep it, or type one to replace it."
                  : "Type a password to give them, or leave empty for a one-time password. They can change it later."
              }
            >
              {(id) => <TextInput id={id} type="text" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />}
            </Field>
          )}
          {confirm === "approve" &&
            chart &&
            (discountOpen ? (
              <div className="rounded-xl border border-[#E3E7E1] p-3">
                <DiscountField
                  listPriceBDT={chart.totalBDT}
                  maxBDT={maxDiscountBDT(chart)}
                  value={discount}
                  onChange={(v) => { setDiscount(v); setDiscountError(undefined); }}
                  error={discountError}
                />
                <button
                  type="button"
                  onClick={() => { setDiscountOpen(false); setDiscount(NO_DISCOUNT); setDiscountError(undefined); }}
                  className="mt-2 text-xs font-medium text-[#6B756F] hover:text-red-600"
                >
                  Remove discount
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setDiscountOpen(true)} className="text-xs font-semibold text-forest-700 hover:underline">
                + Give a discount
              </button>
            ))}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-[#3D4A44]">
              {confirm === "approve"
                ? app.user
                  ? `Create a ${app.units}-share holding worth ${formatBDT(priceNow)}?`
                  : `Open ${app.fullName.split(" ")[0]}'s account and a ${app.units}-share holding (${formatBDT(priceNow)})?`
                : "Reject this application?"}
            </p>
            <div className="flex gap-2">
              <Btn onClick={() => { setConfirm(null); setDiscountOpen(false); setDiscount(NO_DISCOUNT); setDiscountError(undefined); }}>Back</Btn>
              <Btn variant={confirm === "approve" ? "primary" : "danger"} onClick={() => act(confirm)} disabled={!!busy}>
                {busy ? "Working…" : confirm === "approve" ? "Yes, approve" : "Yes, reject"}
              </Btn>
            </div>
          </div>
          </div>
        ) : (
          <div className="flex flex-wrap justify-end gap-2">
            {app.status === "SUBMITTED" && <Btn onClick={() => act("review")} disabled={!!busy}>Start review</Btn>}
            <Btn variant="danger" onClick={() => setConfirm("reject")}>Reject</Btn>
            <Btn variant="primary" onClick={() => setConfirm("approve")}>Approve</Btn>
          </div>
        ))
      }
    >
      {app && (
        <div className="space-y-5">
          {issued && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[0.8125rem] text-emerald-900" role="status">
              <p className="font-semibold">Account opened — give these to {app.fullName.split(" ")[0]}</p>
              <dl className="mt-2 grid grid-cols-[9rem_1fr] gap-y-1">
                <dt>Membership number</dt><dd className="font-mono font-semibold">{issued.memberNo}</dd>
                <dt>Sign-in</dt><dd className="font-mono">{app.email}</dd>
                {issued.oneTimePassword ? (
                  <><dt>One-time password</dt><dd className="font-mono font-semibold tracking-wider">{issued.oneTimePassword}</dd></>
                ) : (
                  <><dt>Password</dt><dd>{issued.passwordNote}</dd></>
                )}
              </dl>
              <p className="mt-2 text-xs text-emerald-800/80">
                {issued.oneTimePassword
                  ? "It’s shown only now. They’ll choose their own password at first sign-in."
                  : "They can sign in with their membership number or email, and change the password from their account."}{" "}
                The details are also emailed to them when email is set up.
              </p>
            </div>
          )}
          <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 p-5 text-white">
            <div>
              <p className="text-xs text-white/60">Applied for</p>
              <p className="mt-1 text-xl font-semibold capitalize">{app.planSlug} · {app.units} shares</p>
              <p className="mt-1 text-xs text-white/60">
                {app.paymentPlan === "INSTALLMENT" ? `Down payment + ${app.installmentMonths} monthly installments` : "Full payment"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/60">Quoted total</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{formatBDT(app.quotedTotalBDT)}</p>
              <div className="mt-1"><StatusBadge status={app.status} /></div>
            </div>
          </div>

          <Card className="p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6B756F]">Applicant (KYC)</p>
            <DefinitionGrid
              items={[
                { k: "Full name", v: app.fullName },
                { k: "Father's / husband's name", v: app.fatherName },
                { k: "NID", v: <span className="font-mono">{app.nid}</span> },
                { k: "Date of birth", v: app.dateOfBirth },
                { k: "Phone", v: app.phone },
                { k: "Email", v: app.email },
                { k: "Occupation", v: app.occupation },
                { k: "Address", v: app.address },
                { k: "Referred by", v: app.referredBy },
                { k: "Account password", v: app.user ? "Has an account" : app.hasPassword ? "Chosen by applicant" : "Not set — you give one on approval" },
              ]}
            />
          </Card>

          <Card className="p-5">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-[#6B756F]">Nominee</p>
            <DefinitionGrid
              cols={3}
              items={[
                { k: "Name", v: app.nomineeName },
                { k: "Relation", v: app.nomineeRelation },
                { k: "Phone", v: app.nomineePhone },
              ]}
            />
          </Card>

          {app.notes && (
            <Card className="p-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B756F]">Applicant&rsquo;s note</p>
              <p className="whitespace-pre-line text-[0.8125rem] text-[#3D4A44]">{app.notes}</p>
            </Card>
          )}

          {decided ? (
            app.adminNote && (
              <Card className="p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6B756F]">Review note</p>
                <p className="text-[0.8125rem] text-[#3D4A44]">{app.adminNote}</p>
              </Card>
            )
          ) : (
            <Field label="Review note (shown to the applicant on rejection)">
              {(id) => <TextArea id={id} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. NID verified in person on 26 Sep" />}
            </Field>
          )}
        </div>
      )}
    </Drawer>
  );
}
