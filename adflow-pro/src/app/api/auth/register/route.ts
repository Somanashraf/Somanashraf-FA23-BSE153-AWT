import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validators";
import { signToken } from "@/lib/auth/jwt";
import { attachAuthCookie, jsonError, jsonOk } from "../../_utils";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.flatten().formErrors.join(", "), 400);
  }
  const { name, email, password, displayName } = parsed.data;
  const db = supabaseAdmin();
  const password_hash = await bcrypt.hash(password, 10);
  const { data: user, error } = await db
    .from("users")
    .insert({
      name,
      email: email.toLowerCase(),
      password_hash,
      role: "client",
    })
    .select("id, name, email, role")
    .single();
  if (error) {
    if (error.code === "23505") return jsonError("Email already registered", 409);
    return jsonError(error.message, 500);
  }
  await db.from("seller_profiles").insert({
    user_id: user.id,
    display_name: displayName || name,
  });
  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: "client",
    name: user.name,
  });
  const res = jsonOk({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  return attachAuthCookie(res, token);
}
