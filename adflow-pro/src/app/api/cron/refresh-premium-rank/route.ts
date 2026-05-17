import { supabaseAdmin } from "@/lib/supabase/admin";
import { assertCron, jsonError, jsonOk } from "../../_utils";
import { notifyUser } from "@/server/notify";
import { logAudit } from "@/server/audit";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

async function handle(req: Request) {
  try {
    assertCron(req);
    const db = supabaseAdmin();
    const cutoff = new Date(Date.now() - THREE_DAYS_MS).toISOString();

    const { data: pkg, error: pErr } = await db
      .from("packages")
      .select("id")
      .eq("slug", "premium")
      .maybeSingle();
    if (pErr) return jsonError(pErr.message, 500);
    if (!pkg?.id) return jsonOk({ ok: true, refreshed: 0, note: "No premium package" });

    const { data: rows, error } = await db
      .from("ads")
      .select("id, user_id, title, slug, rank_refresh_at")
      .eq("status", "published")
      .eq("package_id", pkg.id);

    if (error) return jsonError(error.message, 500);

    let refreshed = 0;
    for (const row of rows ?? []) {
      const rr = row.rank_refresh_at as string | null;
      if (rr && rr >= cutoff) continue;

      const { error: upErr } = await db
        .from("ads")
        .update({
          rank_refresh_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id);
      if (upErr) continue;
      refreshed += 1;

      await notifyUser(db, {
        user_id: row.user_id as string,
        title: "Listing visibility refreshed",
        message: `Your premium listing "${row.title}" received a scheduled rank freshness boost.`,
        link: `/ads/${row.slug}`,
        type: "rank_refresh",
      });

      await logAudit(db, {
        actor_id: null,
        action_type: "cron.premium_rank_refresh",
        target_type: "ad",
        target_id: row.id as string,
        new_value: { rank_refresh_at: new Date().toISOString() },
      });
    }

    return jsonOk({ ok: true, refreshed });
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
