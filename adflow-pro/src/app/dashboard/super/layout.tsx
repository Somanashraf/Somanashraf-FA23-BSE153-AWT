import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function SuperLayout({ children }: { children: React.ReactNode }) {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard/super");
  if (s.role !== "super_admin") redirect("/dashboard");
  return children;
}
