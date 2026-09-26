"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Btn, Card, ErrorNote, LoadingRows, PageHeader, relTime, useAdminFetch, useToast } from "../kit";
import type { AdminAsset } from "@/lib/admin-types";

const PAGE_LINK: Record<string, string> = {
  "wellness.hero": "/wellness",
  "ownership.hero": "/ownership",
  "amenities.hero": "/amenities",
  "accommodations.hero": "/accommodations",
};

/** Page hero images. Uploading replaces the image on the live page right away. */
export function MediaTab() {
  const { data, error, loading, reload } = useAdminFetch<{ assets: AdminAsset[] }>("/api/admin/assets");
  return (
    <>
      <PageHeader
        title="Media library"
        description="Replace each page's hero image. The homepage banner lives under Website content with its headline."
      />
      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data?.assets.map((a) => <AssetCard key={a.key} asset={a} onChanged={reload} />)}
        </div>
      )}
      <p className="mt-6 max-w-2xl text-xs leading-relaxed text-[#8A948E]">
        Uploads are saved to the server&rsquo;s <code>/public/uploads</code> folder. On Vercel the filesystem is read-only —
        connect Vercel Blob (see <code>src/app/api/admin/assets/upload/route.ts</code>) before relying on uploads in production.
      </p>
    </>
  );
}

function AssetCard({ asset, onChanged }: { asset: AdminAsset; onChanged: () => void }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function replace(file: File) {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await fetch("/api/admin/assets/upload", { method: "POST", body: fd });
      const upJson = await up.json();
      if (!up.ok) return toast(upJson.error ?? "Upload failed.", "error");
      const patch = await fetch("/api/admin/assets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: asset.key, url: upJson.url }),
      });
      if (!patch.ok) return toast("Could not save the new image.", "error");
      toast(`${asset.label} replaced — live now`);
      onChanged();
    } catch {
      toast("Upload failed. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#EEF1EC]">
        <Image src={asset.url} alt={asset.label} fill sizes="22rem" unoptimized={/^https?:/.test(asset.url)} className="object-cover" />
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium">Uploading…</div>}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-[#14201B]">{asset.label}</p>
        <p className="mt-0.5 truncate text-[0.6875rem] text-[#8A948E]">Updated {relTime(asset.updatedAt)}</p>
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) replace(f);
            e.target.value = "";
          }}
        />
        <div className="mt-3 flex gap-2">
          <Btn size="sm" icon="image" className="flex-1" onClick={() => ref.current?.click()} disabled={busy}>Replace</Btn>
          {PAGE_LINK[asset.key] && (
            <a href={PAGE_LINK[asset.key]} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-lg border border-[#DDE1DB] bg-white px-2.5 text-xs font-medium text-[#24312B] hover:bg-[#F5F7F3]">
              View ↗
            </a>
          )}
        </div>
      </div>
    </Card>
  );
}
