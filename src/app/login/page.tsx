"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/ui/Section";
import { Logo } from "@/components/ui/Logo";
import { Field, fieldInputClass } from "@/components/ui/Field";
import { ButtonAction } from "@/components/ui/Button";
import { easeOutExpo } from "@/lib/motion";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        setErrors(json.errors ?? { form: json.error ?? "Something went wrong." });
        setSubmitting(false);
        return;
      }

      const next = params.get("next") || (json.role === "ADMIN" ? "/admin" : "/account");
      router.push(next);
      router.refresh();
    } catch {
      setErrors({ form: "Could not reach the server. Please try again." });
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
      <Field id="email" label="Email address" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldInputClass(errors.email)}
        />
      </Field>

      <Field id="password" label="Password" error={errors.password}>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your password"
          className={fieldInputClass(errors.password)}
        />
      </Field>

      {errors.form && (
        <p className="rounded-xl bg-gold-500/12 px-4 py-3 text-[0.8125rem] text-gold-600" role="alert">
          {errors.form}
        </p>
      )}

      <ButtonAction type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Signing in…" : "Sign in"}
      </ButtonAction>

      <p className="text-center text-xs text-forest-900/45">
        New to AVEN?{" "}
        <Link href="/register" className="font-medium text-forest-700 hover:underline">
          Create a shareholder account
        </Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-forest-950">
      <div className="absolute inset-0">
        <Image
          src="/renders/hotel-facade.jpg"
          alt=""
          fill
          className="object-cover opacity-30"
          sizes="100vw"
          priority
        />
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
          <p className="mt-6 text-eyebrow text-forest-600/60">Welcome back</p>
          <h1 className="mt-2 font-display text-display-sm text-forest-900">
            Sign in
          </h1>
          <p className="mt-2 text-[0.8125rem] leading-relaxed text-forest-900/55">
            Access your shareholder account to view holdings, payments and
            instalments.
          </p>

          <Suspense>
            <LoginForm />
          </Suspense>
        </motion.div>
      </Container>
    </section>
  );
}
