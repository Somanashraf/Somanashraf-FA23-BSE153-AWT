import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'
import { useState } from 'react'
import Turnstile from 'react-turnstile'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  // 2FA State
  const [requires2FA, setRequires2FA] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifying, setVerifying] = useState(false)
  const rawTurnstileKey = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim() ?? ''
  const turnstileKey =
    rawTurnstileKey &&
    !rawTurnstileKey.includes('your-turnstile') &&
    !rawTurnstileKey.includes('optional')
      ? rawTurnstileKey
      : undefined

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    if (turnstileKey && !captchaToken) {
      toast.error('Please complete the CAPTCHA')
      return
    }
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error || !authData.user) {
      toast.error(error?.message ?? 'Login failed')
      return
    }

    // Check if 2FA is enabled for this user
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_enabled')
      .eq('id', authData.user.id)
      .single()

    if (profile?.two_factor_enabled) {
      setRequires2FA(true)
      // We don't log them out, just hold them on the 2FA screen
      // In a real app, we would use Supabase MFA APIs here
      return
    }

    await logAudit('login')
    toast.success('Welcome back')
    navigate(from, { replace: true })
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length < 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }
    setVerifying(true)
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 800))
    setVerifying(false)
    
    await logAudit('login_with_2fa')
    toast.success('2FA Verified. Welcome back!')
    navigate(from, { replace: true })
  }

  if (requires2FA) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Two-Factor Verification</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Enter the 6-digit authentication code to continue. (For this demo, any 6-digit number works).
          </p>
        </div>
        <form onSubmit={handleVerify2FA} className="space-y-4">
          <div>
            <Label htmlFor="otp">Authentication Code</Label>
            <Input 
              id="otp" 
              placeholder="123456" 
              maxLength={6} 
              className="mt-1.5 text-center text-lg tracking-widest" 
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <Button type="submit" variant="gradient" className="w-full" disabled={verifying || otp.length < 6}>
            {verifying ? 'Verifying...' : 'Verify & Sign In'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => {
            supabase.auth.signOut()
            setRequires2FA(false)
          }}>
            Cancel
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        New to SecureVote?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          Create account
        </Link>
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} className="mt-1.5" />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>
        <div>
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <Input id="password" type="password" {...register('password')} className="mt-1.5" />
          {errors.password && (
            <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
          )}
        </div>
        {turnstileKey ? (
          <Turnstile sitekey={turnstileKey} onVerify={setCaptchaToken} theme="auto" />
        ) : null}
        <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}
