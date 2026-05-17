import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { supabase } from '@/lib/supabase'
import { formatCountdown } from '@/lib/utils'
import { useElection } from '@/hooks/useElections'
import type { Poll, Candidate } from '@/types/database'

export function VotePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { election, loading: electionLoading } = useElection(id)
  
  const [polls, setPolls] = useState<Poll[]>([])
  const [candidatesByPoll, setCandidatesByPoll] = useState<Record<string, Candidate[]>>({})
  const [loading, setLoading] = useState(true)
  
  const [activePollId, setActivePollId] = useState<string>('')
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [secretId, setSecretId] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [votedPolls, setVotedPolls] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return

    const loadData = async () => {
      setLoading(true)
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('election_id', id!)
        .order('order_index')
        
      if (pollData && pollData.length > 0) {
        setPolls(pollData as Poll[])
        setActivePollId(pollData[0].id)
        
        const candsMap: Record<string, Candidate[]> = {}
        for (const p of pollData) {
          const { data: cands } = await supabase
            .from('candidates')
            .select('*')
            .eq('poll_id', p.id)
            .order('order_index')
          candsMap[p.id] = (cands as Candidate[]) || []
        }
        setCandidatesByPoll(candsMap)
      }
      setLoading(false)
    }

    void loadData()
  }, [id])

  const submitVote = async () => {
    if (!selectedCandidate) {
      toast.error('Select a candidate')
      return
    }
    if (!secretId.trim()) {
      toast.error('Enter your secret voter ID')
      return
    }
    if (!confirmed) {
      setConfirmed(true)
      return
    }

    setSubmitting(true)
    const { data: result, error } = await supabase.functions.invoke('cast-vote', {
      body: {
        secretCode: secretId,
        candidateId: selectedCandidate,
        pollId: activePollId,
      },
    })

    setSubmitting(false)

    if (error || result?.error) {
      toast.error(result?.error ?? error?.message ?? 'Failed to cast vote')
      setConfirmed(false)
      return
    }
    
    setVotedPolls(prev => ({ ...prev, [activePollId]: true }))
    setConfirmed(false)
    setSecretId('')
    setSelectedCandidate(null)
    toast.success('Vote recorded successfully!')
    
    // Find next unvoted poll
    const nextPoll = polls.find(p => p.id !== activePollId && !votedPolls[p.id])
    if (nextPoll) {
      setTimeout(() => setActivePollId(nextPoll.id), 1500)
    }
  }

  if (electionLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading ballot...</div>
  }

  if (!election || election.status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="size-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Election unavailable</h1>
          <p className="text-muted-foreground mt-2">This election is not currently active for voting.</p>
          <Button className="mt-8" onClick={() => navigate('/')}>Return home</Button>
        </div>
      </div>
    )
  }

  const allVoted = polls.length > 0 && polls.every(p => votedPolls[p.id])

  if (allVoted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <CheckCircle2 className="size-16 text-success mx-auto mb-4" />
          <h1 className="text-2xl font-bold">All Votes Recorded</h1>
          <p className="text-muted-foreground mt-2">Your anonymous ballots have been secured for all polls. Thank you for participating!</p>
          <Button className="mt-8" onClick={() => navigate('/dashboard/my-votes')}>View My Dashboard</Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-3xl mx-auto pt-24 pb-16 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Shield className="size-4" /> Secure anonymous ballot
          <span className="ml-auto">Ends in {formatCountdown(election.end_date)}</span>
        </div>

        <h1 className="text-2xl font-bold mb-8">{election.title}</h1>

        <Tabs value={activePollId} onValueChange={(v) => {
          setActivePollId(v)
          setConfirmed(false)
          setSelectedCandidate(null)
          setSecretId('')
        }}>
          <TabsList className="mb-6 flex-wrap h-auto w-full justify-start overflow-x-auto">
            {polls.map((poll) => (
              <TabsTrigger 
                key={poll.id} 
                value={poll.id} 
                className="flex gap-2"
              >
                {poll.title}
                {votedPolls[poll.id] && <CheckCircle2 className="size-3.5 text-success" />}
              </TabsTrigger>
            ))}
          </TabsList>

          {polls.map((poll) => {
            const candidates = candidatesByPoll[poll.id] || []
            const isVoted = votedPolls[poll.id]

            return (
              <TabsContent key={poll.id} value={poll.id} className="focus:outline-none">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold">{poll.title}</h2>
                  {poll.description && <p className="text-muted-foreground text-sm mt-1">{poll.description}</p>}
                </div>

                {isVoted ? (
                  <Card className="bg-success/5 border-success/20">
                    <CardContent className="p-8 text-center">
                      <CheckCircle2 className="size-12 text-success mx-auto mb-3" />
                      <h3 className="text-lg font-medium">Vote cast successfully</h3>
                      <p className="text-muted-foreground text-sm mt-1">Your vote for {poll.title} has been recorded securely.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <AnimatePresence mode="wait">
                    {!confirmed ? (
                      <motion.div key="selection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-4 mb-8">
                          {candidates.length === 0 && (
                            <p className="text-muted-foreground text-sm">No candidates available for this poll.</p>
                          )}
                          {candidates.map((c) => (
                            <Card
                              key={c.id}
                              className={`cursor-pointer transition-all hover:border-primary/50 ${
                                selectedCandidate === c.id ? 'ring-2 ring-primary glow-primary bg-primary/5' : ''
                              }`}
                              onClick={() => setSelectedCandidate(c.id)}
                            >
                              <CardContent className="p-4 flex items-center gap-4">
                                <div className="size-12 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-semibold flex-shrink-0">
                                  {c.name[0]}
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium">{c.name}</p>
                                  {c.designation && <p className="text-sm text-muted-foreground">{c.designation}</p>}
                                  {c.manifesto && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.manifesto}</p>}
                                </div>
                                <div className={`size-5 rounded-full border flex items-center justify-center ${selectedCandidate === c.id ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                                  {selectedCandidate === c.id && <div className="size-2 rounded-full bg-primary-foreground" />}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                        <div className="mb-6 bg-card p-4 rounded-xl border">
                          <Label>Secret voter ID for {poll.title}</Label>
                          <p className="text-xs text-muted-foreground mb-2">Check your dashboard or email for your poll-specific secret ID.</p>
                          <Input
                            placeholder="e.g. POLL-1-XXXX-XXXX"
                            className="font-mono"
                            value={secretId}
                            onChange={e => setSecretId(e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="gradient" 
                          className="w-full" 
                          onClick={() => {
                            if (!selectedCandidate) toast.error("Please select a candidate")
                            else if (!secretId.trim()) toast.error("Please enter your secret ID")
                            else setConfirmed(true)
                          }}
                          disabled={candidates.length === 0}
                        >
                          Review ballot
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div key="confirmation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Card className="p-8 text-center space-y-6">
                          <div>
                            <AlertCircle className="size-12 text-accent mx-auto mb-3" />
                            <h3 className="text-lg font-bold">Confirm your selection</h3>
                            <p className="text-muted-foreground text-sm mt-1">
                              This action cannot be undone. You are casting an anonymous vote for {poll.title}.
                            </p>
                          </div>
                          
                          <div className="bg-muted/40 p-4 rounded-xl">
                            <p className="text-sm text-muted-foreground mb-1">Selected Candidate:</p>
                            <p className="font-semibold text-xl">
                              {candidates.find((c) => c.id === selectedCandidate)?.name}
                            </p>
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setConfirmed(false)} disabled={submitting}>
                              Go back
                            </Button>
                            <Button variant="gradient" className="flex-1" onClick={submitVote} disabled={submitting}>
                              {submitting ? 'Casting vote...' : 'Confirm vote'}
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
