import { supabaseAdmin } from "@/lib/supabase/admin";
import { reportSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "../../../_utils";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, ctx: Ctx) {
  try {
    const { slug } = await ctx.params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const db = supabaseAdmin();
    const { data: ad } = await db
      .from("ads")
      .select("id, status, publish_at, expire_at")
      .eq("slug", slug)
      .maybeSingle();
    if (!ad) return jsonError("Ad not found", 404);
    const now = new Date().toISOString();
    const visible =
      ad.status === "published" &&
      ad.publish_at &&
      ad.expire_at &&
      ad.publish_at <= now &&
      ad.expire_at > now;
    if (!visible) return jsonError("Ad not found", 404);

    await db.from("ad_reports").insert({
      ad_id: ad.id,
      reason: parsed.data.reason,
      reporter_email: parsed.data.reporter_email ?? null,
    });
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
