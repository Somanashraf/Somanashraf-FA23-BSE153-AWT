import { supabaseAdmin } from "@/lib/supabase/admin";
import { jsonError, jsonOk } from "../../_utils";

export async function GET() {
  try {
    const db = supabaseAdmin();
    const { data, error } = await db
      .from("learning_questions")
      .select("id, question, answer, topic, difficulty")
      .eq("is_active", true)
      .limit(50);
    if (error) return jsonError(error.message, 500);
    const rows = data ?? [];
    if (!rows.length) return jsonOk({ question: null });
    const pick = rows[Math.floor(Math.random() * rows.length)];
    return jsonOk({ question: pick });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
