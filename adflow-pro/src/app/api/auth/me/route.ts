import { getSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return jsonError("Unauthorized", 401);
    const db = supabaseAdmin();
    const { data: user, error } = await db
      .from("users")
      .select("id, name, email, role, status, created_at")
      .eq("id", session.userId)
      .maybeSingle();
    if (error) return jsonError(error.message, 500);
    if (!user) return jsonError("Unauthorized", 401);
    return jsonOk({ user });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
