"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, Btn, Card, CardHeader, Empty, ErrorNote, LoadingRows, PageHeader, SearchInput, Segmented, TextArea, firstError, relTime, send, useAdminFetch, useToast } from "../kit";
import { cn } from "@/lib/utils";

type SiteEdit = { id: string; kind: "text" | "image"; original: string; value: string; page: string | null; updatedBy: string | null; updatedAt: string };

/** The public pages, in the order of the site's menu. */
const PAGES: { group: string; items: [string, string][] }[] = [
  {
    group: "Main pages",
    items: [
      ["/", "Home"],
      ["/about", "About"],
      ["/ownership", "Ownership"],
      ["/own-your-share", "Own your share"],
      ["/wellness", "Wellness"],
      ["/amenities", "Amenities"],
      ["/accommodations", "Stay"],
      ["/masterplan", "Masterplan"],
      ["/gallery", "Gallery"],
      ["/contact", "Contact"],
      ["/faq", "FAQ"],
    ],
  },
  {
    group: "Careers",
    items: [
      ["/careers", "Vacancy announcements"],
      ["/careers/why-join-aven", "Why join Aven"],
      ["/careers/archive", "Circular archive"],
    ],
  },
  {
    group: "Forms & legal",
    items: [
      ["/interest", "Register interest"],
      ["/apply", "Apply for shares"],
      ["/login", "Sign in"],
      ["/register", "Create account"],
      ["/terms", "Terms & conditions"],
      ["/privacy", "Privacy policy"],
    ],
  },
];

const DEVICES = { desktop: "100%", tablet: "820px", phone: "390px" } as const;
type Device = keyof typeof DEVICES;

const pageName = (path: string | null) => PAGES.flatMap((g) => g.items).find(([p]) => p === path)?.[1] ?? path ?? "—";

/**
 * Admin → Page editor: any page of the website, live, in edit mode — click a
 * piece of text to rewrite it or an image to replace it. Beside it, every
 * change made so far, each with its original, to adjust or undo.
 */
export function PageEditorTab() {
  const { data, error, loading, reload } = useAdminFetch<{ edits: SiteEdit[] }>("/api/admin/site-edits");
  const [path, setPath] = useState("/");
  const [device, setDevice] = useState<Device>("desktop");
  const [frameKey, setFrameKey] = useState(0);
  const [scope, setScope] = useState<"page" | "all">("page");
  const [q, setQ] = useState("");

  // The page inside the frame says when it saved something; refresh the list.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin === window.location.origin && e.data?.type === "aven:page-edited") reload();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [reload]);

  const edits = useMemo(() => data?.edits ?? [], [data]);
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return edits.filter((e) => (scope === "all" || e.page === path) && (!needle || `${e.original} ${e.value}`.toLowerCase().includes(needle)));
  }, [edits, scope, path, q]);
  const perPage = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of edits) if (e.page) m.set(e.page, (m.get(e.page) ?? 0) + 1);
    return m;
  }, [edits]);

  function open(p: string) {
    setPath(p);
    setFrameKey((k) => k + 1);
  }

  return (
    <>
      <PageHeader
        title="Page editor"
        description="Change any text or picture on the website. Click it on the page below, type or upload, and save — it is live for every visitor at once."
        actions={
          <a href={`${path}?edit=1`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#DDE1DB] bg-white px-3.5 text-[0.8125rem] font-medium text-[#24312B] hover:bg-[#F5F7F3]">
            Edit in a new tab ↗
          </a>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[13.5rem_1fr]">
        {/* Pages */}
        <Card className="h-fit p-2">
          <nav aria-label="Pages" className="space-y-3">
            {PAGES.map((g) => (
              <div key={g.group}>
                <p className="px-3 pb-1 pt-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#9AA39E]">{g.group}</p>
                {g.items.map(([p, label]) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => open(p)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-left text-[0.8125rem] transition-colors",
                      path === p ? "bg-forest-700 text-white" : "text-[#3D4A44] hover:bg-[#F2F4F1]",
                    )}
                  >
                    <span className="truncate">{label}</span>
                    {!!perPage.get(p) && (
                      <span className={cn("rounded-full px-1.5 text-[0.625rem] tabular-nums", path === p ? "bg-white/20" : "bg-[#EEF1EC] text-[#6B756F]")}>{perPage.get(p)}</span>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </Card>

        <div className="min-w-0 space-y-4">
          {/* Live page */}
          <Card className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0EC] px-4 py-2.5">
              <p className="flex min-w-0 items-center gap-2 text-[0.8125rem]">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="truncate font-medium text-[#14201B]">{pageName(path)}</span>
                <span className="hidden truncate text-[#8A948E] sm:inline">{path}</span>
              </p>
              <div className="flex items-center gap-2">
                <Segmented<Device>
                  value={device}
                  onChange={setDevice}
                  options={[
                    { value: "desktop", label: "Desktop" },
                    { value: "tablet", label: "Tablet" },
                    { value: "phone", label: "Phone" },
                  ]}
                />
                <Btn size="sm" variant="ghost" onClick={() => setFrameKey((k) => k + 1)} aria-label="Reload page">
                  ↻
                </Btn>
              </div>
            </div>
            <div className="bg-[#E9ECE7] p-3">
              <iframe
                key={frameKey}
                src={`${path}?edit=1`}
                title={`${pageName(path)} — editor`}
                className="mx-auto block h-[72vh] rounded-lg bg-white shadow-sm ring-1 ring-black/5 transition-[width]"
                style={{ width: DEVICES[device], maxWidth: "100%" }}
              />
            </div>
            <p className="border-t border-[#EEF0EC] px-4 py-2.5 text-xs text-[#6B756F]">
              Hover to see what can be changed, then click it. Links and buttons don&apos;t open while editing. A change applies wherever that exact text or picture appears on the site.
            </p>
          </Card>

          {/* Changes */}
          <Card>
            <CardHeader
              title="Changes"
              subtitle={`${edits.length} change${edits.length === 1 ? "" : "s"} on the website. Restore any of them to bring the original back.`}
              action={
                <Segmented<"page" | "all">
                  value={scope}
                  onChange={setScope}
                  options={[
                    { value: "page", label: "This page", count: edits.filter((e) => e.page === path).length },
                    { value: "all", label: "All pages", count: edits.length },
                  ]}
                />
              }
            />
            <div className="p-4">
              {edits.length > 5 && <SearchInput value={q} onChange={setQ} placeholder="Search changes…" className="mb-3 sm:w-72" />}
              {error ? (
                <ErrorNote>{error}</ErrorNote>
              ) : loading && !data ? (
                <LoadingRows rows={3} />
              ) : shown.length === 0 ? (
                <Empty icon="layers" title={scope === "page" ? "No changes on this page yet" : "No changes yet"}>
                  Click any text or picture on the page above to change it.
                </Empty>
              ) : (
                <ul className="space-y-2.5">
                  {shown.map((e) => (
                    <EditRow
                      key={e.id}
                      edit={e}
                      showPage={scope === "all"}
                      onOpenPage={(p) => {
                        open(p);
                        setScope("page");
                      }}
                      onChanged={() => {
                        reload();
                        setFrameKey((k) => k + 1);
                      }}
                    />
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function EditRow({ edit: e, showPage, onOpenPage, onChanged }: { edit: SiteEdit; showPage: boolean; onOpenPage: (p: string) => void; onChanged: () => void }) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(e.value);
  const [busy, setBusy] = useState(false);

  async function restore() {
    if (!window.confirm("Bring back the original? This change will be removed.")) return;
    setBusy(true);
    const { ok, json } = await send(`/api/admin/site-edits/${e.id}`, "DELETE");
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    toast("Original restored");
    onChanged();
  }

  async function save() {
    setBusy(true);
    const { ok, json } = await send(`/api/admin/site-edits/${e.id}`, "PATCH", { value });
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    toast("Saved — live on the website");
    setEditing(false);
    onChanged();
  }

  return (
    <li className="rounded-xl border border-[#E6E8E3] bg-white p-3.5">
      <div className="flex flex-wrap items-center gap-2 text-[0.6875rem] text-[#8A948E]">
        <Badge tone={e.kind === "image" ? "blue" : "gray"}>{e.kind === "image" ? "Image" : "Text"}</Badge>
        {showPage && e.page && (
          <button type="button" onClick={() => onOpenPage(e.page!)} className="font-medium text-forest-700 hover:underline">
            {pageName(e.page)}
          </button>
        )}
        <span>
          {e.updatedBy ? `${e.updatedBy} · ` : ""}
          {relTime(e.updatedAt)}
        </span>
        <span className="ml-auto flex gap-1.5">
          {e.kind === "text" && !editing && (
            <Btn size="sm" variant="ghost" onClick={() => setEditing(true)}>
              Edit
            </Btn>
          )}
          <Btn size="sm" variant="ghost" disabled={busy} onClick={restore}>
            Restore original
          </Btn>
        </span>
      </div>

      {e.kind === "image" ? (
        <div className="mt-2.5 flex items-center gap-3">
          <Thumb src={e.original} label="Before" />
          <span className="text-[#9AA39E]" aria-hidden="true">→</span>
          <Thumb src={e.value} label="Now" />
        </div>
      ) : editing ? (
        <div className="mt-2.5">
          <p className="text-xs text-[#8A948E] line-through decoration-[#C9CFC7]">{e.original}</p>
          <TextArea className="mt-2" rows={Math.min(8, Math.max(2, Math.ceil(value.length / 70)))} value={value} onChange={(ev) => setValue(ev.target.value)} aria-label="New text" />
          <div className="mt-2 flex justify-end gap-2">
            <Btn size="sm" onClick={() => { setEditing(false); setValue(e.value); }}>
              Cancel
            </Btn>
            <Btn size="sm" variant="primary" disabled={busy || value.trim() === e.value} onClick={save}>
              Save
            </Btn>
          </div>
        </div>
      ) : (
        <div className="mt-2.5 grid gap-1.5 text-[0.8125rem] leading-relaxed">
          <p className="text-[#8A948E] line-through decoration-[#C9CFC7]">{e.original}</p>
          <p className="text-[#14201B]">{e.value || <em className="text-[#9AA39E]">(hidden)</em>}</p>
        </div>
      )}
    </li>
  );
}

function Thumb({ src, label }: { src: string; label: string }) {
  return (
    <figure className="w-36">
      <span className="block aspect-[4/3] overflow-hidden rounded-lg bg-[#EEF1EC] ring-1 ring-black/5">
        {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of any site image */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </span>
      <figcaption className="mt-1 text-[0.625rem] uppercase tracking-wide text-[#9AA39E]">{label}</figcaption>
    </figure>
  );
}
