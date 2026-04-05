import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardHome() {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard");
  if (s.role === "client") redirect("/dashboard/client");
  if (s.role === "moderator") redirect("/dashboard/moderator");
  if (s.role === "admin") redirect("/dashboard/admin");
  if (s.role === "super_admin") redirect("/dashboard/super");
  redirect("/login");
}
