import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { isAdminTab } from "@/lib/admin-tabs";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: "Admin console", robots: { index: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?next=/admin");
  const { tab } = await searchParams;

  return <AdminShell adminName={admin.name} initialTab={isAdminTab(tab) ? tab : "overview"} />;
}
