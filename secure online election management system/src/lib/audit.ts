import { supabase } from '@/lib/supabase'

export async function logAudit(
  action: string,
  entityType?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {},
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  await supabase.from('audit_logs').insert({
    user_id: user?.id ?? null,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata,
    ip_address: null,
    user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
  })
}
