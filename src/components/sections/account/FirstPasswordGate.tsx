"use client";

import { useRouter } from "next/navigation";
import { LogoMark } from "@/components/ui/Logo";
import { ChangePasswordForm } from "./ProfileForms";

/**
 * Shown instead of the dashboard while a shareholder is still on the
 * one-time password the Aven team gave them: they choose their own first.
 */
export function FirstPasswordGate({ name, memberId }: { name: string; memberId: string }) {
  const router = useRouter();
  return (
    <div className="relative flex min-h-[100svh] items-center justify-center bg-[#03130e] px-4 pb-16 pt-[calc(var(--header-height)+2rem)]">
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-emerald-500/12 blur-[120px]" />
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-8 text-cream-100 backdrop-blur-xl">
        <span className="block h-10 w-10"><LogoMark tone="light" /></span>
        <p className="mt-6 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-gold-400/80">Welcome · {memberId}</p>
        <h1 className="mt-2 font-display text-3xl text-cream-50">Choose your password, {name.split(" ")[0]}.</h1>
        <p className="mt-3 text-sm leading-relaxed text-cream-200/65">
          You signed in with a one-time password from the Aven team. Enter it below as your current password, then pick a new one only you know.
        </p>
        <div className="mt-6">
          <ChangePasswordForm onDone={() => router.refresh()} />
        </div>
      </div>
    </div>
  );
}
