import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth/session";
import { requireRoles } from "@/lib/auth/rbac";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { uniqueSlug } from "@/lib/slug";
import { adDraftSchema } from "@/lib/validators";
import { replaceAdMedia } from "@/server/mediaSync";
import { logAudit, logStatusChange } from "@/server/audit";
import { notifyUser } from "@/server/notify";
import { jsonError, jsonOk } from "../../_utils";

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
    const parsed = adDraftSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const { title, description, category_id, city_id, media_urls } = parsed.data;
    const db = supabaseAdmin();
    const slug = uniqueSlug(title, randomUUID());
    const { data: ad, error } = await db
      .from("ads")
      .insert({
        user_id: session!.userId,
        title,
        description,
        slug,
        status: "draft",
        category_id: category_id ?? null,
        city_id: city_id ?? null,
      })
      .select("*")
      .single();
    if (error) return jsonError(error.message, 500);
    await replaceAdMedia(db, ad.id, media_urls ?? []);
    await logAudit(db, {
      actor_id: session!.userId,
      action_type: "ad.create_draft",
      target_type: "ad",
      target_id: ad.id,
      new_value: { title },
    });
    await logStatusChange(db, {
      ad_id: ad.id,
      previous_status: null,
      new_status: "draft",
      changed_by: session!.userId,
      note: "Created",
    });
    await notifyUser(db, {
      user_id: session!.userId,
      title: "Draft saved",
      message: `"${title}" is saved as a draft. Submit it when you are ready for moderation.`,
      link: "/dashboard/client",
      type: "draft",
    });
    return jsonOk({ ad });
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
