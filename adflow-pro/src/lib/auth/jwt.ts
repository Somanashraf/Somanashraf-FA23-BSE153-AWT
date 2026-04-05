import * as jose from "jose";
import type { UserRole } from "@/types";

export async function signToken(input: {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new jose.SignJWT({
    email: input.email,
    role: input.role,
    name: input.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));
}
