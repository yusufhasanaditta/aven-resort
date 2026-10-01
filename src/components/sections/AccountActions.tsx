"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonAction } from "@/components/ui/Button";

export function LogoutButton({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <ButtonAction
      variant={tone === "light" ? "ghost-light" : "ghost"}
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </ButtonAction>
  );
}

/** Starts the next due payment on a holding — an installment, or a retry of a full payment. */
export function PayNextButton({
  holdingId,
  label = "Pay next installment",
  tone = "dark",
  className,
}: {
  holdingId: string;
  label?: string;
  /** "light" for use on dark surfaces, like the shareholder dashboard. */
  tone?: "dark" | "light";
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const res = await fetch(`/api/shares/${holdingId}/pay-next`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not start payment.");
        setBusy(false);
        return;
      }
      if (json.gatewayUrl) {
        window.location.href = json.gatewayUrl;
        return;
      }
      setNotice(json.notice ?? "Recorded.");
      router.refresh();
      setBusy(false);
    } catch {
      setError("Could not reach the server. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div>
      <ButtonAction
        size="sm"
        variant={tone === "light" ? "light" : "primary"}
        disabled={busy}
        onClick={pay}
        className={className}
      >
        {busy ? "Starting payment…" : label}
      </ButtonAction>
      {notice && (
        <p className={tone === "light" ? "mt-2 text-xs text-cream-200/75" : "mt-2 text-xs text-forest-700"}>{notice}</p>
      )}
      {error && (
        <p className={tone === "light" ? "mt-2 text-xs text-gold-300" : "mt-2 text-xs text-gold-600"}>{error}</p>
      )}
    </div>
  );
}

/** Withdraws a reservation nothing has been paid on yet — asks once before doing it. */
export function CancelReservationButton({ holdingId }: { holdingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/shares/${holdingId}/cancel`, { method: "POST" }).catch(() => null);
    const json = res ? await res.json().catch(() => ({})) : {};
    setBusy(false);
    if (!res?.ok) return setError(json.error ?? "Could not cancel. Please try again.");
    setConfirming(false);
    router.refresh();
  }

  if (!confirming) {
    return (
      <ButtonAction size="sm" variant="ghost-light" onClick={() => setConfirming(true)}>
        Cancel reservation
      </ButtonAction>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full bg-white/5 py-1 pl-4 pr-1">
      <span className="text-xs text-cream-100">Cancel these shares?</span>
      <ButtonAction size="sm" variant="ghost-light" onClick={() => setConfirming(false)} disabled={busy}>
        Keep
      </ButtonAction>
      <ButtonAction size="sm" variant="light" onClick={cancel} disabled={busy}>
        {busy ? "Cancelling…" : "Yes, cancel"}
      </ButtonAction>
      {error && <p className="w-full pb-1 text-xs text-gold-300">{error}</p>}
    </div>
  );
}
