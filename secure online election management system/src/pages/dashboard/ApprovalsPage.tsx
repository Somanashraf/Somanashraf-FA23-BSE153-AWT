import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { ElectionRequest } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { logAudit } from '@/lib/audit'
import { format } from 'date-fns'

export function ApprovalsPage() {
  const [requests, setRequests] = useState<ElectionRequest[]>([])
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data } = await supabase
      .from('election_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests((data as ElectionRequest[]) ?? [])
  }

  async function approve(id: string, userId: string, requestData: ElectionRequest) {
    setProcessing(true)
    try {
      await supabase
        .from('election_requests')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', id)
      
      await supabase.from('profiles').update({ role: 'election_creator' }).eq('id', userId)
      
      // Send approval email
      await supabase.functions.invoke('send-email', {
        body: {
          to: requestData.contact_email,
          type: 'approval',
          subject: 'Your Creator Request Has Been Approved',
          data: {
            name: requestData.organization,
            link: `${window.location.origin}/dashboard`,
          },
        },
      })

      // Create notification
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Creator Request Approved',
        message: `Congratulations! Your request to create elections has been approved. You can now create and manage elections.`,
        type: 'approval',
        link: '/dashboard/create-election',
      })

      await logAudit('approval', 'election_request', id)
      toast.success('Creator approved and email sent')
      load()
    } catch (error) {
      toast.error('Failed to approve request')
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  async function reject(id: string, userId: string, requestData: ElectionRequest) {
    if (!reason.trim()) {
      toast.error('Provide a rejection reason')
      return
    }
    setProcessing(true)
    try {
      await supabase
        .from('election_requests')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id)

      // Send rejection email
      await supabase.functions.invoke('send-email', {
        body: {
          to: requestData.contact_email,
          type: 'rejection',
          subject: 'Your Creator Request Status',
          data: {
            name: requestData.organization,
            reason: reason,
            link: `${window.location.origin}/apply-creator`,
          },
        },
      })

      // Create notification
      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Creator Request Rejected',
        message: `Your request was not approved. Reason: ${reason}`,
        type: 'rejection',
        link: '/apply-creator',
      })

      await logAudit('rejection', 'election_request', id, { reason })
      toast.success('Request rejected and email sent')
      setRejectId(null)
      setReason('')
      load()
    } catch (error) {
      toast.error('Failed to reject request')
      console.error(error)
    } finally {
      setProcessing(false)
    }
  }

  const pending = requests.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Approval queue</h1>
        <p className="text-muted-foreground">{pending.length} pending requests</p>
      </div>
      {pending.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            No pending creator requests
          </CardContent>
        </Card>
      ) : (
        pending.map((req) => (
          <Card key={req.id}>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>{req.organization}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{req.contact_email}</p>
              </div>
              <Badge>{req.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{req.purpose}</p>
              <p className="text-xs text-muted-foreground">
                Submitted {format(new Date(req.created_at), 'PPp')}
              </p>
              {rejectId === req.id ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Rejection reason..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => reject(req.id, req.user_id, req)}
                      disabled={processing}
                    >
                      {processing ? 'Rejecting...' : 'Confirm reject'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setRejectId(null)} disabled={processing}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => approve(req.id, req.user_id, req)}
                    disabled={processing}
                  >
                    <Check className="size-4" /> {processing ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRejectId(req.id)} disabled={processing}>
                    <X className="size-4" /> Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
