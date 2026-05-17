import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { resetPasswordSchema } from "@/lib/validators";
import { jsonError, jsonOk } from "../../_utils";

function hashToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return jsonError("Invalid JSON", 400);
    }
    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const { token, password } = parsed.data;
    const db = supabaseAdmin();
    const token_hash = hashToken(token);
    const now = new Date().toISOString();

    const { data: row, error } = await db
      .from("password_reset_tokens")
      .select("id, user_id, expires_at, used_at")
      .eq("token_hash", token_hash)
      .maybeSingle();

    if (error) return jsonError(error.message, 500);
    if (!row || row.used_at || row.expires_at < now) {
      return jsonError("Invalid or expired reset link", 400);
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { error: upUser } = await db
      .from("users")
      .update({ password_hash, updated_at: now })
      .eq("id", row.user_id);
    if (upUser) return jsonError(upUser.message, 500);

    await db
      .from("password_reset_tokens")
      .update({ used_at: now })
      .eq("id", row.id);

    await db.from("password_reset_tokens").delete().eq("user_id", row.user_id);

    return jsonOk({ ok: true, message: "Password updated. You can sign in now." });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
