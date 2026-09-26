/** The admin console's sections — shared by the server page (to read `?tab=`) and the client shell. */
export const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: "overview", group: "Workspace" },
  { id: "leads", label: "Leads CRM", icon: "users", group: "Sales" },
  { id: "applications", label: "Applications", icon: "invoice", group: "Sales" },
  { id: "customers", label: "Shareholders", icon: "user", group: "Investors" },
  { id: "installments", label: "Instalments & dues", icon: "calendar", group: "Investors" },
  { id: "payments", label: "Payments & receipts", icon: "wallet", group: "Investors" },
  { id: "packages", label: "Packages", icon: "tag", group: "Catalogue" },
  { id: "content", label: "Website content", icon: "layers", group: "Website" },
  { id: "media", label: "Media library", icon: "image", group: "Website" },
  { id: "activity", label: "Activity log", icon: "overview", group: "System" },
] as const;

export type AdminTabId = (typeof ADMIN_TABS)[number]["id"];
export type TabFocus = { id?: string; filter?: string };

export function isAdminTab(v: unknown): v is AdminTabId {
  return ADMIN_TABS.some((t) => t.id === v);
}

