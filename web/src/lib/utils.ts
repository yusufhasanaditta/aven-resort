export type ClassValue =
  | string
  | number
  | null
  | false
  | undefined
  | ClassValue[];

/** Minimal class-name joiner. No runtime dependency needed for this project. */
export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = cn(...value);
      if (nested) out.push(nested);
    } else {
      out.push(String(value));
    }
  }
  return out.join(" ");
}

/** 1 decimal = 435.6 sq ft. Used to render land figures consistently. */
export const SQFT_PER_DECIMAL = 435.6;

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDecimals(decimals: number): string {
  return `${decimals} dec`;
}

export function formatAcres(decimals: number): string {
  return `${(decimals / 100).toFixed(2)} acres`;
}
