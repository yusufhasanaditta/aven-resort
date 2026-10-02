"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AdminIcon } from "@/components/ui/AdminIcon";
import { AmenityIcon } from "@/components/ui/AmenityIcon";
import { BenefitIcon } from "@/components/ui/BenefitIcon";
import { RichText } from "@/components/ui/RichText";
import { Btn, Card, CardHeader, ErrorNote, Field, LoadingRows, PageHeader, Segmented, TextArea, TextInput, Toggle, firstError, send, uploadImage, useAdminFetch, useToast } from "../kit";
import type { CmsContent, CmsKey } from "@/data/cms-defaults";
import { cn } from "@/lib/utils";

type FieldSpec = { key: string; label: string; type?: "text" | "textarea" | "toggle" | "image" | "date"; hint?: string; rows?: number };

const SECTIONS: { key: CmsKey; label: string; icon: string; description: string; viewHref: string }[] = [
  { key: "announcement", label: "Announcement bar", icon: "bell", description: "A slim banner across the top of every page.", viewHref: "/" },
  { key: "hero", label: "Homepage banner", icon: "image", description: "The first thing every visitor sees.", viewHref: "/" },
  { key: "pages", label: "Page headers", icon: "layers", description: "The heading and intro at the top of each main page.", viewHref: "/about" },
  { key: "accountNotice", label: "Shareholder dashboard notice", icon: "bell", description: "A message at the top of every shareholder's account — news, site visits, payment deadlines.", viewHref: "/account" },
  { key: "resort", label: "Resort story", icon: "overview", description: "The welcome letter on the homepage.", viewHref: "/" },
  { key: "benefits", label: "Investment benefits", icon: "tag", description: "“Why own with us?” on the ownership page.", viewHref: "/ownership#why-own" },
  { key: "gallery", label: "Gallery photos", icon: "image", description: "Every photo on /gallery — add, replace, caption and reorder.", viewHref: "/gallery" },
  { key: "faqs", label: "FAQs", icon: "search", description: "Questions and answers on /faq.", viewHref: "/faq" },
  { key: "careers", label: "Careers page", icon: "briefcase", description: "HR contact, the anti-fraud notice and the “Why join Aven” page. Job circulars themselves are in admin → Careers.", viewHref: "/careers/why-join-aven" },
  { key: "contact", label: "Contact & social", icon: "mail", description: "Phone, email, addresses, map link and the footer's social media links.", viewHref: "/contact" },
  { key: "payment", label: "Payment instructions", icon: "wallet", description: "Bank / mobile-banking details shown to shareholders.", viewHref: "/account?tab=buy" },
  { key: "terms", label: "Terms & conditions", icon: "invoice", description: "The /terms page.", viewHref: "/terms" },
  { key: "privacy", label: "Privacy policy", icon: "user", description: "The /privacy page.", viewHref: "/privacy" },
];

/** Page headers: the same four fields for each page, grouped by page. */
const PAGE_HEADERS: [string, string][] = [
  ["about", "About"],
  ["ownership", "Ownership"],
  ["wellness", "Wellness"],
  ["amenities", "Amenities"],
  ["stay", "Stay"],
  ["gallery", "Gallery"],
  ["contact", "Contact"],
];

const OBJECT_FIELDS: Partial<Record<CmsKey, FieldSpec[]>> = {
  pages: PAGE_HEADERS.flatMap(([k, name]) => [
    { key: `${k}Eyebrow`, label: `${name} — small label above the title` },
    { key: `${k}Title`, label: `${name} — title` },
    { key: `${k}Accent`, label: `${name} — second line (gold)` },
    { key: `${k}Lede`, label: `${name} — intro text`, type: "textarea" as const, rows: 3 },
  ]),
  accountNotice: [
    { key: "enabled", label: "Show this notice on every shareholder's dashboard", type: "toggle" },
    { key: "title", label: "Title", hint: "e.g. Site visit on 15 November" },
    { key: "text", label: "Message", type: "textarea", rows: 3 },
    { key: "linkLabel", label: "Button label (optional)" },
    { key: "href", label: "Button link (optional)", hint: "e.g. /contact or https://…" },
  ],
  announcement: [
    { key: "enabled", label: "Show the announcement bar", type: "toggle" },
    { key: "text", label: "Message" },
    { key: "linkLabel", label: "Link label" },
    { key: "href", label: "Link URL", hint: "e.g. /ownership or https://…" },
  ],
  hero: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Title" },
    { key: "titleAccent", label: "Title accent (italic gold line)" },
    { key: "lede", label: "Intro text", type: "textarea", rows: 3 },
    { key: "image", label: "Background image", type: "image" },
    { key: "primaryLabel", label: "Primary button" },
    { key: "primaryHref", label: "Primary link" },
    { key: "secondaryLabel", label: "Secondary button" },
    { key: "secondaryHref", label: "Secondary link" },
    { key: "ticker", label: "Scrolling line under the banner", hint: "Repeats across the band below the homepage banner." },
  ],
  resort: [
    { key: "headline", label: "Headline question", type: "textarea", rows: 3 },
    { key: "paragraphOne", label: "Paragraph one", type: "textarea", rows: 4 },
    { key: "paragraphTwo", label: "Paragraph two", type: "textarea", rows: 4 },
    { key: "motto", label: "Motto" },
  ],
  contact: [
    { key: "phone", label: "Phone" },
    { key: "whatsapp", label: "WhatsApp number" },
    { key: "email", label: "Email" },
    { key: "hours", label: "Office hours" },
    { key: "headOffice", label: "Corporate office", type: "textarea", rows: 2 },
    { key: "resortAddress", label: "Resort address", type: "textarea", rows: 2 },
    { key: "mapUrl", label: "Google Maps link" },
    { key: "website", label: "Website" },
    { key: "facebook", label: "Facebook page URL — shown in the footer" },
    { key: "instagram", label: "Instagram URL — shown in the footer" },
    { key: "youtube", label: "YouTube URL — shown in the footer" },
    { key: "tiktok", label: "TikTok URL — shown in the footer" },
    { key: "linkedin", label: "LinkedIn URL — shown in the footer" },
    { key: "x", label: "X (Twitter) URL — shown in the footer" },
  ],
  careers: [
    { key: "hrEmail", label: "HR email" },
    { key: "hrPhone", label: "HR phone" },
    { key: "hrHours", label: "HR office hours" },
    { key: "noVacancy", label: "Message when no vacancy is open", type: "textarea", rows: 2 },
    { key: "fraudNotice", label: "Recruitment fraud notice", type: "textarea", rows: 3, hint: "Shown on the Careers page and every circular. Leave empty to hide it." },
    { key: "whyTitle", label: "Why join — title" },
    { key: "whyAccent", label: "Why join — second line (gold)" },
    { key: "whyLede", label: "Why join — intro", type: "textarea", rows: 3 },
    { key: "mission", label: "Our mission", type: "textarea", rows: 4 },
    { key: "offers", label: "What we offer", type: "textarea", rows: 7, hint: "One per line: Title — detail" },
    { key: "values", label: "Our values", type: "textarea", rows: 5, hint: "One per line: Title — detail" },
    { key: "equalOpportunity", label: "Equal opportunity statement", type: "textarea", rows: 3 },
    { key: "process", label: "How we hire (steps)", type: "textarea", rows: 6, hint: "One step per line: Step — detail" },
    { key: "faqs", label: "Careers FAQs", type: "textarea", rows: 7, hint: "One per line: Question | Answer" },
  ],
  payment: [
    { key: "enabled", label: "Show bank / mobile-banking details to shareholders", type: "toggle" },
    { key: "bankName", label: "Bank name" },
    { key: "accountName", label: "Account name" },
    { key: "accountNumber", label: "Account number" },
    { key: "branch", label: "Branch" },
    { key: "routingNumber", label: "Routing number" },
    { key: "mobileBanking", label: "bKash / Nagad (merchant) number" },
    { key: "note", label: "Instructions", type: "textarea", rows: 3 },
  ],
  terms: [
    { key: "title", label: "Page title" },
    { key: "updated", label: "Last updated", type: "date" },
    { key: "body", label: "Body", type: "textarea", rows: 18, hint: "## for a heading, - for a bullet, blank line between paragraphs." },
  ],
  privacy: [
    { key: "title", label: "Page title" },
    { key: "updated", label: "Last updated", type: "date" },
    { key: "body", label: "Body", type: "textarea", rows: 18, hint: "## for a heading, - for a bullet, blank line between paragraphs." },
  ],
};

export function ContentTab() {
  const { data, error, loading, reload } = useAdminFetch<{ content: CmsContent }>("/api/admin/content");
  const [active, setActive] = useState<CmsKey>("hero");
  const section = SECTIONS.find((s) => s.key === active)!;

  return (
    <>
      <PageHeader title="Website content" description="Edit the public website without a deploy. Saving publishes instantly." />
      {error ? (
        <ErrorNote>{error}</ErrorNote>
      ) : loading && !data ? (
        <Card><LoadingRows /></Card>
      ) : data ? (
        <div className="grid gap-4 lg:grid-cols-[15rem_1fr]">
          <Card className="h-fit p-2">
            <nav aria-label="Content sections" className="space-y-0.5">
              {SECTIONS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setActive(s.key)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[0.8125rem] transition-colors",
                    active === s.key ? "bg-forest-700 text-white" : "text-[#3D4A44] hover:bg-[#F2F4F1]",
                  )}
                >
                  <AdminIcon icon={s.icon} className="h-4 w-4 shrink-0 opacity-80" />
                  {s.label}
                </button>
              ))}
            </nav>
          </Card>
          <SectionEditor key={active} section={section} initial={data.content[active]} onSaved={reload} />
        </div>
      ) : null}
    </>
  );
}

function SectionEditor({
  section,
  initial,
  onSaved,
}: {
  section: (typeof SECTIONS)[number];
  initial: unknown;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [value, setValue] = useState<unknown>(initial);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<"edit" | "preview">("edit");
  const dirty = JSON.stringify(value) !== JSON.stringify(initial);

  async function save() {
    setBusy(true);
    const { ok, json } = await send(`/api/admin/content/${section.key}`, "PUT", { value });
    setBusy(false);
    if (!ok) return toast(firstError(json), "error");
    setValue(json.value);
    toast(`${section.label} published`);
    onSaved();
  }

  async function reset() {
    const { ok, json } = await send(`/api/admin/content/${section.key}`, "DELETE");
    if (!ok) return toast(firstError(json), "error");
    setValue(json.value);
    toast(`${section.label} reset to default`);
    onSaved();
  }

  const legal = section.key === "terms" || section.key === "privacy";

  return (
    <Card>
      <CardHeader
        title={section.label}
        subtitle={section.description}
        action={
          <div className="flex items-center gap-2">
            {legal && <Segmented value={preview} onChange={setPreview} options={[{ value: "edit", label: "Edit" }, { value: "preview", label: "Preview" }]} />}
            <a href={section.viewHref} target="_blank" rel="noreferrer" className="text-xs font-medium text-forest-700 hover:underline">
              View on site ↗
            </a>
          </div>
        }
      />
      <div className="p-5">
        {section.key === "benefits" ? (
          <ListEditor
            items={value as CmsContent["benefits"]}
            onChange={setValue}
            blank={{ title: "", description: "", icon: "document" }}
            fields={[
              { key: "title", label: "Title" },
              { key: "description", label: "Description", type: "textarea", rows: 2 },
              { key: "icon", label: "Icon", hint: "document · building · chart · exchange · infinity · users · key · tag" },
            ]}
            renderBadge={(item) => (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <BenefitIcon icon={String(item.icon)} />
              </span>
            )}
          />
        ) : section.key === "gallery" ? (
          <ListEditor
            items={value as CmsContent["gallery"]}
            onChange={setValue}
            blank={{ src: "", title: "", caption: "", category: "nature", span: "" }}
            fields={[
              { key: "title", label: "Title" },
              { key: "src", label: "Photo", type: "image" },
              { key: "caption", label: "Caption", type: "textarea", rows: 2 },
              { key: "category", label: "Category", hint: "masterplan · architecture · villas · water · wellness · dining · events · nature" },
              { key: "span", label: "Size", hint: "wide · tall · or leave empty for normal" },
            ]}
            renderBadge={(item) => (
              <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-md bg-[#EEF1EC]">
                {item.src && <Image src={item.src} alt="" fill sizes="3rem" unoptimized className="object-cover" />}
              </span>
            )}
          />
        ) : section.key === "faqs" ? (
          <ListEditor
            items={value as CmsContent["faqs"]}
            onChange={setValue}
            blank={{ question: "", answer: "", category: "General" }}
            fields={[
              { key: "question", label: "Question" },
              { key: "answer", label: "Answer", type: "textarea", rows: 3 },
              { key: "category", label: "Category" },
            ]}
            renderBadge={() => (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                <AmenityIcon icon="library" className="h-5 w-5" />
              </span>
            )}
          />
        ) : legal && preview === "preview" ? (
          <div className="mx-auto max-w-2xl rounded-2xl bg-cream-50 p-8">
            <h1 className="font-display text-4xl text-forest-900">{(value as { title: string }).title}</h1>
            <p className="mt-1 text-xs text-forest-900/45">Last updated {(value as { updated: string }).updated}</p>
            <RichText text={(value as { body: string }).body} className="mt-6" />
          </div>
        ) : (
          <ObjectEditor fields={OBJECT_FIELDS[section.key] ?? []} value={value as Record<string, unknown>} onChange={setValue} />
        )}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-[#EEF0EC] bg-[#FAFBF9] px-5 py-3.5">
        <Btn variant="ghost" size="sm" onClick={reset}>Reset to default</Btn>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-700">Unsaved changes</span>}
          <Btn variant="primary" onClick={save} disabled={!dirty || busy}>{busy ? "Publishing…" : "Save & publish"}</Btn>
        </div>
      </div>
    </Card>
  );
}

function ObjectEditor({ fields, value, onChange }: { fields: FieldSpec[]; value: Record<string, unknown>; onChange: (v: unknown) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) =>
        f.type === "toggle" ? (
          <div key={f.key} className="sm:col-span-2">
            <Toggle checked={!!value[f.key]} onChange={(v) => set(f.key, v)} label={f.label} />
          </div>
        ) : f.type === "image" ? (
          <ImageField key={f.key} label={f.label} value={String(value[f.key] ?? "")} onChange={(v) => set(f.key, v)} />
        ) : (
          <Field key={f.key} label={f.label} hint={f.hint} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
            {(id) =>
              f.type === "textarea" ? (
                <TextArea id={id} rows={f.rows ?? 3} value={String(value[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} className={f.rows && f.rows > 10 ? "font-mono text-xs" : undefined} />
              ) : (
                <TextInput id={id} type={f.type === "date" ? "date" : "text"} value={String(value[f.key] ?? "")} onChange={(e) => set(f.key, e.target.value)} />
              )
            }
          </Field>
        ),
      )}
    </div>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const toast = useToast();
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const up = await uploadImage(file);
    setBusy(false);
    if (!up.ok) return toast(up.error, "error");
    onChange(up.url);
    toast("Image uploaded — save to publish");
  }

  return (
    <div className="sm:col-span-2">
      <p className="mb-1.5 text-xs font-medium text-[#3D4A44]">{label}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl bg-[#EEF1EC] sm:w-64">
          {value && <Image src={value} alt="" fill sizes="16rem" unoptimized className="object-cover" />}
        </div>
        <div className="flex-1 space-y-2">
          <TextInput value={value} onChange={(e) => onChange(e.target.value)} aria-label={`${label} URL`} placeholder="/renders/… or https://…" />
          <input
            ref={ref}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
              e.target.value = "";
            }}
          />
          <Btn size="sm" icon="image" onClick={() => ref.current?.click()} disabled={busy}>{busy ? "Uploading…" : "Upload new image"}</Btn>
          <p className="text-[0.6875rem] text-[#8A948E]">JPG, PNG, WebP or AVIF — large photos are resized automatically. Wide landscape images work best.</p>
        </div>
      </div>
    </div>
  );
}

function ListEditor<T extends Record<string, string>>({
  items,
  onChange,
  blank,
  fields,
  renderBadge,
}: {
  items: T[];
  onChange: (v: T[]) => void;
  blank: T;
  fields: FieldSpec[];
  renderBadge: (item: T) => React.ReactNode;
}) {
  const [open, setOpen] = useState<number | null>(0);
  const update = (i: number, k: string, v: string) => onChange(items.map((it, j) => (j === i ? { ...it, [k]: v } : it)));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#E6E8E3]">
          <div className="flex items-center gap-3 bg-white px-3 py-2.5">
            {renderBadge(item)}
            <button type="button" onClick={() => setOpen(open === i ? null : i)} className="min-w-0 flex-1 truncate text-left text-[0.8125rem] font-medium text-[#14201B]">
              {item[fields[0].key] || <span className="text-[#9AA39E]">Untitled</span>}
            </button>
            <div className="flex shrink-0 items-center gap-0.5">
              <button type="button" onClick={() => move(i, -1)} aria-label="Move up" className="rounded-md px-1.5 py-1 text-[#6B756F] hover:bg-[#F0F2EF] disabled:opacity-30" disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(i, 1)} aria-label="Move down" className="rounded-md px-1.5 py-1 text-[#6B756F] hover:bg-[#F0F2EF] disabled:opacity-30" disabled={i === items.length - 1}>↓</button>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label="Remove" className="rounded-md px-1.5 py-1 text-red-500 hover:bg-red-50">✕</button>
            </div>
          </div>
          {open === i && (
            <div className="grid gap-3 border-t border-[#EEF0EC] bg-[#FAFBF9] p-3 sm:grid-cols-2">
              {fields.map((f) =>
                f.type === "image" ? (
                  <ImageField key={f.key} label={f.label} value={item[f.key] ?? ""} onChange={(v) => update(i, f.key, v)} />
                ) : (
                <Field key={f.key} label={f.label} hint={f.hint} className={f.type === "textarea" ? "sm:col-span-2" : undefined}>
                  {(id) =>
                    f.type === "textarea" ? (
                      <TextArea id={id} rows={f.rows ?? 3} value={item[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} />
                    ) : (
                      <TextInput id={id} value={item[f.key] ?? ""} onChange={(e) => update(i, f.key, e.target.value)} />
                    )
                  }
                </Field>
                ),
              )}
            </div>
          )}
        </div>
      ))}
      <Btn
        icon="tag"
        onClick={() => {
          onChange([...items, { ...blank }]);
          setOpen(items.length);
        }}
      >
        Add item
      </Btn>
    </div>
  );
}
