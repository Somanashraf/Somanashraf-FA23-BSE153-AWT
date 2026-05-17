import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Shield, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/#elections', label: 'Elections' },
  { href: '/#security', label: 'Security' },
  { href: '/#transparency', label: 'Transparency' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { user, profile, signOut } = useAuthStore()
  const isHome = location.pathname === '/'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        'fixed top-0 z-50 w-full transition-all duration-300',
        isHome ? 'border-b border-border/40 bg-background/60 backdrop-blur-xl' : 'glass border-b',
      )}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-lg group-hover:scale-105 transition-transform">
            <Shield className="size-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Secure<span className="text-gradient">Vote</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {user ? (
            <>
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
              <Button variant="gradient" asChild>
                <Link to="/signup">
                  Get started <ChevronRight className="size-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-2 p-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm hover:bg-muted"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              {user ? (
                <Link to="/dashboard" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                  Dashboard ({profile?.full_name ?? 'Account'})
                </Link>
              ) : (
                <>
                  <Link to="/login" className="rounded-lg px-3 py-2 text-sm hover:bg-muted">
                    Sign in
                  </Link>
                  <Link to="/signup">
                    <Button variant="gradient" className="w-full">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
