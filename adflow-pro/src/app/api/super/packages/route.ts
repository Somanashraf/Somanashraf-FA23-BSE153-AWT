import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { logAudit } from "@/server/audit";
import { jsonError, jsonOk } from "../../_utils";

const patchSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).optional(),
  duration_days: z.number().int().positive().optional(),
  weight: z.number().int().min(1).max(10).optional(),
  price_cents: z.number().int().min(0).optional(),
  homepage_visibility: z.boolean().optional(),
  is_featured_tier: z.boolean().optional(),
  description: z.string().max(2000).nullable().optional(),
});

export async function GET() {
  try {
    const session = await getSession();
    requireRoles(session, ["super_admin"]);
    const db = supabaseAdmin();
    const { data, error } = await db.from("packages").select("*").order("price_cents");
    if (error) return jsonError(error.message, 500);
    return jsonOk({ packages: data ?? [] });
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

export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    requireRoles(session, ["super_admin"]);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { id, ...rest } = parsed.data;
    const patch = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== undefined),
    );
    if (Object.keys(patch).length === 0) return jsonError("No changes", 400);
    const { data, error } = await db
      .from("packages")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return jsonError(error.message, 500);
    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "super.package_update",
      target_type: "package",
      target_id: id,
      new_value: patch,
    });
    return jsonOk({ package: data });
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
