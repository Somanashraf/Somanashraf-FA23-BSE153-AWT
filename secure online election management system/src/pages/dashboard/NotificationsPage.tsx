import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Check, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import type { Notification } from '@/types/database'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
    setNotifications((data as Notification[]) ?? [])
    setLoading(false)
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    load()
  }

  async function deleteNotification(id: string) {
    await supabase.from('notifications').delete().eq('id', id)
    toast.success('Notification deleted')
    load()
  }

  async function markAllAsRead() {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false)
    toast.success('All marked as read')
    load()
  }

  const unread = notifications.filter((n) => !n.is_read)

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading notifications...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No notifications yet. Election updates and secret ID deliveries will appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <Card key={notif.id} className={notif.is_read ? 'opacity-60' : 'border-primary/50 bg-primary/5'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{notif.title}</h3>
                      {!notif.is_read && <Badge variant="default" className="text-xs">New</Badge>}
                      <Badge variant="outline" className="text-xs">{notif.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notif.created_at), 'PPp')}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {!notif.is_read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8"
                        onClick={() => markAsRead(notif.id)}
                        title="Mark as read"
                      >
                        <Check className="size-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => deleteNotification(notif.id)}
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
