import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function ClientDashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const s = await getSession();
  if (!s) redirect("/login?next=/dashboard/client");
  if (s.role !== "client") redirect("/dashboard");
  return children;
}
