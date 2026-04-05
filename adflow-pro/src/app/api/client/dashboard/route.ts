import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function GET() {
  try {
    const session = await getSession();
    requireRoles(session, ["client"]);
    const db = supabaseAdmin();
    const { data: ads, error } = await db
      .from("ads")
      .select(
        `*, packages ( name, slug, duration_days, price_cents ),
         categories ( name, slug ), cities ( name, slug ),
         payments ( id, status, amount, transaction_ref, created_at ),
         ad_media ( thumbnail_url, validation_status )`,
      )
      .eq("user_id", session!.userId)
      .order("updated_at", { ascending: false });
    if (error) return jsonError(error.message, 500);

    const { data: notifs } = await db
      .from("notifications")
      .select("id, title, message, is_read, link, created_at")
      .eq("user_id", session!.userId)
      .order("created_at", { ascending: false })
      .limit(20);

    const unread = (notifs ?? []).filter((n) => !n.is_read).length;

    return jsonOk({
      ads: ads ?? [],
      notifications: notifs ?? [],
      unread_count: unread,
    });
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "FORBIDDEN"
        ? "Forbidden"
        : e instanceof Error && e.message === "UNAUTHORIZED"
          ? "Unauthorized"
          : e instanceof Error
            ? e.message
            : "Server error";
    const status =
      e instanceof Error && e.message === "UNAUTHORIZED"
        ? 401
        : e instanceof Error && e.message === "FORBIDDEN"
          ? 403
          : 500;
    return jsonError(msg, status);
  }
}
