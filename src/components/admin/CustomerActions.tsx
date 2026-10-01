"use client";

import { useEffect, useMemo, useState } from "react";
import { Btn, Field, Modal, Segmented, SelectInput, TextArea, TextInput, firstError, send, useToast } from "./kit";
import { calculate, formatBDT, stayDays, type PlanLike } from "@/lib/shares";

type Errors = Record<string, string>;
type Person = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  nid?: string | null;
  nomineeName?: string | null;
  nomineeRelation?: string | null;
  referredBy?: string | null;
};

const NO_KYC = { nid: "", nomineeName: "", nomineeRelation: "", referredBy: "" };

/** NID, nominee and referral — the same fields on "Add a shareholder" and "Edit details". */
function KycFields({ bind, errors }: { bind: (k: keyof typeof NO_KYC) => { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void }; errors: Errors }) {
  return (
    <>
      <Field label="NID number" error={errors.nid}>{(id) => <TextInput id={id} inputMode="numeric" {...bind("nid")} />}</Field>
      <Field label="Referred by (optional)" error={errors.referredBy}>{(id) => <TextInput id={id} placeholder="Who introduced them" {...bind("referredBy")} />}</Field>
      <Field label="Nominee name" error={errors.nomineeName}>{(id) => <TextInput id={id} {...bind("nomineeName")} />}</Field>
      <Field label="Nominee relation" error={errors.nomineeRelation}>{(id) => <TextInput id={id} placeholder="e.g. Wife, Son" {...bind("nomineeRelation")} />}</Field>
    </>
  );
}

function useForm<T extends Record<string, string>>(initial: T) {
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const bind = (k: keyof T & string) => ({ value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }) });
  return { f, setF, errors, setErrors, busy, setBusy, bind };
}

function FormError({ errors }: { errors: Errors }) {
  const msg = errors.form ?? errors.error;
  return msg ? <p className="text-xs text-red-600">{msg}</p> : null;
}

/** The sign-in details to hand a shareholder — shown once, right after they're issued. */
export function CredentialsNote({ memberNo, email, oneTimePassword }: { memberNo?: string; email: string; oneTimePassword: string | null }) {
  const toast = useToast();
  const text = [memberNo && `Membership number: ${memberNo}`, `Sign in: ${email}`, oneTimePassword && `One-time password: ${oneTimePassword}`].filter(Boolean).join("\n");
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-[0.8125rem] text-emerald-900" role="status">
      <dl className="grid grid-cols-[9.5rem_1fr] gap-y-1.5">
        {memberNo && (<><dt>Membership number</dt><dd className="font-mono font-semibold">{memberNo}</dd></>)}
        <dt>Signs in with</dt><dd className="break-all font-mono">{email}</dd>
        {oneTimePassword && (<><dt>One-time password</dt><dd className="font-mono text-base font-semibold tracking-wider">{oneTimePassword}</dd></>)}
      </dl>
      {oneTimePassword && (
        <p className="mt-2 text-xs text-emerald-800/80">
          Shown only now. They choose their own password right after signing in with it. It&rsquo;s also emailed to them once email is set up.
        </p>
      )}
      <Btn size="sm" className="mt-3" onClick={() => navigator.clipboard?.writeText(text).then(() => toast("Copied — paste it into a WhatsApp or SMS"), () => toast(text))}>
        Copy details
      </Btn>
    </div>
  );
}

/** Opens a shareholder account — the only way accounts are created. It gets the next membership number. */
export function AddShareholderModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (id: string) => void }) {
  const { f, errors, setErrors, busy, setBusy, bind, setF } = useForm({ name: "", email: "", phone: "", location: "", ...NO_KYC, password: "" });
  const [created, setCreated] = useState<{ id: string; memberNo: string; email: string; oneTimePassword: string | null } | null>(null);

  async function save() {
    setBusy(true);
    const { ok, json } = await send("/api/admin/customers", "POST", f);
    setBusy(false);
    if (!ok) return setErrors(json.errors ?? { form: firstError(json) });
    setCreated({ id: String(json.id), memberNo: String(json.memberNo), email: f.email.trim().toLowerCase(), oneTimePassword: (json.oneTimePassword as string | null) ?? null });
    setF({ name: "", email: "", phone: "", location: "", ...NO_KYC, password: "" });
    setErrors({});
  }

  function finish() {
    const id = created?.id;
    setCreated(null);
    if (id) onCreated(id);
    else onClose();
  }

  return (
    <Modal
      open={open}
      onClose={finish}
      title={created ? "Account opened" : "Add a shareholder"}
      footer={
        created ? (
          <Btn variant="primary" onClick={finish}>Open their profile</Btn>
        ) : (
          <>
            <Btn onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={busy}>{busy ? "Creating…" : "Create account"}</Btn>
          </>
        )
      }
    >
      {created ? (
        <CredentialsNote memberNo={created.memberNo} email={created.email} oneTimePassword={created.oneTimePassword} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name}>{(id) => <TextInput id={id} {...bind("name")} />}</Field>
            <Field label="Email" error={errors.email}>{(id) => <TextInput id={id} type="email" {...bind("email")} />}</Field>
            <Field label="Phone" error={errors.phone}>{(id) => <TextInput id={id} {...bind("phone")} />}</Field>
            <Field label="Location" error={errors.location}>{(id) => <TextInput id={id} {...bind("location")} />}</Field>
            <KycFields bind={bind} errors={errors} />
            <Field label="Password (optional)" hint="Leave empty to get a one-time password to give them — they pick their own at first sign-in." error={errors.password} className="sm:col-span-2">
              {(id) => <TextInput id={id} type="text" autoComplete="off" {...bind("password")} />}
            </Field>
          </div>
          <p className="mt-3 text-xs text-[#6B756F]">The account gets the next membership number automatically (e.g. 20262001).</p>
          <div className="mt-3"><FormError errors={errors} /></div>
        </>
      )}
    </Modal>
  );
}

/** Corrects a shareholder's name, email, phone or location. */
export function EditCustomerModal({ person, onClose, onSaved }: { person: Person | null; onClose: () => void; onSaved: () => void }) {
  const toast = useToast();
  const { f, errors, setErrors, busy, setBusy, bind } = useForm({
    name: person?.name ?? "",
    email: person?.email ?? "",
    phone: person?.phone ?? "",
    location: person?.location ?? "",
    nid: person?.nid ?? "",
    nomineeName: person?.nomineeName ?? "",
    nomineeRelation: person?.nomineeRelation ?? "",
    referredBy: person?.referredBy ?? "",
  });

  async function save() {
    if (!person) return;
    setBusy(true);
    const { ok, json } = await send(`/api/admin/customers/${person.id}`, "PATCH", f);
    setBusy(false);
    if (!ok) return setErrors(json.errors ?? { form: firstError(json) });
    toast("Details saved");
    onSaved();
    onClose();
  }

  return (
    <Modal
      open={!!person}
      onClose={onClose}
      title="Edit shareholder details"
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Btn>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.name}>{(id) => <TextInput id={id} {...bind("name")} />}</Field>
        <Field label="Email (their sign-in)" error={errors.email}>{(id) => <TextInput id={id} type="email" {...bind("email")} />}</Field>
        <Field label="Phone" error={errors.phone}>{(id) => <TextInput id={id} {...bind("phone")} />}</Field>
        <Field label="Location" error={errors.location}>{(id) => <TextInput id={id} {...bind("location")} />}</Field>
        <KycFields bind={bind} errors={errors} />
      </div>
      <div className="mt-3"><FormError errors={errors} /></div>
    </Modal>
  );
}

/** A message to one shareholder, or to everyone — delivered to the dashboard bell and by email. */
export function MessageModal({
  to,
  onClose,
}: {
  /** A shareholder, or "all" for every shareholder. */
  to: Person | "all" | null;
  onClose: () => void;
}) {
  const toast = useToast();
  const { f, errors, setErrors, busy, setBusy, bind, setF } = useForm({ title: "", body: "", href: "" });
  const [audience, setAudience] = useState<"all" | "holders">("all");
  const all = to === "all";

  async function sendIt() {
    if (!to) return;
    setBusy(true);
    const { ok, json } = all
      ? await send("/api/admin/messages", "POST", { ...f, audience })
      : await send(`/api/admin/customers/${to.id}/message`, "POST", f);
    setBusy(false);
    if (!ok) return setErrors(json.errors ?? { form: firstError(json) });
    toast(all ? `Message sent to ${json.recipients} shareholders` : `Message sent to ${(to as Person).name}`);
    setF({ title: "", body: "", href: "" });
    setErrors({});
    onClose();
  }

  return (
    <Modal
      open={!!to}
      onClose={onClose}
      title={all ? "Message all shareholders" : `Message ${(to as Person | null)?.name ?? ""}`}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" icon="mail" onClick={sendIt} disabled={busy}>{busy ? "Sending…" : "Send message"}</Btn>
        </>
      }
    >
      <div className="space-y-4">
        {all && (
          <Segmented
            value={audience}
            onChange={setAudience}
            options={[
              { value: "all", label: "Every account" },
              { value: "holders", label: "Only those holding shares" },
            ]}
          />
        )}
        <Field label="Subject" error={errors.title}>{(id) => <TextInput id={id} {...bind("title")} placeholder="e.g. Site visit this Friday" />}</Field>
        <Field label="Message" error={errors.body}>{(id) => <TextArea id={id} rows={5} {...bind("body")} />}</Field>
        <Field label="Link (optional)" hint="Where the button in the email and the bell goes, e.g. /account?tab=holdings" error={errors.href}>
          {(id) => <TextInput id={id} {...bind("href")} placeholder="/account" />}
        </Field>
        <p className="text-xs text-[#6B756F]">Shows in the shareholder&rsquo;s dashboard notifications and is emailed to them.</p>
        <FormError errors={errors} />
      </div>
    </Modal>
  );
}

/** Helps a shareholder who can't sign in: a one-time password to give them, an emailed reset code, or a password you choose. */
export function PasswordHelpModal({ person, onClose }: { person: Person | null; onClose: () => void }) {
  const toast = useToast();
  const [mode, setMode] = useState<"one-time" | "email-code" | "set">("one-time");
  const [issued, setIssued] = useState<string | null>(null);
  const { f, errors, setErrors, busy, setBusy, bind, setF } = useForm({ password: "" });

  async function go() {
    if (!person) return;
    setBusy(true);
    const { ok, json } = await send(`/api/admin/customers/${person.id}/password`, "POST", mode === "set" ? { mode, password: f.password } : { mode });
    setBusy(false);
    if (!ok) return setErrors(json.errors ?? { form: firstError(json) });
    setF({ password: "" });
    setErrors({});
    if (mode === "one-time") return setIssued(String(json.oneTimePassword));
    toast(mode === "set" ? `New password set for ${person.name}` : `Reset code emailed to ${person.email}`);
    onClose();
  }

  function close() {
    setIssued(null);
    onClose();
  }

  return (
    <Modal
      open={!!person}
      onClose={close}
      title={issued ? "One-time password issued" : "Password help"}
      footer={
        issued ? (
          <Btn variant="primary" onClick={close}>Done</Btn>
        ) : (
          <>
            <Btn onClick={close}>Cancel</Btn>
            <Btn variant="primary" onClick={go} disabled={busy}>
              {busy ? "Working…" : mode === "one-time" ? "Create one-time password" : mode === "set" ? "Set password" : "Email reset code"}
            </Btn>
          </>
        )
      }
    >
      {issued && person ? (
        <CredentialsNote email={person.email} oneTimePassword={issued} />
      ) : (
        <div className="space-y-4">
          <Segmented
            value={mode}
            onChange={setMode}
            options={[
              { value: "one-time", label: "One-time password" },
              { value: "email-code", label: "Email a code" },
              { value: "set", label: "Set a password" },
            ]}
          />
          {mode === "one-time" ? (
            <p className="text-sm text-[#3D4A44]">
              Creates a new password you give {person?.name.split(" ")[0]} (by phone, SMS or WhatsApp). It works once — right after
              signing in they&rsquo;re asked to choose their own. Their old password stops working.
            </p>
          ) : mode === "email-code" ? (
            <p className="text-sm text-[#3D4A44]">
              {person?.name} gets a 6-digit code at <strong>{person?.email}</strong> to choose a new password on the Forgot password page. Needs email to be set up.
            </p>
          ) : (
            <Field label="New password" hint="At least 8 characters, with a letter and a number." error={errors.password}>
              {(id) => <TextInput id={id} type="text" autoComplete="off" {...bind("password")} />}
            </Field>
          )}
          <FormError errors={errors} />
        </div>
      )}
    </Modal>
  );
}

/** Reserves shares in a shareholder's name, priced exactly as the website prices them. */
export function AllocateSharesModal({ person, onClose, onDone }: { person: Person | null; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [plans, setPlans] = useState<(PlanLike & { name: string })[]>([]);
  const [units, setUnits] = useState(1);
  const [paymentPlan, setPaymentPlan] = useState<"FULL" | "INSTALLMENT">("INSTALLMENT");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!person || plans.length) return;
    fetch("/api/plans").then((r) => r.json()).then((j) => setPlans(j.plans ?? [])).catch(() => setError("Could not load the plans."));
  }, [person, plans.length]);

  const result = useMemo(() => (plans.length ? calculate(plans, units, paymentPlan) : null), [plans, units, paymentPlan]);

  async function save() {
    if (!person) return;
    setBusy(true);
    setError(null);
    const { ok, json } = await send("/api/admin/holdings", "POST", { userId: person.id, units, paymentPlan });
    setBusy(false);
    if (!ok) return setError(firstError(json));
    toast(`${units} share${units > 1 ? "s" : ""} allocated to ${person.name}`);
    onDone();
    onClose();
  }

  return (
    <Modal
      open={!!person}
      onClose={onClose}
      title={`Allocate shares${person ? ` — ${person.name}` : ""}`}
      footer={
        <>
          <Btn onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" onClick={save} disabled={busy || !result}>{busy ? "Allocating…" : "Allocate shares"}</Btn>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Number of shares">
            {(id) => <TextInput id={id} type="number" min={1} max={2700} value={units} onChange={(e) => setUnits(Math.max(1, Math.min(2700, Number(e.target.value) || 1)))} />}
          </Field>
          <Field label="Payment">
            {(id) => (
              <SelectInput id={id} value={paymentPlan} onChange={(e) => setPaymentPlan(e.target.value as "FULL" | "INSTALLMENT")}>
                <option value="INSTALLMENT">Installments (down payment + monthly)</option>
                <option value="FULL">Pay in full</option>
              </SelectInput>
            )}
          </Field>
        </div>
        {result && (
          <dl className="space-y-1.5 rounded-xl bg-[#F5F7F3] p-4 text-[0.8125rem]">
            <div className="flex justify-between"><dt className="text-[#6B756F]">Plan</dt><dd className="font-medium">{result.plan.name} · {stayDays(result.freeStayNights)} free days / yr</dd></div>
            <div className="flex justify-between"><dt className="text-[#6B756F]">Total</dt><dd className="font-semibold tabular-nums">{formatBDT(result.totalBDT)}</dd></div>
            {result.installments && (
              <div className="flex justify-between">
                <dt className="text-[#6B756F]">Schedule</dt>
                <dd className="tabular-nums">{formatBDT(result.downPaymentBDT ?? 0)} down + {result.monthlyCount} × ~{formatBDT(result.monthlyBDT ?? 0)}</dd>
              </div>
            )}
          </dl>
        )}
        <p className="text-xs text-[#6B756F]">The holding appears in their dashboard with its payment schedule, and they&rsquo;re notified. Record payments against it as they come in.</p>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
