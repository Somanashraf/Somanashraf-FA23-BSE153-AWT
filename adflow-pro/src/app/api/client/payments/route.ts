import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { paymentSchema } from "@/lib/validators";
import { assertTransition, actorForRole } from "@/lib/workflow";
import { logAudit, logStatusChange } from "@/server/audit";
import { notifyAdmins, notifyUser } from "@/server/notify";
import { normalizeMediaUrl } from "@/lib/media";
import { jsonError, jsonOk } from "../../_utils";
import type { AdStatus } from "@/types";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    requireRoles(session, ["client"]);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { ad_id, amount, method, transaction_ref, sender_name, screenshot_url } =
      parsed.data;

    const { data: ad, error: adErr } = await db
      .from("ads")
      .select("*")
      .eq("id", ad_id)
      .eq("user_id", session!.userId)
      .maybeSingle();
    if (adErr) return jsonError(adErr.message, 500);
    if (!ad) return jsonError("Ad not found", 404);
    if (ad.status !== "payment_pending") {
      return jsonError("Ad is not awaiting payment proof", 400);
    }
    if (!ad.package_id) {
      return jsonError("Select a package before submitting payment", 400);
    }

    let shotThumb: string | null = null;
    let shotStatus: string | null = null;
    if (screenshot_url) {
      const n = normalizeMediaUrl(screenshot_url);
      shotThumb = n.thumbnail_url;
      shotStatus = n.validation_status;
    }

    const { data: payment, error: payErr } = await db
      .from("payments")
      .insert({
        ad_id,
        amount,
        method,
        transaction_ref,
        sender_name,
        screenshot_url: screenshot_url ?? null,
        status: "pending",
      })
      .select("*")
      .single();

    if (payErr) {
      if (payErr.code === "23505") {
        return jsonError("Duplicate transaction reference", 409);
      }
      return jsonError(payErr.message, 500);
    }

    const prev = ad.status as AdStatus;
    const actor = actorForRole(session!.role);
    assertTransition(prev, "payment_submitted", actor);

    const { data: updated, error: upErr } = await db
      .from("ads")
      .update({ status: "payment_submitted", updated_at: new Date().toISOString() })
      .eq("id", ad_id)
      .select("*")
      .single();
    if (upErr) return jsonError(upErr.message, 500);

    await logStatusChange(db, {
      ad_id,
      previous_status: prev,
      new_status: "payment_submitted",
      changed_by: session!.userId,
      note: "Payment proof submitted",
    });
    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "payment.submit",
      target_type: "payment",
      target_id: payment.id,
      new_value: {
        amount,
        transaction_ref,
        screenshot_validation: shotStatus,
        screenshot_thumb: shotThumb,
      },
    });

    await notifyUser(db, {
      user_id: session!.userId,
      title: "Payment received",
      message: "Your payment proof is awaiting admin verification.",
      link: `/dashboard/client`,
    });

    await notifyAdmins(db, {
      title: "Payment proof submitted",
      message: `Listing "${ad.title}" has a new payment pending verification.`,
      link: "/dashboard/admin",
    });

    return jsonOk({ payment, ad: updated });
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
