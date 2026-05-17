import { addDays } from "date-fns";
import { getSession } from "@/lib/auth/session";
import { requireRoles, isAdminLike } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminPublishSchema } from "@/lib/validators";
import { assertTransition, actorForRole } from "@/lib/workflow";
import type { AdStatus } from "@/types";
import { logAudit, logStatusChange } from "@/server/audit";
import { notifyUser } from "@/server/notify";
import { jsonError, jsonOk } from "../../../../_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await getSession();
    requireRoles(session, ["admin", "super_admin"]);
    if (!isAdminLike(session!.role)) return jsonError("Forbidden", 403);
    const { id } = await ctx.params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = adminPublishSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { data: ad, error } = await db.from("ads").select("*").eq("id", id).maybeSingle();
    if (error) return jsonError(error.message, 500);
    if (!ad) return jsonError("Not found", 404);
    if (ad.status !== "payment_verified" && ad.status !== "scheduled") {
      return jsonError("Ad must be payment verified before publishing", 400);
    }
    if (!ad.package_id) {
      return jsonError("Ad is missing package", 400);
    }

    const { data: pkg } = await db
      .from("packages")
      .select("duration_days, is_featured_tier, homepage_visibility")
      .eq("id", ad.package_id)
      .maybeSingle();
    if (!pkg) return jsonError("Package not found", 400);

    const { data: verifiedPay } = await db
      .from("payments")
      .select("id")
      .eq("ad_id", id)
      .eq("status", "verified")
      .limit(1)
      .maybeSingle();
    if (!verifiedPay) {
      return jsonError("A verified payment record is required", 400);
    }

    const prev = ad.status as AdStatus;
    const actor = actorForRole(session!.role);
    const now = new Date();

    if (parsed.data.mode === "schedule") {
      if (!parsed.data.scheduled_publish_at) {
        return jsonError("scheduled_publish_at required for schedule mode", 400);
      }
      const when = new Date(parsed.data.scheduled_publish_at);
      if (when.getTime() <= now.getTime()) {
        return jsonError("Schedule time must be in the future", 400);
      }
      assertTransition(prev, "scheduled", actor);
      const patch = {
        status: "scheduled",
        scheduled_publish_at: when.toISOString(),
        publish_at: null,
        expire_at: null,
        is_featured: parsed.data.is_featured ?? ad.is_featured,
        admin_boost: parsed.data.admin_boost ?? ad.admin_boost,
        updated_at: now.toISOString(),
      };
      const { data: updated, error: upErr } = await db
        .from("ads")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (upErr) return jsonError(upErr.message, 500);
      await logStatusChange(db, {
        ad_id: id,
        previous_status: prev,
        new_status: "scheduled",
        changed_by: session!.userId,
        note: "Scheduled publish",
      });
      await logAudit(db, {
        actor_id: session!.userId,
        action_type: "ad.schedule",
        target_type: "ad",
        target_id: id,
        new_value: patch,
      });
      await notifyUser(db, {
        user_id: ad.user_id,
        title: "Listing scheduled",
        message: `Your ad will go live on ${when.toLocaleString()}.`,
        link: `/dashboard/client`,
      });
      return jsonOk({ ad: updated });
    }

    assertTransition(prev, "published", actor);
    const publishAt = now;
    const expireAt = addDays(publishAt, pkg.duration_days);
    const patch = {
      status: "published",
      publish_at: publishAt.toISOString(),
      expire_at: expireAt.toISOString(),
      scheduled_publish_at: null,
      is_featured: parsed.data.is_featured ?? ad.is_featured,
      admin_boost: parsed.data.admin_boost ?? ad.admin_boost,
      updated_at: now.toISOString(),
    };
    const { data: updated, error: upErr } = await db
      .from("ads")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (upErr) return jsonError(upErr.message, 500);
    await logStatusChange(db, {
      ad_id: id,
      previous_status: prev,
      new_status: "published",
      changed_by: session!.userId,
      note: "Published now",
    });
    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "ad.publish",
      target_type: "ad",
      target_id: id,
      new_value: patch,
    });
    await notifyUser(db, {
      user_id: ad.user_id,
      title: "Listing live",
      message: "Your sponsored listing is now visible on AdFlow Pro.",
      link: `/ads/${updated.slug}`,
    });
    return jsonOk({ ad: updated });
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
          : e instanceof Error && e.message.startsWith("Invalid transition")
            ? 400
            : 500;
    return jsonError(msg, status);
  }
}
