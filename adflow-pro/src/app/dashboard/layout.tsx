import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { DashboardNotifications } from "@/components/dashboard/DashboardNotifications";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const role = session?.role;

  const links: { href: string; label: string; roles: string[] }[] = [
    { href: "/dashboard/client", label: "Client", roles: ["client"] },
    {
      href: "/dashboard/moderator",
      label: "Moderator",
      roles: ["moderator", "admin", "super_admin"],
    },
    {
      href: "/dashboard/admin",
      label: "Admin",
      roles: ["admin", "super_admin"],
    },
    { href: "/dashboard/super", label: "Super admin", roles: ["super_admin"] },
    {
      href: "/dashboard/analytics",
      label: "Analytics",
      roles: ["admin", "super_admin"],
    },
    {
      href: "/dashboard/health",
      label: "System health",
      roles: ["admin", "super_admin"],
    },
    {
      href: "/dashboard/users",
      label: "Users",
      roles: ["admin", "super_admin"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100">
      <div className="border-b border-white/10 bg-[#070b14]/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link href="/" className="text-sm font-semibold text-teal-300">
            ← AdFlow Pro
          </Link>
          <nav className="flex flex-wrap gap-2 text-xs">
            {links
              .filter((l) => role && l.roles.includes(role))
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full border border-white/10 px-3 py-1 text-slate-300 hover:border-teal-400/40 hover:text-white"
                >
                  {l.label}
                </Link>
              ))}
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">
              {session?.email} · {session?.role}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <DashboardNotifications />
        {children}
      </div>
    </div>
  );
}
