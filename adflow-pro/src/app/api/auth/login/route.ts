import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { signToken } from "@/lib/auth/jwt";
import { loginSchema } from "@/lib/validators";
import { attachAuthCookie, jsonError, jsonOk } from "../../_utils";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonError("Invalid JSON", 400);
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid credentials", 400);
  }
  const { email, password } = parsed.data;
  const db = supabaseAdmin();
  const { data: user, error } = await db
    .from("users")
    .select("id, name, email, role, password_hash, status")
    .eq("email", email.toLowerCase())
    .maybeSingle();
  if (error || !user) return jsonError("Invalid email or password", 401);
  if (user.status !== "active") return jsonError("Account suspended", 403);
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return jsonError("Invalid email or password", 401);
  const token = await signToken({
    userId: user.id,
    email: user.email,
    role: user.role as "client" | "moderator" | "admin" | "super_admin",
    name: user.name,
  });
  const res = jsonOk({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
  return attachAuthCookie(res, token);
}
