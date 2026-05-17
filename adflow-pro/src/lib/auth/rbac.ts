import type { SessionUser, UserRole } from "@/types";

export function requireUser(s: SessionUser | null): SessionUser {
  if (!s) throw new Error("UNAUTHORIZED");
  return s;
}

export function requireRoles(s: SessionUser | null, roles: UserRole[]): SessionUser {
  const u = requireUser(s);
  if (!roles.includes(u.role)) throw new Error("FORBIDDEN");
  return u;
}

export function isAdminLike(role: UserRole) {
  return role === "admin" || role === "super_admin";
}
