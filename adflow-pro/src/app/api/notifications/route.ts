import { getSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../_utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const db = supabaseAdmin();
    const { data: rows, error } = await db
      .from("notifications")
      .select("id, title, message, is_read, link, type, created_at")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false })
      .limit(40);
    if (error) return jsonError(error.message, 500);
    const unread = (rows ?? []).filter((n) => !n.is_read).length;
    return jsonOk({ notifications: rows ?? [], unread_count: unread });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
