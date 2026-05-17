import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuditLog } from '@/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => setLogs((data as AuditLog[]) ?? []))
  }, [])

  const filtered = logs.filter(
    (l) =>
      !filter ||
      l.action.toLowerCase().includes(filter.toLowerCase()) ||
      l.entity_type?.toLowerCase().includes(filter.toLowerCase()),
  )

  const exportCsv = () => {
    const csv = [
      'timestamp,action,entity_type,entity_id,user_id',
      ...filtered.map((l) =>
        [l.created_at, l.action, l.entity_type, l.entity_id, l.user_id].join(','),
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'securevote-audit.csv'
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit logs</h1>
          <p className="text-muted-foreground">Immutable transparency trail</p>
        </div>
        <Button variant="outline" onClick={exportCsv}>
          <Download className="size-4" /> Export CSV
        </Button>
      </div>
      <Input
        placeholder="Filter by action or entity..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No audit logs yet. Actions are recorded as users interact with the platform.
            </CardContent>
          </Card>
        ) : (
          filtered.map((log) => (
            <Card key={log.id} className="font-mono text-sm">
              <CardContent className="p-4 flex flex-wrap gap-4 items-center">
                <span className="text-muted-foreground">
                  {format(new Date(log.created_at), 'PPpp')}
                </span>
                <span className="font-semibold text-primary">{log.action}</span>
                {log.entity_type && (
                  <span className="text-muted-foreground">
                    {log.entity_type}:{log.entity_id?.slice(0, 8)}
                  </span>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
