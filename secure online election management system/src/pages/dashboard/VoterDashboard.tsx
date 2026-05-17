import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Vote, Eye, EyeOff, CheckCircle2, Clock, PlayCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type RegistrationWithElection = {
  id: string
  status: string
  elections: {
    id: string
    title: string
    status: string
    end_date: string
  }
}

type SecretIdEntry = {
  id: string
  secret_code: string
  is_used: boolean
  poll_id: string
  registration_id: string
  polls: {
    title: string
  }
}

export function VoterDashboard() {
  const { user } = useAuthStore()
  const [registrations, setRegistrations] = useState<RegistrationWithElection[]>([])
  const [secretIds, setSecretIds] = useState<SecretIdEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      setLoading(true)
      
      // Fetch registrations with election details
      const { data: regData } = await supabase
        .from('voter_registrations')
        .select('id, status, elections(id, title, status, end_date)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const registrations = (regData ?? []) as unknown as RegistrationWithElection[]
      setRegistrations(registrations)
      
      const regIds = registrations.map((r: RegistrationWithElection) => r.id)
      if (regIds.length > 0) {
        // Fetch secret IDs for these registrations
        const { data: secretData } = await supabase
          .from('secret_ids')
          .select('id, secret_code, is_used, poll_id, registration_id, polls(title)')
          .in('registration_id', regIds)
        
        const secrets = (secretData ?? []) as unknown as SecretIdEntry[]
        setSecretIds(secrets)
      }
      setLoading(false)
    }

    void loadData()
  }, [user])

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maskSecretCode = (code: string) => {
    if (!code || code.length < 5) return '****'
    return `****${code.slice(-4)}`
  }

  if (loading) {
    return <div className="flex justify-center p-8 text-muted-foreground">Loading your voter data...</div>
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold">My joined elections</h1>
        <p className="text-muted-foreground mt-1">Manage your voting status and view your secret IDs</p>
      </div>

      {registrations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You haven't joined any elections yet.
            <div className="mt-4">
              <Button asChild><Link to="/elections">Browse Elections</Link></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {registrations.map(reg => {
            const election = reg.elections
            if (!election) return null
            
            const electionSecrets = secretIds.filter(s => s.registration_id === reg.id)
            const isVotingActive = election.status === 'active'
            const isCompleted = election.status === 'completed'
            
            return (
              <motion.div
                key={reg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-xl">
                        <Link to={`/elections/${election.id}`} className="hover:underline">
                          {election.title}
                        </Link>
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={
                          reg.status === 'finalized' ? 'default' : 
                          reg.status === 'waitlisted' ? 'secondary' : 'outline'
                        }>
                          Registration: {reg.status}
                        </Badge>
                        <Badge variant={isVotingActive ? 'default' : 'secondary'} className="capitalize">
                          Election: {election.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {isVotingActive && reg.status === 'finalized' && (
                        <Button asChild size="sm">
                          <Link to={`/vote/${election.id}`}>
                            <PlayCircle className="size-4 mr-1.5" /> Cast Vote
                          </Link>
                        </Button>
                      )}
                      {isCompleted && (
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/elections/${election.id}/results`}>
                            View Results
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {electionSecrets.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Vote className="size-4 text-primary" /> Your Secret Voter IDs
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {electionSecrets.map(secret => (
                            <div key={secret.id} className="p-3 bg-muted/40 rounded-xl border border-border/50 flex flex-col gap-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">{secret.polls?.title || 'Poll'}</span>
                                {secret.is_used ? (
                                  <Badge variant="secondary" className="text-xs text-success bg-success/10"><CheckCircle2 className="size-3 mr-1"/> Voted</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs"><Clock className="size-3 mr-1"/> Pending</Badge>
                                )}
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <code className="text-sm font-mono bg-background px-2 py-1 rounded border">
                                  {revealedIds[secret.id] ? secret.secret_code : maskSecretCode(secret.secret_code)}
                                </code>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleReveal(secret.id)}>
                                  {revealedIds[secret.id] ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-muted/30 rounded-xl border border-border/50 text-sm text-muted-foreground text-center">
                        {reg.status === 'finalized' 
                          ? 'Your secret IDs have not been generated yet. You will receive an email once they are ready.'
                          : 'Your registration must be finalized by the admin before secret IDs are generated.'}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
