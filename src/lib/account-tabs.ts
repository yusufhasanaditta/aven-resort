/** The shareholder dashboard's tabs — shared by the server page (to read `?tab=`) and the client shell. */
export const accountTabs = [
  { id: "overview", label: "Overview", icon: "overview" },
  { id: "holdings", label: "My holdings", icon: "layers" },
  { id: "invoices", label: "Payments", icon: "invoice" },
  { id: "applications", label: "Applications", icon: "layers" },
  { id: "buy", label: "Buy shares", icon: "cart" },
  { id: "profile", label: "Profile", icon: "user" },
] as const;

export type AccountTabId = (typeof accountTabs)[number]["id"];

export function isAccountTab(v: unknown): v is AccountTabId {
  return accountTabs.some((t) => t.id === v);
}
