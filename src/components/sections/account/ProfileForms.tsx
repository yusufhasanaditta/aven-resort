"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

const styles = {
  dark: {
    label: "text-[0.6875rem] text-cream-200/55",
    input: "border-white/12 bg-white/[0.04] text-cream-50 focus:border-gold-300/60",
    error: "text-red-300",
    ok: "text-emerald-300",
    primary: "bg-gold-400 text-forest-950 hover:bg-gold-300",
    secondary: "border border-white/15 text-cream-100 hover:bg-white/8",
  },
  light: {
    label: "text-xs font-medium text-[#3D4A44]",
    input: "border-[#DDE1DB] bg-white text-[#14201B] focus:border-forest-600",
    error: "text-red-600",
    ok: "text-emerald-700",
    primary: "bg-forest-700 text-white hover:bg-forest-800",
    secondary: "border border-[#DDE1DB] bg-white text-[#24312B] hover:bg-[#F5F7F3]",
  },
};

function Input({
  label,
  error,
  tone,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; tone: Tone }) {
  const s = styles[tone];
  return (
    <label className="block">
      <span className={s.label}>{label}</span>
      <input
        {...rest}
        aria-invalid={!!error}
        className={cn("mt-1.5 h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors", s.input)}
      />
      {error && <span className={cn("mt-1 block text-xs", s.error)}>{error}</span>}
    </label>
  );
}

async function submit(url: string, method: "PATCH" | "POST", body: unknown) {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, error: json.error as string | undefined, errors: (json.errors ?? {}) as Record<string, string> };
  } catch {
    return { ok: false, error: "Could not reach the server. Please try again.", errors: {} };
  }
}

/** Edit name, phone and location. Email is the sign-in, so it stays fixed. */
export function EditProfileForm({
  initial,
  onDone,
  tone = "dark",
}: {
  initial: { name: string; phone: string; location: string };
  onDone: () => void;
  tone?: Tone;
}) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const s = styles[tone];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const r = await submit("/api/account/me", "PATCH", f);
    setBusy(false);
    setErrors(r.errors);
    setError(r.ok ? undefined : r.error);
    if (r.ok) {
      router.refresh();
      onDone();
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Input tone={tone} label="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} error={errors.name} autoComplete="name" required />
      <Input tone={tone} label="Phone" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} error={errors.phone} autoComplete="tel" required />
      <Input tone={tone} label="Location" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} error={errors.location} required />
      {error && <p className={cn("text-xs", s.error)}>{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={busy} className={cn("h-10 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-60", s.primary)}>
          {busy ? "Saving…" : "Save changes"}
        </button>
        <button type="button" onClick={onDone} className={cn("h-10 rounded-full px-5 text-sm font-medium transition-colors", s.secondary)}>
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Change password — used on the shareholder profile and in the admin console. */
export function ChangePasswordForm({ tone = "dark", onDone }: { tone?: Tone; onDone?: () => void }) {
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string>();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const s = styles[tone];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setDone(false);
    if (f.newPassword !== f.confirm) return setErrors({ confirm: "The two passwords don't match." });
    setBusy(true);
    const r = await submit("/api/account/password", "POST", { currentPassword: f.currentPassword, newPassword: f.newPassword });
    setBusy(false);
    setErrors(r.errors);
    setError(r.ok ? undefined : r.error);
    if (r.ok) {
      setF({ currentPassword: "", newPassword: "", confirm: "" });
      setDone(true);
      onDone?.();
    }
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <Input tone={tone} type="password" label="Current password" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} error={errors.currentPassword} autoComplete="current-password" required />
      <Input tone={tone} type="password" label="New password" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} error={errors.newPassword} autoComplete="new-password" required />
      <Input tone={tone} type="password" label="Confirm new password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={errors.confirm} autoComplete="new-password" required />
      <p className={s.label}>At least 8 characters, with a letter and a number.</p>
      {error && <p className={cn("text-xs", s.error)}>{error}</p>}
      {done && <p role="status" className={cn("text-xs font-medium", s.ok)}>Password changed.</p>}
      <button type="submit" disabled={busy} className={cn("h-10 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-60", s.primary)}>
        {busy ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
