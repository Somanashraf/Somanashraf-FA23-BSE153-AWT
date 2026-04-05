import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { moderatorReviewSchema } from "@/lib/validators";
import { assertTransition, actorForRole } from "@/lib/workflow";
import type { AdStatus } from "@/types";
import { logAudit, logStatusChange } from "@/server/audit";
import { notifyUser } from "@/server/notify";
import { jsonError, jsonOk } from "../../../../_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const session = await getSession();
    requireRoles(session, ["moderator", "admin", "super_admin"]);
    const { id } = await ctx.params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = moderatorReviewSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { data: ad, error } = await db.from("ads").select("*").eq("id", id).maybeSingle();
    if (error) return jsonError(error.message, 500);
    if (!ad) return jsonError("Not found", 404);

    const prev = ad.status as AdStatus;
    const actor = actorForRole(session!.role);
    const { decision, note, rejection_reason } = parsed.data;
    let next: AdStatus | null = null;

    if (decision === "under_review") {
      if (prev !== "submitted") {
        return jsonError("Can only move to under review from submitted", 400);
      }
      assertTransition(prev, "under_review", actor);
      next = "under_review";
    } else if (decision === "payment_pending") {
      if (prev !== "under_review") {
        return jsonError("Approve content only from under review", 400);
      }
      assertTransition(prev, "payment_pending", actor);
      next = "payment_pending";
    } else if (decision === "rejected") {
      if (!rejection_reason?.trim()) {
        return jsonError("rejection_reason required", 400);
      }
      if (prev === "submitted") {
        assertTransition(prev, "rejected", actor);
      } else if (prev === "under_review") {
        assertTransition(prev, "rejected", actor);
      } else {
        return jsonError("Cannot reject from this status", 400);
      }
      next = "rejected";
    }

    if (!next) return jsonError("Invalid decision", 400);

    const patch: Record<string, unknown> = {
      status: next,
      updated_at: new Date().toISOString(),
      moderator_note: note ?? null,
    };
    if (next === "rejected") patch.rejection_reason = rejection_reason ?? null;

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
      new_status: next,
      changed_by: session!.userId,
      note: note ?? null,
    });
    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "moderation.review",
      target_type: "ad",
      target_id: id,
      old_value: { status: prev },
      new_value: { status: next, decision },
    });

    const title =
      next === "rejected"
        ? "Listing rejected"
        : next === "payment_pending"
          ? "Proceed to payment"
          : "Listing in review";
    const message =
      next === "rejected"
        ? (rejection_reason as string)
        : next === "payment_pending"
          ? "Select your package and submit payment proof."
          : "A moderator is reviewing your listing.";
    await notifyUser(db, {
      user_id: ad.user_id,
      title,
      message,
      link: `/dashboard/client`,
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
