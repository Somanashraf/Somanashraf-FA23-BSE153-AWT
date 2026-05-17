import { addDays } from "date-fns";
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
    const { data: due, error } = await db
      .from("ads")
      .select("*, packages(duration_days)")
      .eq("status", "scheduled")
      .lte("scheduled_publish_at", nowIso);
    if (error) return jsonError(error.message, 500);

    let published = 0;
    for (const ad of due ?? []) {
      const prev = ad.status as AdStatus;
      assertTransition(prev, "published", "system");
      const pkg = ad.packages as { duration_days?: number } | null;
      const days = pkg?.duration_days ?? 7;
      const publishAt = ad.scheduled_publish_at
        ? new Date(ad.scheduled_publish_at)
        : new Date();
      const expireAt = addDays(publishAt, days);
      const { error: upErr } = await db
        .from("ads")
        .update({
          status: "published",
          publish_at: publishAt.toISOString(),
          expire_at: expireAt.toISOString(),
          scheduled_publish_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", ad.id);
      if (upErr) continue;
      published += 1;
      await logStatusChange(db, {
        ad_id: ad.id,
        previous_status: prev,
        new_status: "published",
        changed_by: null,
        note: "Cron publish-scheduled",
      });
      await logAudit(db, {
        actor_id: null,
        action_type: "cron.publish_scheduled",
        target_type: "ad",
        target_id: ad.id,
        new_value: { publish_at: publishAt.toISOString() },
      });
      await notifyUser(db, {
        user_id: ad.user_id,
        title: "Listing is now live",
        message: "Your scheduled listing has been published.",
        link: `/ads/${ad.slug}`,
      });
    }
    return jsonOk({ ok: true, published });
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
