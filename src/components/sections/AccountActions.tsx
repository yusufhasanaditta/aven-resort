"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonAction } from "@/components/ui/Button";

export function LogoutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <ButtonAction
      variant="ghost"
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

/** Starts the next due payment on a holding — an instalment, or a retry of a full payment. */
export function PayNextButton({
  holdingId,
  label = "Pay next instalment",
}: {
  holdingId: string;
  label?: string;
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
      <ButtonAction size="sm" disabled={busy} onClick={pay}>
        {busy ? "Starting payment…" : label}
      </ButtonAction>
      {notice && <p className="mt-2 text-xs text-forest-700">{notice}</p>}
      {error && <p className="mt-2 text-xs text-gold-600">{error}</p>}
    </div>
  );
}
