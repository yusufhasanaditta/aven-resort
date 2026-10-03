/**
 * Site-wide text and image edits made in the page editor, applied as React
 * elements are created — on the server and in the browser alike, so a page
 * is rendered once, with the edits, and hydrates without a mismatch.
 *
 * Text is matched on the whole string a component renders ("Our story", a
 * paragraph…), ignoring surrounding spaces; images on their exact `src`.
 * The map lives on globalThis: the server keeps it fresh (src/lib/site-edits.ts)
 * and the browser receives it from the root layout (SiteEditsBridge).
 */

export type SiteEditMap = { text: Record<string, string>; images: Record<string, string> };

declare global {
  var __avenEdits: SiteEditMap | undefined;
}

/** Elements whose children are code or form state, never page copy. */
const SKIP = new Set(["script", "style", "textarea", "title", "noscript"]);

const has = Object.prototype.hasOwnProperty;

function swapText(s: string, text: Record<string, string>): string {
  const key = s.trim();
  if (!key || !has.call(text, key)) return s;
  const value = text[key];
  return key === s ? value : s.replace(key, () => value);
}

function swapChildren(children: unknown, text: Record<string, string>): unknown {
  if (typeof children === "string") return swapText(children, text);
  if (!Array.isArray(children)) return children;
  let out: unknown[] | null = null;
  for (let i = 0; i < children.length; i++) {
    const c = children[i];
    const next = typeof c === "string" || Array.isArray(c) ? swapChildren(c, text) : c;
    if (next !== c) {
      out ??= children.slice();
      out[i] = next;
    }
  }
  return out ?? children;
}

/** The props an element is really created with. Untouched (same object) when nothing applies. */
export function applyEdits(type: unknown, props: Record<string, unknown> | null | undefined) {
  const edits = globalThis.__avenEdits;
  if (!edits || !props) return props;
  let out = props;

  if (typeof type === "string" && "children" in props && !SKIP.has(type)) {
    const children = swapChildren(props.children, edits.text);
    if (children !== props.children) out = { ...out, children };
  }
  if (typeof props.src === "string" && has.call(edits.images, props.src)) {
    out = { ...out, src: edits.images[props.src] };
  }
  return out;
}

const isEmpty = (m: SiteEditMap) => Object.keys(m.text).length === 0 && Object.keys(m.images).length === 0;

/** Makes `map` the edits every element from now on is created with. */
export function installEdits(map: SiteEditMap) {
  globalThis.__avenEdits = isEmpty(map) ? undefined : map;
}

/** A string with the page editor's text edits applied — for components that cut text up before rendering it. */
export function editText(s: string): string {
  const edits = globalThis.__avenEdits;
  return edits ? swapText(s, edits.text) : s;
}
