"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/ui/Logo";
import { Field, fieldInputClass } from "@/components/ui/Field";
import { ButtonAction } from "@/components/ui/Button";
import { easeOutExpo } from "@/lib/motion";

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, json };
  } catch {
    return { ok: false, json: { errors: { form: "Could not reach the server. Please try again." } } };
  }
}

/** Step 1: email → a 6-digit code is sent. Step 2: code + new password → signed in. */
function ResetFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [step, setStep] = useState<"email" | "code">(params.get("email") ? "code" : "email");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [resent, setResent] = useState(false);

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setErrors({});
    const { ok, json } = await post("/api/auth/forgot", { email });
    setBusy(false);
    if (!ok) return setErrors(json.errors ?? { form: json.error ?? "Something went wrong." });
    if (step === "code") setResent(true);
    setStep("code");
  }

  async function reset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    if (data.password !== data.confirm) return setErrors({ confirm: "The two passwords don't match." });
    setBusy(true);
    setErrors({});
    const { ok, json } = await post("/api/auth/reset", { email, code: data.code, password: data.password });
    if (!ok) {
      setBusy(false);
      return setErrors(json.errors ?? { form: json.error ?? "Something went wrong." });
    }
    router.push(json.role === "ADMIN" ? "/admin" : "/account?tab=profile");
    router.refresh();
  }

  if (step === "email") {
    return (
      <form onSubmit={sendCode} className="mt-8 space-y-5" noValidate>
        <Field id="email" label="Email address" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInputClass(errors.email)}
          />
        </Field>
        {errors.form && <p className="rounded-xl bg-gold-500/12 px-4 py-3 text-[0.8125rem] text-gold-600" role="alert">{errors.form}</p>}
        <ButtonAction type="submit" size="lg" disabled={busy || !email} className="w-full">
          {busy ? "Sending code…" : "Email me a code"}
        </ButtonAction>
        <p className="text-center text-xs text-forest-900/45">
          Remembered it?{" "}
          <Link href="/login" className="font-medium text-forest-700 hover:underline">Back to sign in</Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={reset} className="mt-8 space-y-5" noValidate>
      <p className="rounded-xl bg-forest-600/8 px-4 py-3 text-[0.8125rem] leading-relaxed text-forest-800" role="status">
        {resent ? "A new code is on its way" : "If an account exists for"} <strong className="font-semibold">{email}</strong>
        {resent ? "." : ", we've emailed it a 6-digit code. It expires in 15 minutes."}
      </p>
      <Field id="code" label="6-digit code" error={errors.code}>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          className={`${fieldInputClass(errors.code)} text-center font-mono text-xl tracking-[0.5em]`}
        />
      </Field>
      <Field id="password" label="New password" error={errors.password}>
        <input id="password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters, a letter and a number" className={fieldInputClass(errors.password)} />
      </Field>
      <Field id="confirm" label="Confirm new password" error={errors.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" className={fieldInputClass(errors.confirm)} />
      </Field>
      {errors.form && <p className="rounded-xl bg-gold-500/12 px-4 py-3 text-[0.8125rem] text-gold-600" role="alert">{errors.form}</p>}
      <ButtonAction type="submit" size="lg" disabled={busy} className="w-full">
        {busy ? "Saving…" : "Set new password"}
      </ButtonAction>
      <div className="flex items-center justify-between text-xs">
        <button type="button" onClick={() => { setStep("email"); setErrors({}); setResent(false); }} className="font-medium text-forest-700 hover:underline">
          Use a different email
        </button>
        <button type="button" onClick={() => sendCode()} disabled={busy} className="font-medium text-forest-700 hover:underline disabled:opacity-50">
          Resend code
        </button>
      </div>
    </form>
  );
}

export default function ForgotPasswordPage() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-forest-950">
      <div className="absolute inset-0">
        <Image src="/renders/hotel-facade.jpg" alt="" fill className="object-cover opacity-30" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/70 to-forest-950" />
      </div>
      <Container className="relative z-10 py-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: easeOutExpo }}
          className="mx-auto w-full max-w-md rounded-3xl bg-cream-100 p-8 shadow-float sm:p-10"
        >
          <Logo />
          <p className="mt-6 text-eyebrow text-forest-600/60">Account recovery</p>
          <h1 className="mt-2 font-display text-display-sm text-forest-900">Forgot password</h1>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/55">
            Enter your account email and we&rsquo;ll send you a one-time code to set a new password.
          </p>
          <Suspense>
            <ResetFlow />
          </Suspense>
        </motion.div>
      </Container>
    </section>
  );
}
