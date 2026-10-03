// The JSX runtime every component in src/ compiles to (tsconfig `jsxImportSource`):
// React's own, with the page editor's edits applied — see ./edits.ts.
import * as React from "react/jsx-runtime";
import { applyEdits } from "./edits";

export { Fragment } from "react/jsx-runtime";
export type { JSX } from "react/jsx-runtime";

type Args = Parameters<typeof React.jsx>;

export function jsx(type: Args[0], props: Args[1], key?: Args[2]) {
  return React.jsx(type, applyEdits(type, props as Record<string, unknown>) as Args[1], key);
}

export function jsxs(type: Args[0], props: Args[1], key?: Args[2]) {
  return React.jsxs(type, applyEdits(type, props as Record<string, unknown>) as Args[1], key);
}
