import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield,
  Lock,
  Eye,
  Zap,
  ArrowRight,
  Search,
  BarChart3,
  Fingerprint,
} from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ElectionCard } from '@/components/elections/ElectionCard'
import { useElections } from '@/hooks/useElections'
import { DEMO_STATS, isDemoMode } from '@/lib/demo-data'
import { Skeleton } from '@/components/ui/skeleton'

export function LandingPage() {
  const [search, setSearch] = useState('')
  const { elections, loading } = useElections({ search: search || undefined })
  const active = elections.filter((e) => e.status === 'active')
  const upcoming = elections.filter((e) =>
    ['published', 'registration_open'].includes(e.status),
  )
  const completed = elections.filter((e) => e.status === 'completed')

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/20 blur-[120px]"
          />
        </div>
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Shield className="size-3.5" /> Enterprise election infrastructure
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.1]">
              Secure elections.
              <br />
              <span className="text-gradient">Built for trust.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              SecureVote delivers anonymous voting, real-time analytics, and immutable audit
              trails — the modern platform for organizations that take democracy seriously.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gradient" size="lg" asChild>
                <Link to="/elections">
                  Browse elections <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/apply">Request creator access</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-12 border-y border-border/60 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Registered voters', value: DEMO_STATS.total_users.toLocaleString() },
            { label: 'Elections hosted', value: DEMO_STATS.total_elections.toLocaleString() },
            { label: 'Active now', value: DEMO_STATS.active_elections.toLocaleString() },
            { label: 'Votes cast', value: DEMO_STATS.total_votes.toLocaleString() },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <p className="text-3xl font-bold text-gradient">{s.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
        {isDemoMode() && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Demo statistics — connect Supabase for live data
          </p>
        )}
      </section>

      <section id="elections" className="py-24 px-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Elections</h2>
              <p className="text-muted-foreground mt-2">
                Discover active, upcoming, and completed polls
              </p>
            </div>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search elections..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-success animate-pulse" />
                    Live now
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {active.map((e, i) => (
                      <ElectionCard key={e.id} election={e} index={i} />
                    ))}
                  </div>
                </div>
              )}
              {upcoming.length > 0 && (
                <div className="mb-16">
                  <h3 className="text-lg font-semibold mb-6">Upcoming</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {upcoming.map((e, i) => (
                      <ElectionCard key={e.id} election={e} index={i} />
                    ))}
                  </div>
                </div>
              )}
              {completed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-6">Completed</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {completed.map((e, i) => (
                      <ElectionCard key={e.id} election={e} index={i} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <section id="security" className="py-24 px-4 bg-muted/20">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-4">Security by design</h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-16">
            Every layer is engineered for integrity, anonymity, and verifiability.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Lock, title: 'Anonymous votes', desc: 'Votes never linked to identity' },
              { icon: Fingerprint, title: 'Secret IDs', desc: 'One-time ballot credentials' },
              { icon: Eye, title: 'Full audit trail', desc: 'Every action logged immutably' },
              { icon: Zap, title: 'Real-time RLS', desc: 'Row-level security on Postgres' },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="glass rounded-2xl p-6 hover:shadow-xl transition-shadow"
              >
                <item.icon className="size-8 text-primary mb-4" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="transparency" className="py-24 px-4">
        <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold">Transparency dashboard</h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Admins and the public can verify process integrity through exportable audit logs,
              live turnout metrics, and blockchain-style event chains — without compromising
              voter anonymity.
            </p>
            <Button className="mt-8" variant="gradient" asChild>
              <Link to="/login">Access dashboard</Link>
            </Button>
          </div>
          <div className="glass rounded-2xl p-6 glow-primary">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="size-5 text-primary" />
              <span className="font-medium">Live turnout</span>
            </div>
            <div className="space-y-3">
              {['Poll A', 'Poll B', 'Poll C'].map((p, i) => (
                <div key={p}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{p}</span>
                    <span className="text-muted-foreground">{72 - i * 12}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${72 - i * 12}%` }}
                      viewport={{ once: true }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
