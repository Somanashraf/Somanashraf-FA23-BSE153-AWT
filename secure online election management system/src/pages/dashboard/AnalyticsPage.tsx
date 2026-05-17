import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Users, Vote, CalendarDays, TrendingUp } from 'lucide-react'

type AnalyticsChartData = {
  name: string
  Registered: number
  Voted: number
  Max: number
}

export function AnalyticsPage() {
  const { user, profile } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalElections: 0,
    totalVoters: 0,
    totalVotes: 0,
    activeElections: 0
  })
  const [chartData, setChartData] = useState<AnalyticsChartData[]>([])

  useEffect(() => {
    if (!user) return

    const loadAnalytics = async () => {
      setLoading(true)
      
      // Fetch user's elections
      let query = supabase.from('elections').select('id, title, status, registered_count, vote_count, max_voters')
      
      if (profile?.role !== 'super_admin') {
        query = query.eq('creator_id', user.id)
      }

      const { data: elections } = await query

      if (elections) {
        const totalVoters = elections.reduce((sum, e) => sum + e.registered_count, 0)
        const totalVotes = elections.reduce((sum, e) => sum + e.vote_count, 0)
        const activeElections = elections.filter(e => e.status === 'active').length

        setStats({
          totalElections: elections.length,
          totalVoters,
          totalVotes,
          activeElections
        })

        // Prepare chart data for top 5 elections by participation
        const chart = elections
          .map(e => ({
            name: e.title.length > 15 ? e.title.substring(0, 15) + '...' : e.title,
            Registered: e.registered_count,
            Voted: e.vote_count,
            Max: e.max_voters
          }))
          .sort((a, b) => b.Registered - a.Registered)
          .slice(0, 5)

        setChartData(chart)
      }
      
      setLoading(false)
    }

    void loadAnalytics()
  }, [user, profile?.role])

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#ffc658']

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading analytics...</div>

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground mt-1">View participation statistics and election trends</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Elections</CardTitle>
            <CalendarDays className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalElections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Elections</CardTitle>
            <TrendingUp className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeElections}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Registered Voters</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVoters}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
            <Vote className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVotes}</div>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Top Elections Participation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                    <YAxis fontSize={12} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))'}} />
                    <Bar dataKey="Registered" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Voted" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Voter Turnout Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Voted', value: stats.totalVotes },
                        { name: 'Registered (Not Voted)', value: stats.totalVoters - stats.totalVotes }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[{ name: 'Voted' }, { name: 'Registered (Not Voted)' }].map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-sm mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" /> Voted
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" /> Pending
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
