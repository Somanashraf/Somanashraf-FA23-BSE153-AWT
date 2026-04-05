import { cookies } from "next/headers";
import * as jose from "jose";
import type { SessionUser, UserRole } from "@/types";

const COOKIE = "adflow_token";

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(secret),
    );
    const sub = payload.sub as string | undefined;
    const email = payload.email as string | undefined;
    const role = payload.role as UserRole | undefined;
    const name = (payload.name as string) || "";
    if (!sub || !email || !role) return null;
    return { userId: sub, email, role, name };
  } catch {
    return null;
  }
}

export function sessionCookieName() {
  return COOKIE;
}
