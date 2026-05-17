import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { creatorRequestSchema, type CreatorRequestInput } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth-store'
import { Link } from 'react-router-dom'

export function ApplyCreatorPage() {
  const { user } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatorRequestInput>({
    resolver: zodResolver(creatorRequestSchema),
  })

  const onSubmit = async (data: CreatorRequestInput) => {
    if (!user) {
      toast.error('Sign in to apply')
      return
    }
    const { error } = await supabase.from('election_requests').insert({
      user_id: user.id,
      purpose: data.purpose,
      organization: data.organization,
      contact_email: data.contactEmail,
      phone: data.phone,
      identity_details: data.identityDetails,
    })
    if (error) toast.error(error.message)
    else toast.success('Application submitted. You will receive an email when reviewed.')
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-xl mx-auto pt-28 pb-16 px-4">
        <h1 className="text-3xl font-bold">Become an election creator</h1>
        <p className="text-muted-foreground mt-2">
          Submit your organization for admin approval to host secure elections.
        </p>
        {!user && (
          <Card className="mt-6">
            <CardContent className="p-4 text-sm">
              <Link to="/login" className="text-primary hover:underline">Sign in</Link> to submit an application.
            </CardContent>
          </Card>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <div>
            <Label>Organization</Label>
            <Input {...register('organization')} className="mt-1.5" />
            {errors.organization && <p className="text-xs text-destructive mt-1">{errors.organization.message}</p>}
          </div>
          <div>
            <Label>Contact email</Label>
            <Input type="email" {...register('contactEmail')} className="mt-1.5" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input {...register('phone')} className="mt-1.5" />
          </div>
          <div>
            <Label>Purpose</Label>
            <Textarea {...register('purpose')} className="mt-1.5" />
          </div>
          <div>
            <Label>Identity details</Label>
            <Textarea {...register('identityDetails')} className="mt-1.5" />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting || !user}>
            Submit application
          </Button>
        </form>
      </div>
      <Footer />
    </div>
  )
}
