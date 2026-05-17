import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function GET() {
  try {
    const db = supabaseAdmin();
    const start = Date.now();
    const { error } = await db.from("learning_questions").select("id").limit(1);
    const ms = Date.now() - start;
    await db.from("system_health_logs").insert({
      source: "api/health/db",
      response_ms: ms,
      status: error ? "error" : "ok",
      detail: error?.message ?? null,
    });
    if (error) return jsonError(error.message, 500);
    return jsonOk({ status: "ok", response_ms: ms, checked_at: new Date().toISOString() });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
