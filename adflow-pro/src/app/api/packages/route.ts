import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../_utils";

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("packages")
      .select("*")
      .order("price_cents", { ascending: true });
    if (error) return jsonError(error.message, 500);
    return jsonOk({ packages: data ?? [] });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
