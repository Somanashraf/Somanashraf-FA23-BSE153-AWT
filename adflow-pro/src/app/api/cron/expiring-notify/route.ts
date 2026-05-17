import { addHours } from "date-fns";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { assertCron, jsonError, jsonOk } from "../../_utils";
import { notifyUser } from "@/server/notify";

async function handle(req: Request) {
  try {
    assertCron(req);
    const db = supabaseAdmin();
    const now = new Date();
    const horizon = addHours(now, 48).toISOString();
    const { data: soon, error } = await db
      .from("ads")
      .select("id, user_id, title, slug, expire_at")
      .eq("status", "published")
      .gt("expire_at", now.toISOString())
      .lte("expire_at", horizon);
    if (error) return jsonError(error.message, 500);

    let notified = 0;
    for (const ad of soon ?? []) {
      const { data: existing } = await db
        .from("notifications")
        .select("id")
        .eq("user_id", ad.user_id)
        .ilike("title", "%Expiring soon%")
        .gte("created_at", addHours(now, -36).toISOString())
        .limit(1)
        .maybeSingle();
      if (existing) continue;
      await notifyUser(db, {
        user_id: ad.user_id,
        title: "Expiring soon",
        message: `"${ad.title}" expires within 48 hours. Consider renewing with a new package.`,
        link: `/dashboard/client`,
      });
      notified += 1;
    }
    return jsonOk({ ok: true, notified });
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
