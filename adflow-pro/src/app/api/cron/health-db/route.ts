import { supabaseAdmin } from "@/lib/supabase/admin";
import { assertCron, jsonError, jsonOk } from "../../_utils";

async function handle(req: Request) {
  try {
    assertCron(req);
    const db = supabaseAdmin();
    const start = Date.now();
    const { error } = await db.from("learning_questions").select("id").limit(1);
    const ms = Date.now() - start;
    await db.from("system_health_logs").insert({
      source: "cron/health-db",
      response_ms: ms,
      status: error ? "error" : "ok",
      detail: error?.message ?? null,
    });
    return jsonOk({ ok: !error, response_ms: ms });
  } catch (e) {
    if (e instanceof Error && e.message === "CRON_UNAUTHORIZED") {
      return jsonError("Unauthorized", 401);
    }
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}

export const POST = handle;
export const GET = handle;
