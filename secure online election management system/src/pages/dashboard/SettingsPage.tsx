import { useAuthStore } from '@/stores/auth-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function SettingsPage() {
  const { profile, fetchProfile } = useAuthStore()

  const toggle2fa = async () => {
    if (!profile) return
    const { error } = await supabase
      .from('profiles')
      .update({ two_factor_enabled: !profile.two_factor_enabled })
      .eq('id', profile.id)
    if (error) toast.error(error.message)
    else {
      await fetchProfile()
      toast.success('2FA preference updated')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input value={profile?.email ?? ''} disabled className="mt-1.5" />
          </div>
          <div>
            <Label>Full name</Label>
            <Input value={profile?.full_name ?? ''} disabled className="mt-1.5" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="font-medium">Two-factor authentication</p>
            <p className="text-sm text-muted-foreground">Extra layer on sign-in (optional)</p>
          </div>
          <Switch
            checked={profile?.two_factor_enabled ?? false}
            onCheckedChange={toggle2fa}
          />
        </CardContent>
      </Card>
      <Button variant="outline" asChild>
        <a href="/forgot-password">Change password</a>
      </Button>
    </div>
  )
}
