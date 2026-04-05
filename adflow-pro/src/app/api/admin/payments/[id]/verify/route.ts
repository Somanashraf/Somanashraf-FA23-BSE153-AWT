import { getSession } from "@/lib/auth/session";
import { requireRoles, isAdminLike } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { adminPaymentVerifySchema } from "@/lib/validators";
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
    const parsed = adminPaymentVerifySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { data: payment, error } = await db
      .from("payments")
      .select("*, ads (*)")
      .eq("id", id)
      .maybeSingle();
    if (error) return jsonError(error.message, 500);
    if (!payment) return jsonError("Not found", 404);
    const ad = payment.ads as Record<string, unknown> | null;
    if (!ad || ad.status !== "payment_submitted") {
      return jsonError("Payment queue item not active", 400);
    }
    if (payment.status !== "pending") {
      return jsonError("Payment already processed", 400);
    }

    const prev = ad.status as AdStatus;
    const actor = actorForRole(session!.role);

    if (parsed.data.status === "verified") {
      assertTransition(prev, "payment_verified", actor);
      await db
        .from("payments")
        .update({
          status: "verified",
          admin_note: parsed.data.admin_note ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      const { data: updated, error: upErr } = await db
        .from("ads")
        .update({
          status: "payment_verified",
          updated_at: new Date().toISOString(),
        })
        .eq("id", ad.id as string)
        .select("*")
        .single();
      if (upErr) return jsonError(upErr.message, 500);

      await logStatusChange(db, {
        ad_id: ad.id as string,
        previous_status: prev,
        new_status: "payment_verified",
        changed_by: session!.userId,
        note: "Payment verified",
      });
      await logAudit(db, {
        actor_id: session!.userId,
        action_type: "payment.verify",
        target_type: "payment",
        target_id: id,
        new_value: { status: "verified" },
      });
      await notifyUser(db, {
        user_id: ad.user_id as string,
        title: "Payment verified",
        message: "An admin verified your payment. Your listing can now be published.",
        link: `/dashboard/client`,
      });
      return jsonOk({ payment: { ...payment, status: "verified" }, ad: updated });
    }

    assertTransition(prev, "rejected", actor);
    await db
      .from("payments")
      .update({
        status: "rejected",
        admin_note: parsed.data.admin_note ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    const { data: updated, error: upErr } = await db
      .from("ads")
      .update({
        status: "rejected",
        rejection_reason: parsed.data.admin_note ?? "Payment rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("id", ad.id as string)
      .select("*")
      .single();
    if (upErr) return jsonError(upErr.message, 500);

    await logStatusChange(db, {
      ad_id: ad.id as string,
      previous_status: prev,
      new_status: "rejected",
      changed_by: session!.userId,
      note: "Payment rejected",
    });
    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "payment.reject",
      target_type: "payment",
      target_id: id,
      new_value: { status: "rejected" },
    });
    await notifyUser(db, {
      user_id: ad.user_id as string,
      title: "Payment rejected",
      message: "Your payment could not be verified. Check your dashboard for details.",
      link: `/dashboard/client`,
    });
    return jsonOk({ payment: { ...payment, status: "rejected" }, ad: updated });
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
