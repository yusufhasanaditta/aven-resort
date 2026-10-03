"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { installEdits, type SiteEditMap } from "@/jsx/edits";
import { uploadImage } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

/**
 * The page editor, for admins on the public website: "Edit page", then click
 * any text to rewrite it or any image to replace it. A change is saved as
 * "this text → that text" (or image → image) and applies wherever that exact
 * text or image appears on the site, for every visitor, at once. Every change
 * is listed — and can be undone — in admin → Page editor.
 */

const EDITOR = "[data-aven-editor]";

/**
 * A text node, or — for text a component cuts into pieces (an animated title
 * split into words) — the element marked `data-edit-text` with the whole of it.
 */
type Picked = { kind: "text"; node: Text; whole: Element | null } | { kind: "image"; node: HTMLImageElement };

type Target =
  | { kind: "text"; original: string; current: string; count: number; whole: boolean }
  | { kind: "image"; original: string; current: string; count: number };

type Selection = { picked: Picked; target: Target; id: number };

const edits = (): SiteEditMap => globalThis.__avenEdits ?? { text: {}, images: {} };

/** What a piece of text or image was before it was edited (itself if it never was). */
function originalOf(map: Record<string, string>, current: string) {
  for (const [original, value] of Object.entries(map)) if (value === current) return original;
  return current;
}

function inEditor(node: Node | null) {
  const el = node instanceof Element ? node : node?.parentElement;
  return !!el?.closest(EDITOR);
}

function pageTextNodes(): Text[] {
  const out: Text[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => {
      const parent = n.parentElement;
      if (!parent || parent.closest(`script,style,noscript,${EDITOR}`)) return NodeFilter.FILTER_REJECT;
      return n.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
    },
  });
  while (walker.nextNode()) out.push(walker.currentNode as Text);
  return out;
}

/** An image's source as written in the code: /renders/x.jpg, not /_next/image?url=… */
function imgPath(img: HTMLImageElement) {
  const raw = img.getAttribute("src") ?? "";
  try {
    const u = new URL(raw, window.location.href);
    if (u.pathname === "/_next/image") return u.searchParams.get("url") ?? raw;
    return u.origin === window.location.origin ? u.pathname + u.search : raw;
  } catch {
    return raw;
  }
}

type CaretDoc = Document & {
  caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

/** The text node under the pointer — only if the pointer is really over its letters. */
function textAt(x: number, y: number): Text | null {
  const doc = document as CaretDoc;
  const node = doc.caretPositionFromPoint?.(x, y)?.offsetNode ?? doc.caretRangeFromPoint?.(x, y)?.startContainer ?? null;
  if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue?.trim() || inEditor(node)) return null;
  if (node.parentElement?.closest("script,style")) return null;
  const range = document.createRange();
  range.selectNodeContents(node);
  for (const r of Array.from(range.getClientRects())) {
    if (x >= r.left - 2 && x <= r.right + 2 && y >= r.top - 2 && y <= r.bottom + 2) return node as Text;
  }
  return null;
}

function pick(x: number, y: number): Picked | null {
  const top = document.elementFromPoint(x, y);
  if (!top || top.closest(EDITOR)) return null;
  // Beside the words of a block that holds just one piece of text (a heading, a label), that text.
  const lone = top.childNodes.length === 1 && top.firstChild?.nodeType === Node.TEXT_NODE && top.firstChild.nodeValue?.trim() ? (top.firstChild as Text) : null;
  const text = textAt(x, y) ?? lone;
  const whole = top.closest("[data-edit-text]");
  if (whole) {
    const first = document.createTreeWalker(whole, NodeFilter.SHOW_TEXT).nextNode() as Text | null;
    if (first) return { kind: "text", node: text ?? first, whole };
  }
  if (text) return { kind: "text", node: text, whole: text.parentElement?.closest("[data-edit-text]") ?? null };
  const img = document.elementsFromPoint(x, y).find((el): el is HTMLImageElement => el instanceof HTMLImageElement && !el.closest(EDITOR));
  return img ? { kind: "image", node: img } : null;
}

function rectOf(p: Picked) {
  if (p.kind === "image") return p.node.getBoundingClientRect();
  if (p.whole) return p.whole.getBoundingClientRect();
  const range = document.createRange();
  range.selectNodeContents(p.node);
  return range.getBoundingClientRect();
}

function describe(p: Picked): Target {
  if (p.kind === "text") {
    if (p.whole) {
      const current = (p.whole.getAttribute("data-edit-text") ?? "").trim();
      return { kind: "text", current, original: originalOf(edits().text, current), count: 1, whole: true };
    }
    const current = (p.node.nodeValue ?? "").trim();
    const count = pageTextNodes().filter((n) => n.nodeValue?.trim() === current).length;
    return { kind: "text", current, original: originalOf(edits().text, current), count, whole: false };
  }
  const current = imgPath(p.node);
  const count = Array.from(document.images).filter((i) => !inEditor(i) && imgPath(i) === current).length;
  return { kind: "image", current, original: originalOf(edits().images, current), count };
}

/** Shows a saved change straight away, before the refreshed page arrives. */
function patchPage(kind: "text" | "image", current: string, shown: string) {
  if (kind === "text") {
    for (const n of pageTextNodes()) {
      if (n.nodeValue?.trim() === current) n.nodeValue = n.nodeValue.replace(current, () => shown);
    }
    return;
  }
  for (const img of Array.from(document.images)) {
    if (inEditor(img) || imgPath(img) !== current) continue;
    img.removeAttribute("srcset");
    img.src = shown;
  }
}

export default function PageEditor() {
  const pathname = usePathname();
  const router = useRouter();
  const [editing, setEditing] = useState(() => new URLSearchParams(window.location.search).get("edit") === "1");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const hoverRef = useRef<Picked | null>(null);
  const selectedRef = useRef<Picked | null>(null);
  const hoverBox = useRef<HTMLDivElement>(null);
  const selectBox = useRef<HTMLDivElement>(null);
  const bangla = document.documentElement.lang === "bn";

  useEffect(() => {
    selectedRef.current = selection?.picked ?? null;
  }, [selection]);

  useEffect(() => {
    if (!editing) return;
    const html = document.documentElement;
    html.dataset.avenEditing = "";
    let frame = 0;
    let n = 0;

    const place = (box: HTMLDivElement | null, p: Picked | null) => {
      if (!box) return;
      if (!p || !p.node.isConnected) {
        box.style.opacity = "0";
        return;
      }
      const r = rectOf(p);
      box.style.opacity = "1";
      box.style.transform = `translate(${r.left - 4}px, ${r.top - 4}px)`;
      box.style.width = `${r.width + 8}px`;
      box.style.height = `${r.height + 8}px`;
    };
    const tick = () => {
      place(hoverBox.current, hoverRef.current);
      place(selectBox.current, selectedRef.current);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    const onMove = (e: PointerEvent) => {
      hoverRef.current = e.pointerType === "mouse" ? pick(e.clientX, e.clientY) : null;
    };
    // Captured on window, before the page sees it: links don't navigate and buttons don't fire while editing.
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.(EDITOR)) return;
      e.preventDefault();
      e.stopPropagation();
      const p = pick(e.clientX, e.clientY);
      if (p) setSelection({ picked: p, target: describe(p), id: ++n });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedRef.current) setSelection(null);
      else setEditing(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKey);
    return () => {
      delete html.dataset.avenEditing;
      cancelAnimationFrame(frame);
      hoverRef.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKey);
    };
  }, [editing]);

  function notify(message: string) {
    setFlash(message);
    window.setTimeout(() => setFlash((m) => (m === message ? null : m)), 2600);
  }

  /** Saves a change; resolves with an error message, or null when it went live. */
  async function save(kind: "text" | "image", original: string, current: string, value: string, reload = false): Promise<string | null> {
    try {
      const r = await fetch("/api/admin/site-edits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, original, value, page: pathname }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) return json.errors?.value ?? json.error ?? "Couldn't save. Please try again.";
      installEdits(json.map);
      if (window.parent !== window) window.parent.postMessage({ type: "aven:page-edited" }, window.location.origin);
      // Text a component cut up can't be patched in place; load the page again instead.
      if (reload) {
        window.location.reload();
        return null;
      }
      patchPage(kind, current, json.restored ? original : value);
      setSelection(null);
      notify(json.restored ? "Original restored" : "Saved — live for every visitor");
      router.refresh();
      return null;
    } catch {
      return "Couldn't reach the server. Please try again.";
    }
  }

  const target = selection?.target;

  return (
    <div data-aven-editor="">
      <style>{`html[data-aven-editing] body{cursor:pointer}html[data-aven-editing] [data-aven-editor]{cursor:auto}`}</style>

      {editing ? (
        <>
          <div ref={hoverBox} className="pointer-events-none fixed left-0 top-0 z-[999] rounded-md border-2 border-dashed border-gold-400 bg-gold-400/10 opacity-0" />
          <div ref={selectBox} className="pointer-events-none fixed left-0 top-0 z-[999] rounded-md border-2 border-forest-600 bg-forest-600/10 opacity-0 shadow-[0_0_0_4px_rgba(255,255,255,0.6)]" />
          <div className="fixed left-1/2 top-3 z-[1000] flex max-w-[calc(100vw-1.5rem)] -translate-x-1/2 items-center gap-3 rounded-full bg-forest-950 py-1.5 pl-4 pr-1.5 text-[0.8125rem] text-cream-50 shadow-2xl ring-1 ring-gold-400/40">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-400 opacity-70" />
              <span className="relative h-2 w-2 rounded-full bg-gold-400" />
            </span>
            <span className="truncate">
              <strong className="font-semibold">Editing</strong>
              <span className="hidden text-cream-200/70 sm:inline"> — click any text or image to change it</span>
            </span>
            <button type="button" onClick={() => { setSelection(null); setEditing(false); }} className="shrink-0 rounded-full bg-gold-400 px-4 py-1.5 text-xs font-semibold text-forest-950 hover:bg-gold-300">
              Done
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="fixed bottom-4 left-4 z-[1000] inline-flex items-center gap-2 rounded-full bg-forest-950 px-4 py-2.5 text-[0.8125rem] font-semibold text-cream-50 shadow-2xl ring-1 ring-gold-400/40 hover:bg-forest-900"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-gold-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20h4L19 9l-4-4L4 16v4Zm9-13 4 4" />
          </svg>
          Edit page
        </button>
      )}

      {editing && target && (
        <div
          data-lenis-prevent=""
          role="dialog"
          aria-label={target.kind === "image" ? "Replace image" : "Edit text"}
          className="fixed inset-x-0 bottom-0 z-[1001] max-h-[78vh] overflow-y-auto rounded-t-3xl bg-white p-5 text-[#14201B] shadow-[0_-20px_60px_rgba(0,0,0,0.25)] ring-1 ring-black/5 sm:inset-x-auto sm:bottom-auto sm:right-4 sm:top-16 sm:w-[25rem] sm:rounded-2xl"
        >
          {target.kind === "text" ? (
            <TextPanel key={selection.id} target={target} bangla={bangla} onClose={() => setSelection(null)} onSave={(v) => save("text", target.original, target.current, v, target.whole)} />
          ) : (
            <ImagePanel key={selection.id} target={target} onClose={() => setSelection(null)} onSave={(v) => save("image", target.original, target.current, v)} />
          )}
        </div>
      )}

      {flash && (
        <p role="status" className="fixed bottom-5 left-1/2 z-[1002] -translate-x-1/2 rounded-full bg-forest-700 px-5 py-2.5 text-[0.8125rem] font-medium text-cream-50 shadow-2xl">
          ✓ {flash}
        </p>
      )}
    </div>
  );
}

function PanelHead({ title, edited, onClose }: { title: string; edited: boolean; onClose: () => void }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="flex items-center gap-2 text-[0.9375rem] font-semibold">
        {title}
        {edited && <span className="rounded-full bg-gold-400/25 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.08em] text-[#7a5a17]">Edited</span>}
      </p>
      <button type="button" onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full text-[#6B756F] hover:bg-[#F0F2EF]">
        ✕
      </button>
    </div>
  );
}

const btn = "inline-flex h-10 items-center justify-center rounded-full px-4 text-[0.8125rem] font-semibold disabled:opacity-50";

function TextPanel({
  target,
  bangla,
  onSave,
  onClose,
}: {
  target: Extract<Target, { kind: "text" }>;
  bangla: boolean;
  onSave: (value: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(target.current);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const edited = target.original !== target.current;
  const changed = draft.trim() !== target.current;

  async function submit(value: string) {
    if (!value.trim() && !window.confirm("Leave this empty? The text will disappear from the page.")) return;
    setBusy(true);
    setError(await onSave(value.trim()));
    setBusy(false);
  }

  return (
    <>
      <PanelHead title="Edit text" edited={edited} onClose={onClose} />
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && changed) submit(draft);
        }}
        rows={Math.min(12, Math.max(2, Math.ceil(draft.length / 36)))}
        aria-label="New text"
        className="w-full resize-y rounded-xl border border-[#DDE1DB] bg-[#FAFBF9] px-3.5 py-3 text-[0.9375rem] leading-relaxed outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <p className="mt-3 text-xs leading-relaxed text-[#6B756F]">
        {target.count > 1 ? `Shown ${target.count} times on this page. ` : ""}
        The change applies everywhere this exact text appears on the website.
        {target.original.length < 4 && <strong className="font-semibold text-amber-700"> It&apos;s very short, so check it isn&apos;t used elsewhere for something else.</strong>}
      </p>
      {bangla && (
        <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Bangla text that is translated automatically can&apos;t be edited here — switch the site to English and edit the English wording; the Bangla follows.
        </p>
      )}

      {edited && (
        <div className="mt-4 rounded-xl bg-[#F5F7F3] px-3.5 py-3">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-[#8A948E]">Original</p>
          <p className="mt-1 text-[0.8125rem] leading-relaxed text-[#3D4A44]">{target.original}</p>
          <button type="button" disabled={busy} onClick={() => submit(target.original)} className="mt-2 text-xs font-semibold text-forest-700 hover:underline disabled:opacity-50">
            Restore original
          </button>
        </div>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={cn(btn, "text-[#3D4A44] ring-1 ring-[#DDE1DB] hover:bg-[#F5F7F3]")}>
          Cancel
        </button>
        <button type="button" disabled={!changed || busy} onClick={() => submit(draft)} className={cn(btn, "bg-forest-700 text-white hover:bg-forest-800")}>
          {busy ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </>
  );
}

type LibraryFile = { id: string; url: string; filename: string };

function ImagePanel({
  target,
  onSave,
  onClose,
}: {
  target: Extract<Target, { kind: "image" }>;
  onSave: (value: string) => Promise<string | null>;
  onClose: () => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"upload" | "save" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [library, setLibrary] = useState<LibraryFile[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const edited = target.original !== target.current;

  async function upload(file: File | undefined) {
    if (!file) return;
    setBusy("upload");
    setError(null);
    const r = await uploadImage(file);
    setBusy(null);
    if (r.ok) setChoice(r.url);
    else setError(r.error);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function openLibrary() {
    setLibrary([]);
    const r = await fetch("/api/admin/assets").catch(() => null);
    const json = r?.ok ? await r.json().catch(() => null) : null;
    if (!json) {
      setError("Couldn't load the media library.");
      setLibrary(null);
      return;
    }
    setLibrary(json.files.filter((f: LibraryFile & { mimeType: string }) => f.mimeType.startsWith("image/")));
  }

  async function submit(value: string) {
    setBusy("save");
    setError(await onSave(value));
    setBusy(null);
  }

  return (
    <>
      <PanelHead title="Replace image" edited={edited} onClose={onClose} />
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[#EEF1EC] ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element -- preview of any chosen file */}
        <img src={choice ?? target.current} alt="" className="h-full w-full object-cover" />
        {choice && <span className="absolute left-2 top-2 rounded-full bg-forest-700 px-2.5 py-1 text-[0.625rem] font-semibold text-white">New — not saved yet</span>}
      </div>

      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden onChange={(e) => upload(e.target.files?.[0])} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" disabled={!!busy} onClick={() => fileRef.current?.click()} className={cn(btn, "bg-[#F0F2EF] text-[#24312B] hover:bg-[#E6E9E4]")}>
          {busy === "upload" ? "Uploading…" : "Upload new"}
        </button>
        <button type="button" disabled={!!busy} onClick={openLibrary} className={cn(btn, "bg-[#F0F2EF] text-[#24312B] hover:bg-[#E6E9E4]")}>
          Media library
        </button>
      </div>

      {library && (
        <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-[#E6E8E3] p-2" data-lenis-prevent="">
          {library.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-[#8A948E]">Loading… (or no uploads yet)</p>
          ) : (
            <ul className="grid grid-cols-3 gap-2">
              {library.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => setChoice(f.url)}
                    title={f.filename}
                    className={cn("block aspect-square w-full overflow-hidden rounded-lg ring-2", choice === f.url ? "ring-forest-600" : "ring-transparent hover:ring-[#DDE1DB]")}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- library thumbnail */}
                    <img src={f.url} alt={f.filename} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <p className="mt-3 text-xs leading-relaxed text-[#6B756F]">
        {target.count > 1 ? `Used ${target.count} times on this page. ` : ""}
        The new image replaces this one everywhere it is used on the website. Use a photo of a similar shape for the best fit.
      </p>

      {edited && (
        <button type="button" disabled={!!busy} onClick={() => submit(target.original)} className="mt-3 text-xs font-semibold text-forest-700 hover:underline disabled:opacity-50">
          Restore the original image
        </button>
      )}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onClose} className={cn(btn, "text-[#3D4A44] ring-1 ring-[#DDE1DB] hover:bg-[#F5F7F3]")}>
          Cancel
        </button>
        <button type="button" disabled={!choice || !!busy} onClick={() => choice && submit(choice)} className={cn(btn, "bg-forest-700 text-white hover:bg-forest-800")}>
          {busy === "save" ? "Saving…" : "Save & publish"}
        </button>
      </div>
    </>
  );
}
