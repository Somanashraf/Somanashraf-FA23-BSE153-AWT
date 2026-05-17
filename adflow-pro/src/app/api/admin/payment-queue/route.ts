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
    const { data: payments, error } = await db
      .from("payments")
      .select(
        `id, amount, method, transaction_ref, sender_name, screenshot_url, status, created_at,
         ads ( id, title, slug, status, user_id, package_id, packages ( name, duration_days, price_cents ) )`,
      )
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    if (error) return jsonError(error.message, 500);
    const queue = (payments ?? []).filter(
      (p) => p.ads && (p.ads as { status?: string }).status === "payment_submitted",
    );
    return jsonOk({ queue });
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
