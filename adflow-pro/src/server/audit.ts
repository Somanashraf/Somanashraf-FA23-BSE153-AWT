import type { SupabaseClient } from "@supabase/supabase-js";

export async function logAudit(
  db: SupabaseClient,
  row: {
    actor_id: string | null;
    action_type: string;
    target_type: string;
    target_id?: string | null;
    old_value?: unknown;
    new_value?: unknown;
  },
) {
  await db.from("audit_logs").insert({
    actor_id: row.actor_id,
    action_type: row.action_type,
    target_type: row.target_type,
    target_id: row.target_id ?? null,
    old_value: row.old_value ?? null,
    new_value: row.new_value ?? null,
  });
}

export async function logStatusChange(
  db: SupabaseClient,
  row: {
    ad_id: string;
    previous_status: string | null;
    new_status: string;
    changed_by: string | null;
    note?: string | null;
  },
) {
  await db.from("ad_status_history").insert({
    ad_id: row.ad_id,
    previous_status: row.previous_status,
    new_status: row.new_status,
    changed_by: row.changed_by,
    note: row.note ?? null,
  });
}
