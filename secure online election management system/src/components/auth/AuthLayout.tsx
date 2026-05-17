import { Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-background"
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-2 text-white">
            <Shield className="size-6" />
            <span className="text-xl font-semibold">SecureVote</span>
          </Link>
        </div>
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold text-white leading-tight">
            Democracy deserves enterprise-grade security.
          </h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Anonymous ballots. Immutable audits. Real-time transparency.
          </p>
        </div>
        <p className="relative z-10 text-sm text-white/50">
          Trusted by organizations worldwide
        </p>
      </div>

      <div className="flex flex-col justify-center p-6 sm:p-12 relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mx-auto w-full max-w-md"
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}

