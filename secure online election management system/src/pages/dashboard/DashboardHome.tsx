import { Link } from 'react-router-dom'
import { Users, Vote, Activity, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { StatCard } from '@/components/dashboard/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VoteChart } from '@/components/charts/VoteChart'
import { DEMO_STATS } from '@/lib/demo-data'

const chartData = [
  { name: 'Alice', votes: 142 },
  { name: 'Bob', votes: 98 },
  { name: 'Carol', votes: 76 },
  { name: 'Dan', votes: 54 },
]

export function DashboardHome() {
  const { profile } = useAuthStore()
  const role = profile?.role ?? 'voter'

  if (role === 'super_admin') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin overview</h1>
          <p className="text-muted-foreground">Platform health and pending actions</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total users" value={DEMO_STATS.total_users} icon={Users} delay={0} />
          <StatCard title="Elections" value={DEMO_STATS.total_elections} icon={Vote} delay={0.05} />
          <StatCard
            title="Active elections"
            value={DEMO_STATS.active_elections}
            icon={Activity}
            delay={0.1}
          />
          <StatCard
            title="Pending approvals"
            value={3}
            icon={ClipboardList}
            delay={0.15}
            trend="Requires review"
          />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Vote distribution (sample)</CardTitle>
          </CardHeader>
          <CardContent>
            <VoteChart data={chartData} />
          </CardContent>
        </Card>
        <Button asChild>
          <Link to="/dashboard/approvals">Review approval queue</Link>
        </Button>
      </div>
    )
  }

  if (role === 'election_creator') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Creator dashboard</h1>
            <p className="text-muted-foreground">Manage your elections and analytics</p>
          </div>
          <Button variant="gradient" asChild>
            <Link to="/dashboard/create">Create election</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard title="My elections" value={4} icon={Vote} />
          <StatCard title="Active" value={1} icon={Activity} />
          <StatCard title="Total votes" value={312} icon={Users} trend="+12% this week" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Latest results</CardTitle>
          </CardHeader>
          <CardContent>
            <VoteChart data={chartData} />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome, {profile?.full_name?.split(' ')[0] ?? 'Voter'}
        </h1>
        <p className="text-muted-foreground">Your elections and voting status</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard title="Joined elections" value={2} icon={Vote} />
        <StatCard title="Votes cast" value={1} icon={Activity} subtitle="1 pending" />
      </div>
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Browse elections to register and vote</p>
          <Button asChild>
            <Link to="/elections">Browse elections</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}