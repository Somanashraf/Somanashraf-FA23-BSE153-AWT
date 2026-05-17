import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function GET() {
  try {
    const session = await getSession();
    requireRoles(session, ["moderator", "admin", "super_admin"]);
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("ads")
      .select(
        `id, title, slug, status, created_at, updated_at, user_id,
         categories ( name, slug ), cities ( name, slug ),
         ad_media ( thumbnail_url, original_url, validation_status, source_type )`,
      )
      .in("status", ["submitted", "under_review"])
      .order("created_at", { ascending: true });
    if (error) return jsonError(error.message, 500);
    return jsonOk({ queue: data ?? [] });
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
