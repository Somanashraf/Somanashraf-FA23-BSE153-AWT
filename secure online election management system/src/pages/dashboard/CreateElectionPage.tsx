import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { electionSchema, type ElectionInput } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'

const steps = ['Details', 'Schedule', 'Capacity', 'Review']

// Fields that belong to each step — used for per-step validation
const STEP_FIELDS: Array<(keyof ElectionInput)[]> = [
  ['title', 'description', 'category'],
  ['startDate', 'endDate', 'registrationDeadline'],
  ['maxVoters'],
  [],
]

// ── Demo-mode helpers ────────────────────────────────────────────────────────
const isDemoMode = () =>
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

/** Save election to localStorage when Supabase is unavailable */
function saveDemoElection(payload: Record<string, unknown>, status: string) {
  const id = `demo-local-${Date.now()}`
  const elections: Record<string, unknown>[] = JSON.parse(
    localStorage.getItem('demo_elections') ?? '[]',
  )
  elections.push({ id, ...payload, status, created_at: new Date().toISOString() })
  localStorage.setItem('demo_elections', JSON.stringify(elections))
  return id
}
// ────────────────────────────────────────────────────────────────────────────

export function CreateElectionPage() {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()
  const { user, profile } = useAuthStore()

  const form = useForm<ElectionInput>({
    resolver: zodResolver(electionSchema),
    defaultValues: { maxVoters: 100, category: 'general' } as ElectionInput,
    mode: 'onChange',
  })

  const titleValue = useWatch({ control: form.control, name: 'title' })
  const categoryValue = useWatch({ control: form.control, name: 'category' })
  const descriptionValue = useWatch({ control: form.control, name: 'description' })
  const registrationDeadlineValue = useWatch({ control: form.control, name: 'registrationDeadline' })
  const startDateValue = useWatch({ control: form.control, name: 'startDate' })
  const endDateValue = useWatch({ control: form.control, name: 'endDate' })
  const maxVotersValue = useWatch({ control: form.control, name: 'maxVoters' })

  // ── Role guard ──────────────────────────────────────────────────────────────
  if (profile && profile.role !== 'election_creator' && profile.role !== 'super_admin') {
    return (
      <div className="max-w-2xl mx-auto space-y-4 p-8 text-center">
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">
          Your account role is <strong>{profile.role}</strong>. Only{' '}
          <strong>Election Creators</strong> and <strong>Admins</strong> can create elections.
        </p>
        <p className="text-sm text-muted-foreground">
          To get creator access, go to{' '}
          <a href="/apply" className="text-primary underline">
            Apply as Creator
          </a>{' '}
          and wait for admin approval.
        </p>
        <p className="text-xs text-muted-foreground mt-4 border rounded p-3 bg-muted">
          <strong>Dev tip:</strong> In your Supabase dashboard → Table editor → profiles → find{' '}
          <code>creator@test.com</code> row → change <code>role</code> to{' '}
          <code>election_creator</code> → Save.
        </p>
      </div>
    )
  }
  // ────────────────────────────────────────────────────────────────────────────

  /** Validate only fields for the current step before moving forward */
  const handleContinue = async () => {
    const fieldsForStep = STEP_FIELDS[step]
    if (fieldsForStep.length > 0) {
      const valid = await form.trigger(fieldsForStep)
      if (!valid) {
        toast.error('Please fix the errors before continuing.')
        return
      }
    }
    setStep((s) => s + 1)
  }

  // ── Save Draft ──────────────────────────────────────────────────────────────
  const saveDraft = async () => {
    if (!user) {
      toast.error('You must be logged in to save a draft.')
      return
    }
    setSubmitting(true)
    try {
      const v = form.getValues()
      const payload = {
        creator_id: user.id,
        title: v.title || 'Untitled draft',
        description: v.description || 'Draft description…',
        category: v.category || 'general',
        start_date: v.startDate || new Date().toISOString(),
        end_date: v.endDate || new Date(Date.now() + 86_400_000).toISOString(),
        registration_deadline: v.registrationDeadline || new Date().toISOString(),
        max_voters: v.maxVoters || 100,
      }

      // Demo mode — no real Supabase
      if (isDemoMode()) {
        const id = saveDemoElection(payload, 'draft')
        toast.success('Draft saved (demo mode — stored locally)')
        navigate(`/dashboard/elections/${id}/manage`)
        return
      }

      const { data, error } = await supabase
        .from('elections')
        .insert({ ...payload, status: 'draft' })
        .select('id')
        .single()

      if (error) {
        // Surface the exact Supabase error so you can debug it
        if (error.code === '42501') {
          toast.error(
            'Permission denied (RLS). Make sure your Supabase RLS policy allows election_creator to INSERT into elections.',
          )
        } else if (error.code === '23505') {
          toast.error('A duplicate election already exists.')
        } else {
          toast.error(`Database error [${error.code}]: ${error.message}`)
        }
        console.error('Supabase saveDraft error:', error)
        return
      }

      toast.success('Draft saved!')
      navigate(`/dashboard/elections/${data.id}/manage`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error'
      toast.error(msg)
      console.error('saveDraft exception:', e)
    } finally {
      setSubmitting(false)
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  // ── Publish ─────────────────────────────────────────────────────────────────
  const publish = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log('🚀 Publish button clicked')
    
    if (submitting) {
      console.log('⏸️ Already submitting, ignoring duplicate click')
      return
    }

    if (!user) {
      toast.error('You must be logged in.')
      console.log('❌ No user logged in')
      return
    }

    // Validate all fields before submission
    console.log('🔍 Validating form...')
    const isValid = await form.trigger()
    if (!isValid) {
      const errors = form.formState.errors
      const errorMsgs = Object.values(errors)
        .map((e) => (e as { message?: string })?.message)
        .filter(Boolean)
      const errorMsg = errorMsgs.length > 0 ? `Validation: ${errorMsgs[0]}` : 'Please fill all required fields.'
      toast.error(errorMsg)
      console.log('❌ Validation failed:', errorMsg, errors)
      return
    }

    console.log('✅ Validation passed, setting submitting...')
    setSubmitting(true)

    try {
      const data = form.getValues()
      console.log('📦 Form data:', data)
      
      const payload = {
        creator_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        start_date: data.startDate,
        end_date: data.endDate,
        registration_deadline: data.registrationDeadline,
        max_voters: data.maxVoters,
      }

      // Demo mode — no real Supabase
      if (isDemoMode()) {
        console.log('📝 Demo mode - saving locally')
        const id = saveDemoElection(payload, 'registration_open')
        toast.success('Election published! (demo mode — stored locally)')
        navigate(`/elections/${id}`)
        return
      }

      console.log('🌐 Inserting into Supabase...', { user_id: user.id })
      const sessionResponse = await supabase.auth.getSession()
      console.log('🔐 Current auth session:', {
        sessionExists: !!sessionResponse.data.session,
        userId: sessionResponse.data.session?.user?.id,
      })

      const { data: election, error } = await supabase
        .from('elections')
        .insert({
          ...payload,
          status: 'registration_open',
          published_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (error) {
        console.log('❌ Supabase error:', error)
        if (error.code === '42501') {
          toast.error(
            'Permission denied (RLS). Make sure creator@test.com has election_creator role in Supabase.'
          )
        } else {
          toast.error(`Database error [${error.code}]: ${error.message}`)
        }
        return
      }

      console.log('✅ Election published:', election)
      toast.success('Election published successfully!')
      navigate(`/elections/${election.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unexpected error'
      console.error('❌ Publish exception:', e, msg)
      toast.error(msg)
    } finally {
      console.log('🔚 Finally block - resetting submitting')
      setSubmitting(false)
    }
  }
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={publish} className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create election</h1>
        <p className="text-muted-foreground">Fill in details step by step, then publish.</p>
        {isDemoMode() && (
          <p className="text-xs mt-2 text-amber-600 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            ⚠️ Running in <strong>demo mode</strong> (no Supabase configured). Elections will be
            saved to <em>localStorage</em> only.
          </p>
        )}
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              i === step
                ? 'bg-primary text-primary-foreground'
                : i < step
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground'
            }`}
          >
            {i < step ? '✓ ' : ''}{s}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              className="space-y-4"
            >
              {/* ── Step 0: Details ─────────────────────────────────────────── */}
              {step === 0 && (
                <>
                  <div>
                    <Label>
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input {...form.register('title')} className="mt-1.5" placeholder="e.g. Student Council Election 2026" />
                    {form.formState.errors.title && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Description <span className="text-destructive">*</span>
                    </Label>
                    <Textarea
                      {...form.register('description')}
                      className="mt-1.5"
                      rows={4}
                      placeholder="Describe the purpose of this election (min 20 characters)"
                    />
                    {form.formState.errors.description && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.description.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      {...form.register('category')}
                      className="mt-1.5"
                      placeholder="e.g. education, organization, community"
                    />
                    {form.formState.errors.category && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.category.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Step 1: Schedule ────────────────────────────────────────── */}
              {step === 1 && (
                <>
                  <div>
                    <Label>
                      Registration deadline <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="datetime-local"
                      {...form.register('registrationDeadline')}
                      className="mt-1.5"
                    />
                    {form.formState.errors.registrationDeadline && (
                      <p className="text-xs text-destructive mt-1">
                        {form.formState.errors.registrationDeadline.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Voters can register until this date.
                    </p>
                  </div>
                  <div>
                    <Label>
                      Election start date <span className="text-destructive">*</span>
                    </Label>
                    <Input type="datetime-local" {...form.register('startDate')} className="mt-1.5" />
                    {form.formState.errors.startDate && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.startDate.message}</p>
                    )}
                  </div>
                  <div>
                    <Label>
                      Election end date <span className="text-destructive">*</span>
                    </Label>
                    <Input type="datetime-local" {...form.register('endDate')} className="mt-1.5" />
                    {form.formState.errors.endDate && (
                      <p className="text-xs text-destructive mt-1">{form.formState.errors.endDate.message}</p>
                    )}
                  </div>
                </>
              )}

              {/* ── Step 2: Capacity ────────────────────────────────────────── */}
              {step === 2 && (
                <div>
                  <Label>
                    Maximum voters <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={1000000}
                    {...form.register('maxVoters', { valueAsNumber: true })}
                    className="mt-1.5"
                    placeholder="e.g. 500"
                  />
                  {form.formState.errors.maxVoters && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.maxVoters.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Once this limit is reached, registration auto-locks.
                  </p>
                </div>
              )}

              {/* ── Step 3: Review ──────────────────────────────────────────── */}
              {step === 3 && (
                <div className="text-sm space-y-3">
                  <h3 className="font-semibold text-base mb-2">Review your election</h3>
                  {[
                    { label: 'Title', value: titleValue },
                    { label: 'Category', value: categoryValue },
                    { label: 'Description', value: descriptionValue },
                    { label: 'Registration deadline', value: registrationDeadlineValue },
                    { label: 'Start date', value: startDateValue },
                    { label: 'End date', value: endDateValue },
                    { label: 'Max voters', value: maxVotersValue },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-4 border-b pb-2">
                      <span className="font-medium text-foreground">{label}</span>
                      <span className="text-muted-foreground text-right break-all">
                        {value?.toString() || <em className="text-destructive">Not set</em>}
                      </span>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">
                    After publishing, you can still add candidates and polls from the Manage page.
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ── Footer buttons ───────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={saveDraft}
          disabled={submitting}
        >
          {submitting ? 'Saving…' : 'Save draft'}
        </Button>

        <div className="flex gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setStep((s) => s - 1)}
              disabled={submitting}
            >
              Back
            </Button>
          )}

          {step < steps.length - 1 ? (
            <Button type="button" onClick={handleContinue} disabled={submitting}>
              Continue
            </Button>
          ) : (
            <Button type="submit" variant="gradient" disabled={submitting}>
              {submitting ? 'Publishing…' : 'Publish election'}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
