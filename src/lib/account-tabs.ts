/** The shareholder dashboard's tabs — shared by the server page (to read `?tab=`) and the client shell. */
export const accountTabs = [
  { id: "overview", label: "Overview", short: "Home", icon: "overview" },
  { id: "holdings", label: "My holdings", short: "Holdings", icon: "layers" },
  { id: "invoices", label: "Payments", short: "Payments", icon: "invoice" },
  { id: "applications", label: "Applications", short: "Apply", icon: "calendar" },
  { id: "buy", label: "Buy shares", short: "Buy", icon: "cart" },
  { id: "profile", label: "Profile", short: "Profile", icon: "user" },
] as const;

export type AccountTabId = (typeof accountTabs)[number]["id"];

export function isAccountTab(v: unknown): v is AccountTabId {
  return accountTabs.some((t) => t.id === v);
}
