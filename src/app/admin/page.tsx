import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { AdminDashboard } from "@/components/sections/AdminDashboard";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect("/login?next=/admin");

  return <AdminDashboard adminName={admin.name} />;
}
