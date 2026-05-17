import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Trophy, Users, Vote as VoteIcon, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useElection } from '@/hooks/useElections'
import { Navbar } from '@/components/layout/Navbar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Poll, Candidate } from '@/types/database'

type ElectionResult = {
  poll_id: string
  candidate_id: string
  vote_count: number
}

export function ResultsPage() {
  const { id } = useParams<{ id: string }>()
  const { election, loading: electionLoading } = useElection(id)
  
  const [polls, setPolls] = useState<Poll[]>([])
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [results, setResults] = useState<ElectionResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !election) return

    const loadResults = async () => {
      setLoading(true)

      // Fetch Polls
      const { data: pollData } = await supabase.from('polls').select('*').eq('election_id', id!).order('order_index')
      if (pollData) setPolls(pollData as Poll[])

      // Fetch Candidates
      const { data: candData } = await supabase.from('candidates').select('*').in('poll_id', (pollData || []).map(p => p.id))
      if (candData) setCandidates(candData as Candidate[])

      // Fetch Results using RPC (from 002_vote_rpc migration)
      // If RPC doesn't exist (fallback), we fetch from votes table if RLS allows (which it does via policy "Anyone can view vote aggregates via results table")
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_election_results', { election_uuid: id })
      
      if (rpcData && !rpcError) {
        setResults(rpcData as ElectionResult[])
      } else {
        const { data: votesData } = await supabase.from('votes').select('poll_id, candidate_id').in('poll_id', (pollData || []).map(p => p.id))
        if (votesData) {
          const grouped = votesData.reduce((acc: Record<string, ElectionResult>, vote: { poll_id: string; candidate_id: string }) => {
            const key = `${vote.poll_id}_${vote.candidate_id}`
            if (!acc[key]) acc[key] = { poll_id: vote.poll_id, candidate_id: vote.candidate_id, vote_count: 0 }
            acc[key].vote_count++
            return acc
          }, {} as Record<string, ElectionResult>)
          setResults(Object.values(grouped))
        }
      }

      setLoading(false)
    }

    void loadResults()
  }, [id, election])

  if (electionLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading results...</div>
  }

  if (!election) {
    return <div className="min-h-screen flex items-center justify-center">Election not found</div>
  }

  const isCompleted = election.status === 'completed'
  const turnoutPercent = election.registered_count > 0 
    ? Math.round((election.vote_count / election.registered_count) * 100) 
    : 0

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#ffc658', '#ff8042', '#00C49F']

  return (
    <div className="min-h-screen bg-muted/10">
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24 pb-16 px-4 space-y-8">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="rounded-full">
            <Link to={`/elections/${election.id}`}><ArrowLeft className="size-5" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{election.title}</h1>
              <Badge variant={isCompleted ? 'default' : 'secondary'}>
                {isCompleted ? 'Final Results' : 'Live Results'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Election Analytics and Turnout</p>
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Users className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registered Voters</p>
                <p className="text-2xl font-bold">{election.registered_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                <VoteIcon className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Votes</p>
                <p className="text-2xl font-bold">{election.vote_count}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="size-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                <Trophy className="size-6" />
              </div>
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-sm text-muted-foreground">Turnout</p>
                  <span className="text-sm font-semibold">{turnoutPercent}%</span>
                </div>
                <Progress value={turnoutPercent} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Poll Results */}
        <div className="space-y-8">
          {polls.map(poll => {
            const pollCandidates = candidates.filter(c => c.poll_id === poll.id)
            const pollResults = results.filter(r => r.poll_id === poll.id)
            const totalPollVotes = pollResults.reduce((sum, r) => sum + r.vote_count, 0)
            
            // Map results to candidates
            const chartData = pollCandidates.map(c => {
              const res = pollResults.find(r => r.candidate_id === c.id)
              return {
                name: c.name,
                votes: res ? Number(res.vote_count) : 0,
                percent: totalPollVotes > 0 ? ((res ? Number(res.vote_count) : 0) / totalPollVotes) * 100 : 0
              }
            }).sort((a, b) => b.votes - a.votes)

            const winner = chartData[0]

            return (
              <Card key={poll.id} className="overflow-hidden">
                <CardHeader className="bg-muted/30 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{poll.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{totalPollVotes} total votes cast</p>
                    </div>
                    {isCompleted && winner && winner.votes > 0 && (
                      <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 border-yellow-500">
                        <Trophy className="size-3.5 mr-1.5" /> {winner.name} Wins
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Bar Chart */}
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.2} />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={12} width={100} />
                          <Tooltip 
                            cursor={{fill: 'transparent'}} 
                            contentStyle={{backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))'}} 
                            formatter={(value) => [`${value ?? 0} votes`, 'Votes'] as [string, string]}
                          />
                          <Bar dataKey="votes" radius={[0, 4, 4, 0]} barSize={24}>
                            {chartData.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-4">
                      {chartData.map((c, i) => (
                        <div key={c.name} className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium flex items-center gap-2">
                              {isCompleted && i === 0 && c.votes > 0 && <Trophy className="size-3.5 text-yellow-500" />}
                              {c.name}
                            </span>
                            <span className="text-muted-foreground">
                              {c.votes} votes ({c.percent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${c.percent}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: COLORS[i % COLORS.length] }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {polls.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No polls available for this election.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
