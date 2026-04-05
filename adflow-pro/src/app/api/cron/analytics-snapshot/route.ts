import { supabaseAdmin } from "@/lib/supabase/admin";
import { assertCron, jsonError, jsonOk } from "../../_utils";

async function handle(req: Request) {
  try {
    assertCron(req);
    const db = supabaseAdmin();

    const head = async (table: string, filters?: Record<string, string | string[]>) => {
      let q = db.from(table).select("*", { count: "exact", head: true });
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (Array.isArray(v)) q = q.in(k, v);
          else q = q.eq(k, v);
        }
      }
      const { count, error } = await q;
      if (error) throw new Error(error.message);
      return count ?? 0;
    };

    const [totalAds, activeAds, pendingReview, expiredAds] = await Promise.all([
      head("ads"),
      head("ads", { status: "published" }),
      head("ads", {
        status: [
          "submitted",
          "under_review",
          "payment_pending",
          "payment_submitted",
        ],
      }),
      head("ads", { status: "expired" }),
    ]);

    const payload = {
      listings: { total: totalAds, active: activeAds, pending_pipeline: pendingReview, expired: expiredAds },
      captured_at: new Date().toISOString(),
    };

    const { error: insErr } = await db.from("analytics_snapshots").insert({ payload });
    if (insErr) {
      if (insErr.message?.includes("analytics_snapshots") || insErr.code === "42P01") {
        return jsonError(
          "Table analytics_snapshots missing — run supabase/migration_002_features.sql",
          500,
        );
      }
      return jsonError(insErr.message, 500);
    }

    return jsonOk({ ok: true, snapshot: payload });
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
