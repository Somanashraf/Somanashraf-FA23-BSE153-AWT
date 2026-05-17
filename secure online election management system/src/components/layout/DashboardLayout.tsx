import { Link, Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Vote,
  Users,
  FileText,
  Settings,
  Bell,
  PlusCircle,
  Shield,
  ScrollText,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuthStore } from '@/stores/auth-store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import type { UserRole } from '@/types/database'

const navByRole: Record<UserRole, { to: string; label: string; icon: typeof LayoutDashboard }[]> = {
  super_admin: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/approvals', label: 'Approvals', icon: ClipboardList },
    { to: '/dashboard/elections', label: 'Elections', icon: Vote },
    { to: '/dashboard/audit', label: 'Audit logs', icon: ScrollText },
    { to: '/dashboard/users', label: 'Users', icon: Users },
  ],
  election_creator: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/elections', label: 'My elections', icon: Vote },
    { to: '/dashboard/create', label: 'Create', icon: PlusCircle },
    { to: '/dashboard/analytics', label: 'Analytics', icon: FileText },
  ],
  voter: [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/dashboard/my-votes', label: 'My votes', icon: Vote },
    { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  ],
}

export function DashboardLayout() {
  const location = useLocation()
  const { profile, signOut } = useAuthStore()
  const role = profile?.role ?? 'voter'
  const nav = navByRole[role]

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-border glass lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <Shield className="size-5 text-primary" />
          <span className="font-semibold">SecureVote</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map((item) => {
            const active = location.pathname === item.to
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar className="size-9">
              <AvatarImage src={profile?.avatar_url ?? undefined} />
              <AvatarFallback>
                {profile?.full_name?.[0]?.toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.full_name}</p>
              <p className="truncate text-xs text-muted-foreground capitalize">
                {role.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="mt-2 w-full justify-start" asChild>
            <Link to="/dashboard/settings">
              <Settings className="size-4 mr-2" /> Settings
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={() => signOut()}
          >
            Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 lg:px-8 glass">
          <div className="lg:hidden flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <span className="font-semibold text-sm">SecureVote</span>
          </div>
          <p className="hidden text-sm text-muted-foreground lg:block">
            {nav.find((n) => n.to === location.pathname)?.label ?? 'Dashboard'}
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" asChild>
              <Link to="/dashboard/notifications">
                <Bell className="size-4" />
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  )
}
