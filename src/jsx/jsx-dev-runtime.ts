// Development twin of ./jsx-runtime.ts.
import * as React from "react/jsx-dev-runtime";
import { applyEdits } from "./edits";

export { Fragment } from "react/jsx-dev-runtime";
export type { JSX } from "react/jsx-dev-runtime";

type DevArgs = Parameters<typeof React.jsxDEV>;

export function jsxDEV(type: DevArgs[0], props: DevArgs[1], ...rest: DevArgs extends [unknown, unknown, ...infer R] ? R : never) {
  return React.jsxDEV(type, applyEdits(type, props as Record<string, unknown>) as DevArgs[1], ...rest);
}
