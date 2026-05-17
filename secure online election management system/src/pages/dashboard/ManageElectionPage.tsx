import { useCallback, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Trash2, Edit2, Save, Play, Square, Users, ChevronDown, ChevronUp, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { promoteFromWaitlist } from '@/lib/waitlist'
import { electionSchema, candidateSchema, type ElectionInput, type CandidateInput } from '@/lib/validations'
import type { Election, Poll, Candidate } from '@/types/database'
import { format } from 'date-fns'

type RegistrationWithProfile = {
  id: string
  user_id: string
  profiles: {
    email: string
    full_name?: string
  } | null
}

type ElectionResultRow = {
  poll_id: string
  candidate_id: string
  vote_count: number
}

type VoterListEntry = {
  id: string
  user_id: string
  status: string
  profiles: { email: string; full_name?: string }
}

export function ManageElectionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [election, setElection] = useState<Election | null>(null)
  const [polls, setPolls] = useState<Poll[]>([])
  const [candidatesByPoll, setCandidatesByPoll] = useState<Record<string, Candidate[]>>({})
  const [loading, setLoading] = useState(true)
  const [expandedPoll, setExpandedPoll] = useState<string | null>(null)
  const [editingElection, setEditingElection] = useState(false)
  const [addingPoll, setAddingPoll] = useState(false)
  const [newPollTitle, setNewPollTitle] = useState('')
  const [newPollDesc, setNewPollDesc] = useState('')
  const [addingCandidatePoll, setAddingCandidatePoll] = useState<string | null>(null)
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null)
  const [voterList, setVoterList] = useState<VoterListEntry[]>([])
  const [showVoters, setShowVoters] = useState(false)
  const [statusLoading, setStatusLoading] = useState(false)

  const electionForm = useForm<ElectionInput>({
    resolver: zodResolver(electionSchema),
  })

  const candidateForm = useForm<CandidateInput>({
    resolver: zodResolver(candidateSchema),
    defaultValues: { name: '', designation: '', manifesto: '' },
  })

  const loadAll = useCallback(async () => {
    setLoading(true)
    const { data: el } = await supabase.from('elections').select('*').eq('id', id!).single()
    if (!el) { navigate('/dashboard/elections'); return }
    setElection(el as Election)
    electionForm.reset({
      title: el.title,
      description: el.description,
      category: el.category,
      startDate: el.start_date?.slice(0, 16),
      endDate: el.end_date?.slice(0, 16),
      registrationDeadline: el.registration_deadline?.slice(0, 16),
      maxVoters: el.max_voters,
    })

    const { data: pollData } = await supabase
      .from('polls').select('*').eq('election_id', id!).order('order_index')
    const pollList = (pollData ?? []) as Poll[]
    setPolls(pollList)

    const candMap: Record<string, Candidate[]> = {}
    for (const p of pollList) {
      const { data: cands } = await supabase
        .from('candidates').select('*').eq('poll_id', p.id).order('order_index')
      candMap[p.id] = (cands ?? []) as Candidate[]
    }
    setCandidatesByPoll(candMap)
    setLoading(false)
  }, [id, navigate, electionForm])

  async function saveElection(data: ElectionInput) {
    const { error } = await supabase.from('elections').update({
      title: data.title,
      description: data.description,
      category: data.category,
      start_date: data.startDate,
      end_date: data.endDate,
      registration_deadline: data.registrationDeadline,
      max_voters: data.maxVoters,
    }).eq('id', id!)
    if (error) { toast.error(error.message); return }
    await logAudit('election_updated', 'election', id!)
    toast.success('Election updated')
    setEditingElection(false)
    loadAll()
  }

  async function addPoll() {
    if (!newPollTitle.trim()) { toast.error('Poll title required'); return }
    const { error } = await supabase.from('polls').insert({
      election_id: id!,
      title: newPollTitle,
      description: newPollDesc || null,
      order_index: polls.length,
    })
    if (error) { toast.error(error.message); return }
    toast.success('Poll added')
    setNewPollTitle(''); setNewPollDesc(''); setAddingPoll(false)
    loadAll()
  }

  async function deletePoll(pollId: string) {
    if (!confirm('Delete this poll and all its candidates?')) return
    await supabase.from('polls').delete().eq('id', pollId)
    toast.success('Poll deleted')
    loadAll()
  }

  async function saveCandidate(data: CandidateInput) {
    if (editingCandidate) {
      const { error } = await supabase.from('candidates').update({
        name: data.name,
        designation: data.designation || null,
        manifesto: data.manifesto || null,
      }).eq('id', editingCandidate.id)
      if (error) { toast.error(error.message); return }
      toast.success('Candidate updated')
    } else {
      const pollId = addingCandidatePoll!
      const existing = candidatesByPoll[pollId] ?? []
      const { error } = await supabase.from('candidates').insert({
        poll_id: pollId,
        name: data.name,
        designation: data.designation || null,
        manifesto: data.manifesto || null,
        order_index: existing.length,
      })
      if (error) { toast.error(error.message); return }
      toast.success('Candidate added')
    }
    candidateForm.reset()
    setAddingCandidatePoll(null)
    setEditingCandidate(null)
    loadAll()
  }

  async function deleteCandidate(candidateId: string) {
    if (!confirm('Delete this candidate?')) return
    await supabase.from('candidates').delete().eq('id', candidateId)
    toast.success('Candidate deleted')
    loadAll()
  }

  async function changeStatus(newStatus: string) {
    setStatusLoading(true)
    const { error } = await supabase.from('elections').update({ status: newStatus }).eq('id', id!)
    if (error) { toast.error(error.message); setStatusLoading(false); return }
    await logAudit(`election_${newStatus}`, 'election', id!, { previous_status: election?.status })

    // Get all registered voters
    const { data: regs } = await supabase
      .from('voter_registrations')
      .select('user_id, profiles(email, full_name)')
      .eq('election_id', id!)
      .in('status', ['registered', 'finalized'])

    const registrationData = (regs ?? []) as unknown as RegistrationWithProfile[]

    // If starting election, send notifications and emails to all finalized voters
    if (newStatus === 'active' && registrationData.length > 0) {
      for (const reg of registrationData) {
        // Send notification
        await supabase.from('notifications').insert({
          user_id: reg.user_id,
          title: 'Voting has started!',
          message: `${election?.title} is now active. Use your secret ID to cast your vote.`,
          type: 'election_start',
          link: `/vote/${id}`,
        })

        // Send email
        await supabase.functions.invoke('send-email', {
          body: {
            to: reg.profiles?.email,
            type: 'election_start',
            subject: `${election?.title} - Voting is Now Open`,
            data: {
              election: election?.title ?? 'Election',
              link: `${window.location.origin}/vote/${id}`,
            },
          },
        }).catch((err) => console.error('Email send error:', err))
      }
      toast.success(`Election started! Notifications sent to ${registrationData.length} voters`)
    }

    // If completing election, send completion and winner emails
    if (newStatus === 'completed' && registrationData.length > 0) {
      for (const reg of registrationData) {
        // Send notification
        await supabase.from('notifications').insert({
          user_id: reg.user_id,
          title: 'Election completed',
          message: `${election?.title} has ended. View results on SecureVote.`,
          type: 'election_end',
          link: `/elections/${id}/results`,
        })

        // Send email
        await supabase.functions.invoke('send-email', {
          body: {
            to: reg.profiles?.email,
            type: 'election_end',
            subject: `${election?.title} - Results Available`,
            data: {
              election: election?.title ?? 'Election',
              link: `${window.location.origin}/elections/${id}/results`,
            },
          },
        }).catch((err) => console.error('Email send error:', err))
      }

      // Send winner email for each poll
      const { data: polls } = await supabase.from('polls').select('*').eq('election_id', id!)
      if (polls) {
        for (const poll of polls) {
          const { data: results } = await supabase.rpc('get_election_results', { election_uuid: id })
          const allResults = (results ?? []) as ElectionResultRow[]
          const pollResults = allResults.filter((r) => r.poll_id === poll.id)
          const winner = pollResults.sort((a, b) => b.vote_count - a.vote_count)[0]

          if (winner) {
            const { data: candidate } = await supabase.from('candidates').select('*').eq('id', winner.candidate_id).single()
            if (candidate) {
              // Notify all voters about the winner
              for (const reg of registrationData) {
                await supabase.from('notifications').insert({
                  user_id: reg.user_id,
                  title: `${poll.title} - Winner Announced`,
                  message: `${candidate.name} won the votes in ${poll.title}`,
                  type: 'winner',
                  link: `/elections/${id}/results`,
                })
              }
            }
          }
        }
      }

      toast.success(`Election completed! Results and notifications sent`)
    }

    if (newStatus !== 'active' && newStatus !== 'completed') {
      toast.success(`Election status: ${newStatus}`)
    }

    setStatusLoading(false)
    loadAll()
  }

  async function finalizeVoters() {
    if (!confirm('Finalize voter list? This will lock registrations and promote from waitlist if needed.')) return
    // Update all registered voters to finalized
    const { error } = await supabase
      .from('voter_registrations')
      .update({ status: 'finalized' })
      .eq('election_id', id!)
      .eq('status', 'registered')
    if (error) { toast.error(error.message); return }

    // Lock registration
    await supabase.from('elections').update({
      is_registration_locked: true,
      status: 'registration_closed',
    }).eq('id', id!)

    // Promote from waitlist if there are available seats
    const promoted = await promoteFromWaitlist(id!)

    await logAudit('voter_list_finalized', 'election', id!, { promoted: promoted ?? 0 })

    if (promoted && promoted > 0) {
      toast.success(`Voter list finalized. ${promoted} voters promoted from waitlist.`)
    } else {
      toast.success('Voter list finalized and locked')
    }

    loadAll()
  }

  async function generateSecretIds() {
    if (!confirm('Generate and email secret IDs to all finalized voters?')) return
    const { data: regs } = await supabase
      .from('voter_registrations')
      .select('id, user_id, profiles(email, full_name)')
      .eq('election_id', id!)
      .eq('status', 'finalized')

    const finalizedRegs = (regs ?? []) as unknown as RegistrationWithProfile[]
    if (finalizedRegs.length === 0) { toast.error('No finalized voters found'); return }

    let generated = 0
    for (const reg of finalizedRegs) {
      for (const poll of polls) {
        // Check if secret ID already exists
        const { data: existing } = await supabase
          .from('secret_ids')
          .select('id')
          .eq('registration_id', reg.id)
          .eq('poll_id', poll.id)
          .single()
        if (existing) continue

        // Generate unique secret code
        const code = `POLL-${poll.order_index + 1}-${String(Math.floor(Math.random() * 9000) + 1000)}-${Date.now().toString(36).toUpperCase().slice(-4)}`
        const { error } = await supabase.from('secret_ids').insert({
          registration_id: reg.id,
          poll_id: poll.id,
          secret_code: code,
          emailed_at: new Date().toISOString(),
        })
        if (!error) {
          // Send email
          await supabase.functions.invoke('send-email', {
            body: {
              to: reg.profiles?.email,
              type: 'secret_id',
              subject: `Your Secret Voter ID — ${election?.title}`,
              data: {
                name: reg.profiles?.full_name ?? 'Voter',
                election: election?.title ?? '',
                secretId: code,
                link: `${window.location.origin}/vote/${id}`,
              },
            },
          })
          // Add notification
          await supabase.from('notifications').insert({
            user_id: reg.user_id,
            title: 'Your Secret Voter ID is ready',
            message: `Your secret ID for "${election?.title}" has been sent to your email.`,
            type: 'secret_id',
            link: `/vote/${id}`,
          })
          generated++
        }
      }
    }
    await logAudit('secret_ids_generated', 'election', id!, { count: generated })
    toast.success(`${generated} secret IDs generated and emailed`)
  }

  async function loadVoters() {
    const { data } = await supabase
      .from('voter_registrations')
      .select('*, profiles(full_name, email)')
      .eq('election_id', id!)
      .order('created_at')
    setVoterList((data ?? []) as VoterListEntry[])
    setShowVoters(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>
  }

  if (!election) return null

  const canEdit = ['draft', 'published', 'registration_open'].includes(election.status)
  const canStart = election.status === 'registration_closed' && polls.length > 0
  const canStop = election.status === 'active'
  const canFinalize = election.status === 'registration_open' || election.status === 'registration_closed'

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{election.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={election.status === 'active' ? 'default' : 'secondary'}>
              {election.status.replace(/_/g, ' ')}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {election.registered_count}/{election.max_voters} registered
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/elections/${id}`}><Eye className="size-4 mr-1" />Preview</Link>
          </Button>
          {canStart && (
            <Button size="sm" onClick={() => changeStatus('active')} disabled={statusLoading}>
              <Play className="size-4 mr-1" />Start election
            </Button>
          )}
          {canStop && (
            <Button size="sm" variant="destructive" onClick={() => changeStatus('completed')} disabled={statusLoading}>
              <Square className="size-4 mr-1" />End election
            </Button>
          )}
        </div>
      </div>

      {/* Election Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Election details</CardTitle>
          {canEdit && (
            <Button variant="ghost" size="sm" onClick={() => setEditingElection(!editingElection)}>
              <Edit2 className="size-4 mr-1" />{editingElection ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingElection ? (
            <form onSubmit={electionForm.handleSubmit(saveElection)} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label>Title</Label>
                  <Input {...electionForm.register('title')} className="mt-1.5" />
                  {electionForm.formState.errors.title && (
                    <p className="text-xs text-destructive mt-1">{electionForm.formState.errors.title.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label>Description</Label>
                  <Textarea {...electionForm.register('description')} className="mt-1.5" rows={3} />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input {...electionForm.register('category')} className="mt-1.5" />
                </div>
                <div>
                  <Label>Max voters</Label>
                  <Input type="number" {...electionForm.register('maxVoters', { valueAsNumber: true })} className="mt-1.5" />
                </div>
                <div>
                  <Label>Start date</Label>
                  <Input type="datetime-local" {...electionForm.register('startDate')} className="mt-1.5" />
                </div>
                <div>
                  <Label>End date</Label>
                  <Input type="datetime-local" {...electionForm.register('endDate')} className="mt-1.5" />
                </div>
                <div>
                  <Label>Registration deadline</Label>
                  <Input type="datetime-local" {...electionForm.register('registrationDeadline')} className="mt-1.5" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm"><Save className="size-4 mr-1" />Save changes</Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditingElection(false)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Category:</span> <span className="ml-2 font-medium">{election.category}</span></div>
              <div><span className="text-muted-foreground">Max voters:</span> <span className="ml-2 font-medium">{election.max_voters}</span></div>
              <div><span className="text-muted-foreground">Start:</span> <span className="ml-2 font-medium">{format(new Date(election.start_date), 'PPp')}</span></div>
              <div><span className="text-muted-foreground">End:</span> <span className="ml-2 font-medium">{format(new Date(election.end_date), 'PPp')}</span></div>
              <div><span className="text-muted-foreground">Reg. deadline:</span> <span className="ml-2 font-medium">{format(new Date(election.registration_deadline), 'PPp')}</span></div>
              <div><span className="text-muted-foreground">Votes cast:</span> <span className="ml-2 font-medium">{election.vote_count}</span></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Voter Management */}
      <Card>
        <CardHeader>
          <CardTitle>Voter management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={loadVoters}>
              <Users className="size-4 mr-1" />View voter list ({election.registered_count})
            </Button>
            {canFinalize && (
              <Button variant="outline" size="sm" onClick={finalizeVoters}>
                Lock & finalize voter list
              </Button>
            )}
            {election.status === 'registration_closed' && (
              <Button size="sm" onClick={generateSecretIds}>
                Generate & email secret IDs
              </Button>
            )}
          </div>

          {showVoters && (
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="bg-muted/40 px-4 py-2 text-xs font-medium text-muted-foreground grid grid-cols-3">
                <span>Name</span><span>Email</span><span>Status</span>
              </div>
              <div className="divide-y divide-border max-h-64 overflow-y-auto">
                {voterList.length === 0 ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">No registrations yet</p>
                ) : voterList.map((v) => (
                  <div key={v.id} className="px-4 py-2.5 text-sm grid grid-cols-3 items-center">
                    <span className="font-medium truncate">{v.profiles?.full_name ?? '—'}</span>
                    <span className="text-muted-foreground truncate">{v.profiles?.email ?? '—'}</span>
                    <Badge variant={v.status === 'finalized' ? 'default' : v.status === 'waitlisted' ? 'secondary' : 'outline'} className="w-fit text-xs">
                      {v.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Polls & Candidates */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Polls & candidates</h2>
          {canEdit && (
            <Button size="sm" onClick={() => setAddingPoll(true)}>
              <Plus className="size-4 mr-1" />Add poll
            </Button>
          )}
        </div>

        {/* Add poll form */}
        <AnimatePresence>
          {addingPoll && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <Card className="border-primary/30">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <Label>Poll title</Label>
                    <Input value={newPollTitle} onChange={e => setNewPollTitle(e.target.value)} className="mt-1.5" placeholder="e.g. President" />
                  </div>
                  <div>
                    <Label>Description (optional)</Label>
                    <Input value={newPollDesc} onChange={e => setNewPollDesc(e.target.value)} className="mt-1.5" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addPoll}>Add poll</Button>
                    <Button size="sm" variant="ghost" onClick={() => { setAddingPoll(false); setNewPollTitle(''); setNewPollDesc('') }}>Cancel</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {polls.length === 0 && !addingPoll && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No polls yet. Add at least one poll to manage candidates.
            </CardContent>
          </Card>
        )}

        {polls.map((poll) => (
          <Card key={poll.id}>
            <CardHeader
              className="cursor-pointer select-none"
              onClick={() => setExpandedPoll(expandedPoll === poll.id ? null : poll.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {expandedPoll === poll.id ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  <CardTitle className="text-base">{poll.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {(candidatesByPoll[poll.id] ?? []).length} candidates
                  </Badge>
                </div>
                {canEdit && (
                  <Button
                    variant="ghost" size="icon"
                    onClick={(e) => { e.stopPropagation(); deletePoll(poll.id) }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
              {poll.description && <p className="text-sm text-muted-foreground ml-7">{poll.description}</p>}
            </CardHeader>

            <AnimatePresence>
              {expandedPoll === poll.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <CardContent className="pt-0 space-y-3">
                    <Separator />
                    {(candidatesByPoll[poll.id] ?? []).map((c) => (
                      <div key={c.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                        <div className="size-10 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                          {c.name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{c.name}</p>
                          {c.designation && <p className="text-sm text-muted-foreground">{c.designation}</p>}
                          {c.manifesto && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.manifesto}</p>}
                        </div>
                        {canEdit && (
                          <div className="flex gap-1 flex-shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => {
                              setEditingCandidate(c)
                              setAddingCandidatePoll(poll.id)
                              candidateForm.reset({ name: c.name, designation: c.designation ?? '', manifesto: c.manifesto ?? '' })
                            }}>
                              <Edit2 className="size-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteCandidate(c.id)}>
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add/Edit candidate form */}
                    <AnimatePresence>
                      {(addingCandidatePoll === poll.id) && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <form onSubmit={candidateForm.handleSubmit(saveCandidate)} className="space-y-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                            <p className="text-sm font-medium">{editingCandidate ? 'Edit candidate' : 'Add candidate'}</p>
                            <div className="grid sm:grid-cols-2 gap-3">
                              <div>
                                <Label className="text-xs">Name *</Label>
                                <Input {...candidateForm.register('name')} className="mt-1" placeholder="Full name" />
                                {candidateForm.formState.errors.name && (
                                  <p className="text-xs text-destructive mt-0.5">{String(candidateForm.formState.errors.name.message)}</p>
                                )}
                              </div>
                              <div>
                                <Label className="text-xs">Designation</Label>
                                <Input {...candidateForm.register('designation')} className="mt-1" placeholder="e.g. President" />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs">Manifesto / Description</Label>
                              <Textarea {...candidateForm.register('manifesto')} className="mt-1" rows={2} placeholder="Brief description..." />
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">{editingCandidate ? 'Update' : 'Add candidate'}</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => {
                                setAddingCandidatePoll(null)
                                setEditingCandidate(null)
                                candidateForm.reset()
                              }}>Cancel</Button>
                            </div>
                          </form>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {canEdit && addingCandidatePoll !== poll.id && (
                      <Button variant="outline" size="sm" className="w-full" onClick={() => {
                        setAddingCandidatePoll(poll.id)
                        setEditingCandidate(null)
                        candidateForm.reset()
                      }}>
                        <Plus className="size-4 mr-1" />Add candidate
                      </Button>
                    )}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>
    </div>
  )
}
