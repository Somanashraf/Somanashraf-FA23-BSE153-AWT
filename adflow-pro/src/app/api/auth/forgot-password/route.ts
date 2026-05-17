import { createHash, randomBytes } from "crypto";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { forgotPasswordSchema } from "@/lib/validators";
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
    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
    }
    const email = parsed.data.email.toLowerCase();
    const db = supabaseAdmin();
    const { data: user } = await db
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    const generic =
      "If an account exists for that email, you can reset the password using the link we provide.";

    if (!user) {
      return jsonOk({ ok: true, message: generic });
    }

    await db.from("password_reset_tokens").delete().eq("user_id", user.id);

    const raw = randomBytes(32).toString("hex");
    const token_hash = hashToken(raw);
    const expires_at = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { error } = await db.from("password_reset_tokens").insert({
      user_id: user.id,
      token_hash,
      expires_at,
    });
    if (error) return jsonError(error.message, 500);

    const base =
      process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${raw}`;

    const devHint =
      process.env.NODE_ENV === "development"
        ? { resetUrl_for_local_testing_only: resetUrl }
        : {};

    return jsonOk({
      ok: true,
      message: generic,
      ...devHint,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
