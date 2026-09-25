"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { AdminAsset } from "@/lib/admin-types";

export function AssetsTab() {
  const [assets, setAssets] = useState<AdminAsset[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function load() {
    fetch("/api/admin/assets")
      .then((r) => r.json())
      .then((json) => (json.error ? setError(json.error) : setAssets(json.assets)))
      .catch(() => setError("Could not load site assets."));
  }

  useEffect(load, []);

  async function replaceImage(asset: AdminAsset, file: File) {
    setBusyKey(asset.key);
    setMessages((m) => ({ ...m, [asset.key]: "" }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/assets/upload", {
        method: "POST",
        body: formData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        setMessages((m) => ({ ...m, [asset.key]: uploadJson.error }));
        return;
      }

      const patchRes = await fetch("/api/admin/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: asset.key, url: uploadJson.url }),
      });
      if (patchRes.ok) {
        setMessages((m) => ({ ...m, [asset.key]: "Replaced." }));
        load();
      }
    } catch {
      setMessages((m) => ({ ...m, [asset.key]: "Upload failed. Please try again." }));
    } finally {
      setBusyKey(null);
    }
  }

  if (error) return <p className="text-sm text-gold-600">{error}</p>;
  if (!assets) return <p className="text-sm text-forest-900/50">Loading…</p>;

  return (
    <div>
      <p className="max-w-2xl text-[0.8125rem] leading-relaxed text-forest-900/55">
        Replace any of these key visuals without a code deploy. Pages that
        reference an asset key will pick up the new image immediately. On a
        self-hosted or local server this saves directly; on Vercel, connect
        Vercel Blob first (see the comment in{" "}
        <code className="rounded bg-forest-600/8 px-1 py-0.5 text-[0.7em]">
          /api/admin/assets/upload
        </code>
        ).
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <div key={asset.key} className="overflow-hidden rounded-2xl border border-forest-600/10 bg-cream-50">
            <div className="relative aspect-video">
              <Image src={asset.url} alt={asset.label} fill className="object-cover" sizes="24rem" />
            </div>
            <div className="p-4">
              <p className="text-sm font-medium text-forest-900">{asset.label}</p>
              <p className="mt-0.5 truncate text-xs text-forest-900/40">{asset.key}</p>

              <input
                ref={(el) => {
                  inputRefs.current[asset.key] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) replaceImage(asset, file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => inputRefs.current[asset.key]?.click()}
                disabled={busyKey === asset.key}
                className="mt-3 w-full rounded-full border border-forest-600/20 px-3 py-2 text-xs font-medium text-forest-700 transition-colors hover:bg-forest-600/6 disabled:opacity-50"
              >
                {busyKey === asset.key ? "Uploading…" : "Replace image"}
              </button>
              {messages[asset.key] && (
                <p className="mt-2 text-xs text-forest-900/50">{messages[asset.key]}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
