import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard/admin");
  if (!["admin", "super_admin"].includes(s.role)) redirect("/dashboard");
  return children;
}
