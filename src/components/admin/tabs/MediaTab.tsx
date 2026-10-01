"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Btn, Card, Empty, ErrorNote, LoadingRows, PageHeader, Segmented, firstError, relTime, send, uploadImage, useAdminFetch, useToast } from "../kit";

type Slot = { key: string; label: string; page: string; fallback: string; url: string; custom: boolean; updatedAt: string | null };
type MediaFile = { id: string; url: string; filename: string; mimeType: string; size: number; uploadedBy: string | null; createdAt: string };

/**
 * Every image on the website that can be swapped without a deploy, plus the
 * library of everything uploaded. Replacing an image is live immediately;
 * "Restore original" puts the built-in render back.
 */
export function MediaTab() {
  const { data, error, loading, reload } = useAdminFetch<{ slots: Slot[]; files: MediaFile[] }>("/api/admin/assets");
  const [view, setView] = useState<"site" | "library">("site");
  const toast = useToast();
  const uploader = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function addToLibrary(files: FileList) {
    setUploading(true);
    let done = 0;
    for (const f of Array.from(files)) {
      const up = await uploadImage(f);
      if (up.ok) done++;
      else toast(`${f.name}: ${up.error}`, "error");
    }
    setUploading(false);
    if (done) toast(`${done} image${done > 1 ? "s" : ""} uploaded`);
    reload();
  }

  return (
    <>
      <PageHeader
        title="Media library"
        description="Replace any page image on the website, or upload photos to use in Website content (gallery, homepage banner)."
        actions={
          <>
            <input
              ref={uploader}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.length) addToLibrary(e.target.files);
                e.target.value = "";
              }}
            />
            <Btn variant="primary" icon="image" onClick={() => uploader.current?.click()} disabled={uploading}>
              {uploading ? "Uploading…" : "Upload images"}
            </Btn>
          </>
        }
      />
      <div className="mb-4">
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { value: "site", label: "Website images", count: data?.slots.length },
            { value: "library", label: "Uploaded files", count: data?.files.length },
          ]}
        />
      </div>
      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : !data ? null : view === "site" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {data.slots.map((s) => <SlotCard key={s.key} slot={s} onChanged={reload} />)}
        </div>
      ) : data.files.length === 0 ? (
        <Card><Empty icon="image" title="No uploads yet">Upload photos here, then use them in Website content → Gallery photos or the homepage banner.</Empty></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-5">
          {data.files.map((f) => <FileCard key={f.id} file={f} onChanged={reload} />)}
        </div>
      )}
    </>
  );
}

function SlotCard({ slot, onChanged }: { slot: Slot; onChanged: () => void }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function replace(file: File) {
    setBusy(true);
    const up = await uploadImage(file);
    if (!up.ok) {
      setBusy(false);
      return toast(up.error, "error");
    }
    const { ok, json } = await send("/api/admin/assets", "PATCH", { key: slot.key, url: up.url });
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    toast(`${slot.label} replaced — live now`);
    onChanged();
  }

  async function restore() {
    setBusy(true);
    const { ok, json } = await send(`/api/admin/assets?key=${encodeURIComponent(slot.key)}`, "DELETE");
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    toast(`${slot.label} restored`);
    onChanged();
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#EEF1EC]">
        <Image src={slot.url} alt={slot.label} fill sizes="22rem" unoptimized={/^https?:/.test(slot.url)} className="object-cover" />
        {slot.custom && <span className="absolute left-2 top-2 rounded-full bg-forest-700 px-2 py-0.5 text-[0.625rem] font-semibold text-white">Custom</span>}
        {busy && <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs font-medium">Saving…</div>}
      </div>
      <div className="p-4">
        <p className="text-sm font-semibold text-[#14201B]">{slot.label}</p>
        <p className="mt-0.5 truncate text-[0.6875rem] text-[#8A948E]">{slot.custom && slot.updatedAt ? `Replaced ${relTime(slot.updatedAt)}` : "Original render"}</p>
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
        <div className="mt-3 flex flex-wrap gap-2">
          <Btn size="sm" icon="image" className="flex-1" onClick={() => ref.current?.click()} disabled={busy}>Replace</Btn>
          {slot.custom && <Btn size="sm" variant="ghost" onClick={restore} disabled={busy}>Restore original</Btn>}
          <a href={slot.page} target="_blank" rel="noreferrer" className="inline-flex h-8 items-center rounded-lg border border-[#DDE1DB] bg-white px-2.5 text-xs font-medium text-[#24312B] hover:bg-[#F5F7F3]">
            View ↗
          </a>
        </div>
      </div>
    </Card>
  );
}

function FileCard({ file, onChanged }: { file: MediaFile; onChanged: () => void }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(false);

  async function copy() {
    const full = `${window.location.origin}${file.url}`;
    try {
      await navigator.clipboard.writeText(file.url);
      toast("Image link copied — paste it into any image field");
    } catch {
      toast(full);
    }
  }

  async function remove() {
    const { ok, json } = await send(`/api/admin/media/${file.id}`, "DELETE");
    setConfirm(false);
    if (!ok) return toast(firstError(json), "error");
    toast("Image deleted");
    onChanged();
  }

  return (
    <Card className="overflow-hidden">
      <a href={file.url} target="_blank" rel="noreferrer" className="relative block aspect-square bg-[#EEF1EC]">
        <Image src={file.url} alt={file.filename} fill sizes="14rem" unoptimized className="object-cover" />
      </a>
      <div className="p-3">
        <p className="truncate text-xs font-medium text-[#14201B]" title={file.filename}>{file.filename}</p>
        <p className="text-[0.625rem] text-[#8A948E]">{Math.round(file.size / 1024)} KB · {relTime(file.createdAt)}</p>
        <div className="mt-2 flex gap-1.5">
          {confirm ? (
            <>
              <Btn size="sm" variant="danger" className="flex-1" onClick={remove}>Delete</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setConfirm(false)}>Keep</Btn>
            </>
          ) : (
            <>
              <Btn size="sm" className="flex-1" onClick={copy}>Copy link</Btn>
              <Btn size="sm" variant="ghost" onClick={() => setConfirm(true)} aria-label={`Delete ${file.filename}`}>✕</Btn>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
