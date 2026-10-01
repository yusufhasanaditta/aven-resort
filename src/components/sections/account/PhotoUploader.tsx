"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { shrinkImage } from "@/lib/shrink-image";
import { cn } from "@/lib/utils";

/**
 * A round profile photo with Change / Remove. Used by shareholders on their
 * profile (endpoint /api/account/photo) and by the admin in a shareholder's
 * panel (/api/admin/customers/<id>/photo).
 */
export function PhotoUploader({
  name,
  photoUrl,
  endpoint,
  tone = "dark",
  size = "lg",
  onChanged,
}: {
  name: string;
  photoUrl: string | null;
  endpoint: string;
  tone?: "dark" | "light";
  size?: "md" | "lg";
  onChanged?: (url: string | null) => void;
}) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(photoUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const dark = tone === "dark";

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", await shrinkImage(file, 800));
      const r = await fetch(endpoint, { method: "POST", body: fd });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(json.error ?? "Upload failed.");
      setUrl(json.url);
      onChanged?.(json.url);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    await fetch(endpoint, { method: "DELETE" }).catch(() => null);
    setUrl(null);
    onChanged?.(null);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        aria-label={url ? "Change photo" : "Upload photo"}
        className={cn(
          "group relative shrink-0 overflow-hidden rounded-full ring-2 transition",
          size === "lg" ? "h-20 w-20" : "h-14 w-14",
          dark ? "bg-white/8 ring-gold-400/40 hover:ring-gold-300" : "bg-[#EEF1EC] ring-[#DDE1DB] hover:ring-forest-500",
        )}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element -- profile photo from /media
          <img src={url} alt={`${name}'s photo`} className="h-full w-full object-cover" />
        ) : (
          <span className={cn("flex h-full w-full items-center justify-center font-display text-2xl", dark ? "text-gold-300" : "text-forest-700")}>
            {initials || "?"}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-[0.625rem] font-semibold uppercase tracking-wider text-white opacity-0 transition-opacity group-hover:opacity-100">
          {busy ? "…" : "Change"}
        </span>
      </button>
      <div className="min-w-0">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={busy}
            className={cn("text-xs font-semibold hover:underline disabled:opacity-50", dark ? "text-gold-300" : "text-forest-700")}
          >
            {busy ? "Uploading…" : url ? "Change photo" : "Upload photo"}
          </button>
          {url && !busy && (
            <button type="button" onClick={remove} className={cn("text-xs hover:underline", dark ? "text-cream-200/55" : "text-[#6B756F]")}>
              Remove
            </button>
          )}
        </div>
        <p className={cn("mt-0.5 text-[0.6875rem]", dark ? "text-cream-200/40" : "text-[#8A948E]")}>JPG, PNG or WebP · shown on the membership card and profile</p>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
