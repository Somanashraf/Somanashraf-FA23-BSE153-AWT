import { supabaseAdmin } from "@/lib/supabase/admin";
import { assertTransition } from "@/lib/workflow";
import { logAudit, logStatusChange } from "@/server/audit";
import { notifyUser } from "@/server/notify";
import { assertCron, jsonError, jsonOk } from "../../_utils";
import type { AdStatus } from "@/types";

async function handle(req: Request) {
  try {
    assertCron(req);
    const db = supabaseAdmin();
    const nowIso = new Date().toISOString();
    const { data: stale, error } = await db
      .from("ads")
      .select("id, user_id, slug, title, status, expire_at")
      .eq("status", "published")
      .lt("expire_at", nowIso);
    if (error) return jsonError(error.message, 500);

    let expired = 0;
    for (const ad of stale ?? []) {
      const prev = ad.status as AdStatus;
      assertTransition(prev, "expired", "system");
      const { error: upErr } = await db
        .from("ads")
        .update({ status: "expired", updated_at: new Date().toISOString() })
        .eq("id", ad.id);
      if (upErr) continue;
      expired += 1;
      await logStatusChange(db, {
        ad_id: ad.id,
        previous_status: prev,
        new_status: "expired",
        changed_by: null,
        note: "Cron expire-ads",
      });
      await logAudit(db, {
        actor_id: null,
        action_type: "cron.expire",
        target_type: "ad",
        target_id: ad.id,
        old_value: { expire_at: ad.expire_at },
        new_value: { status: "expired" },
      });
      await notifyUser(db, {
        user_id: ad.user_id,
        title: "Listing expired",
        message: `"${ad.title}" has reached its package end date.`,
        link: `/dashboard/client`,
      });
    }
    return jsonOk({ ok: true, expired });
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
