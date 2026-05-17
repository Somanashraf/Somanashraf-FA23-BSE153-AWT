import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'

const schema = z.object({ email: z.string().email() })

export function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async ({ email }: { email: string }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${import.meta.env.VITE_APP_URL}/reset-password`,
    })
    if (error) toast.error(error.message)
    else toast.success('Password reset link sent')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Reset password</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1.5" />
        </div>
        <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
          Send reset link
        </Button>
      </form>
    </div>
  )
}
