import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    const db = supabaseAdmin();
    const { data: ad, error } = await db
      .from("ads")
      .select(
        `id, user_id, title, slug, description, publish_at, expire_at, is_featured, status,
         packages ( id, name, slug, weight, duration_days, homepage_visibility ),
         categories ( name, slug ),
         cities ( name, slug ),
         ad_media ( id, source_type, original_url, thumbnail_url, validation_status )`,
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) return jsonError(error.message, 500);
    if (!ad) return jsonError("Not found", 404);

    const now = new Date().toISOString();
    const okPublic =
      ad.status === "published" &&
      ad.publish_at &&
      ad.expire_at &&
      ad.publish_at <= now &&
      ad.expire_at > now;

    if (!okPublic) {
      return jsonError("Not found", 404);
    }

    const { data: seller } = await db
      .from("seller_profiles")
      .select("display_name, business_name, phone, city, is_verified")
      .eq("user_id", ad.user_id)
      .maybeSingle();

    const { data: owner } = await db
      .from("users")
      .select("id, name, email")
      .eq("id", ad.user_id)
      .maybeSingle();

    return jsonOk({
      ad: {
        ...ad,
        seller,
        owner,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
