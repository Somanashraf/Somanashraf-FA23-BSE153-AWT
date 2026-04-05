import { getSession } from "@/lib/auth/session";
import { requireRoles, isAdminLike } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function GET() {
  try {
    const session = await getSession();
    requireRoles(session, ["admin", "super_admin"]);
    if (!isAdminLike(session!.role)) return jsonError("Forbidden", 403);
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("ads")
      .select(
        `id, title, slug, status, updated_at, user_id,
         packages ( name, duration_days, price_cents ),
         payments ( id, status, amount, transaction_ref )`,
      )
      .eq("status", "payment_verified")
      .order("updated_at", { ascending: true });
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
