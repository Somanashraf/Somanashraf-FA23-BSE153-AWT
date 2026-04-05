import { getSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, ctx: Ctx) {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const { id } = await ctx.params;
    const db = supabaseAdmin();
    const { data: n, error: loadErr } = await db
      .from("notifications")
      .select("id")
      .eq("id", id)
      .eq("user_id", session.userId)
      .maybeSingle();
    if (loadErr) return jsonError(loadErr.message, 500);
    if (!n) return jsonError("Not found", 404);

    const { error } = await db
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .eq("user_id", session.userId);
    if (error) return jsonError(error.message, 500);
    return jsonOk({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
