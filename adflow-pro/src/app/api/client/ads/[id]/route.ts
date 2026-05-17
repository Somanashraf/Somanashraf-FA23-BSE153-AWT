import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adPatchSchema } from "@/lib/validators";
import { replaceAdMedia } from "@/server/mediaSync";
import { logAudit, logStatusChange } from "@/server/audit";
import { assertTransition, actorForRole } from "@/lib/workflow";
import type { AdStatus } from "@/types";
import { notifyModerators, notifyUser } from "@/server/notify";
import { jsonError, jsonOk } from "../../../_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await getSession();
    requireRoles(session, ["client"]);
    const { id } = await ctx.params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = adPatchSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { data: ad, error: loadErr } = await db
      .from("ads")
      .select("*")
      .eq("id", id)
      .eq("user_id", session!.userId)
      .maybeSingle();
    if (loadErr) return jsonError(loadErr.message, 500);
    if (!ad) return jsonError("Not found", 404);

    const prev = ad.status as AdStatus;
    const actor = actorForRole(session!.role);
    let nextStatus: AdStatus | null = null;

    const touchesContent =
      parsed.data.title !== undefined ||
      parsed.data.description !== undefined ||
      parsed.data.category_id !== undefined ||
      parsed.data.city_id !== undefined ||
      parsed.data.package_id !== undefined ||
      parsed.data.media_urls !== undefined;

    if (touchesContent && prev !== "draft" && prev !== "payment_pending") {
      return jsonError(
        "Edits are only allowed for draft or payment_pending ads",
        400,
      );
    }

    if (parsed.data.action === "submit") {
      if (prev === "draft") {
        assertTransition(prev, "submitted", actor);
        nextStatus = "submitted";
      } else {
        return jsonError("Cannot submit from current status", 400);
      }
    }

    const patch: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) patch.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      patch.description = parsed.data.description;
    if (parsed.data.category_id !== undefined)
      patch.category_id = parsed.data.category_id;
    if (parsed.data.city_id !== undefined) patch.city_id = parsed.data.city_id;
    if (parsed.data.package_id !== undefined) {
      if (prev !== "payment_pending") {
        return jsonError("Package can only be set while payment is pending", 400);
      }
      patch.package_id = parsed.data.package_id;
    }
    if (nextStatus) patch.status = nextStatus;

    const shouldWrite =
      Object.keys(patch).length > 0 || parsed.data.media_urls !== undefined;
    if (!shouldWrite) {
      return jsonError("No changes", 400);
    }

    patch.updated_at = new Date().toISOString();

    let updated = ad;
    if (Object.keys(patch).length > 0) {
      const { data: u, error: upErr } = await db
        .from("ads")
        .update(patch)
        .eq("id", id)
        .select("*")
        .single();
      if (upErr) return jsonError(upErr.message, 500);
      updated = u;
    }

    if (parsed.data.media_urls && (prev === "draft" || prev === "payment_pending")) {
      await replaceAdMedia(db, id, parsed.data.media_urls);
    }

    if (nextStatus) {
      await logStatusChange(db, {
        ad_id: id,
        previous_status: prev,
        new_status: nextStatus,
        changed_by: session!.userId,
        note: "Client submitted listing",
      });
      await logAudit(db, {
        actor_id: session!.userId,
        action_type: "ad.status",
        target_type: "ad",
        target_id: id,
        old_value: { status: prev },
        new_value: { status: nextStatus },
      });
      await notifyUser(db, {
        user_id: session!.userId,
        title: "Listing submitted",
        message: `"${updated.title}" is in the moderation queue.`,
        link: `/dashboard/client`,
      });
      await notifyModerators(db, {
        title: "New listing to review",
        message: `"${updated.title}" was submitted and needs moderation.`,
        link: "/dashboard/moderator",
      });
    } else if (Object.keys(patch).length > 0 || parsed.data.media_urls) {
      await logAudit(db, {
        actor_id: session!.userId,
        action_type: "ad.update",
        target_type: "ad",
        target_id: id,
        new_value: { ...patch, media: Boolean(parsed.data.media_urls) },
      });
    }

    const { data: fresh } = await db.from("ads").select("*").eq("id", id).single();
    return jsonOk({ ad: fresh ?? updated });
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
