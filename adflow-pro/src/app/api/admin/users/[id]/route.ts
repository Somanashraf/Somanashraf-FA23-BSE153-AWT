import { getSession } from "@/lib/auth/session";
import { requireRoles, isAdminLike } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminUserPatchSchema } from "@/lib/validators";
import { logAudit } from "@/server/audit";
import { jsonError, jsonOk } from "../../../_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await getSession();
    requireRoles(session, ["admin", "super_admin"]);
    if (!isAdminLike(session!.role)) return jsonError("Forbidden", 403);
    const { id } = await ctx.params;
    if (id === session!.userId) {
      return jsonError("You cannot change your own account here", 400);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = adminUserPatchSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }

    const db = supabaseAdmin();
    const { data: target, error: loadErr } = await db
      .from("users")
      .select("id, role, email")
      .eq("id", id)
      .maybeSingle();
    if (loadErr) return jsonError(loadErr.message, 500);
    if (!target) return jsonError("User not found", 404);

    if (target.role === "super_admin" && session!.role !== "super_admin") {
      return jsonError("Only super admin can modify super admin users", 403);
    }

    const nextRole = parsed.data.role;
    if (nextRole === "super_admin" && session!.role !== "super_admin") {
      return jsonError("Only super admin can assign super admin role", 403);
    }

    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (parsed.data.role !== undefined) patch.role = parsed.data.role;
    if (parsed.data.status !== undefined) patch.status = parsed.data.status;

    if (Object.keys(patch).length <= 1) {
      return jsonError("No changes", 400);
    }

    const { data: updated, error: upErr } = await db
      .from("users")
      .update(patch)
      .eq("id", id)
      .select("id, name, email, role, status, created_at")
      .single();
    if (upErr) return jsonError(upErr.message, 500);

    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "admin.user_update",
      target_type: "user",
      target_id: id,
      new_value: patch,
    });

    return jsonOk({ user: updated });
  } catch (e) {
    const msg =
      e instanceof Error && e.message === "UNAUTHORIZED"
        ? "Unauthorized"
        : e instanceof Error && e.message === "FORBIDDEN"
          ? "Forbidden"
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
