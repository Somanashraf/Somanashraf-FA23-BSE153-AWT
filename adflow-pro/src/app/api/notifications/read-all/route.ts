import { getSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const db = supabaseAdmin();
    const { error } = await db
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", session.userId)
      .eq("is_read", false);
    if (error) return jsonError(error.message, 500);
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
