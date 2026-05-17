import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signupSchema, type SignupInput } from '@/lib/validations'
import { supabase } from '@/lib/supabase'

export function SignupPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) })

  const onSubmit = async (data: SignupInput) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.fullName },
        emailRedirectTo: `${import.meta.env.VITE_APP_URL}/login`,
      },
    })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Check your email to verify your account')
    navigate('/login')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create account</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register('fullName')} className="mt-1.5" />
          {errors.fullName && (
            <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} className="mt-1.5" />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword')}
            className="mt-1.5"
          />
          {errors.confirmPassword && (
            <p className="text-xs text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create account'}
        </Button>
      </form>
    </div>
  )
}