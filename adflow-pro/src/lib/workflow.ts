import type { AdStatus } from "@/types";

type Actor = "client" | "moderator" | "admin" | "system";

const matrix: Partial<
  Record<AdStatus, Partial<Record<Actor, AdStatus[]>>>
> = {
  draft: {
    client: ["submitted"],
  },
  submitted: {
    moderator: ["under_review", "rejected"],
  },
  under_review: {
    moderator: ["payment_pending", "rejected"],
  },
  payment_pending: {
    client: ["payment_submitted"],
  },
  payment_submitted: {
    admin: ["payment_verified", "rejected"],
  },
  payment_verified: {
    admin: ["scheduled", "published"],
  },
  scheduled: {
    admin: ["published"],
    system: ["published"],
  },
  published: {
    system: ["expired"],
    admin: ["archived"],
  },
  expired: {
    admin: ["archived"],
  },
  rejected: {
    admin: ["archived"],
  },
  archived: {},
};

export function canTransition(
  from: AdStatus,
  to: AdStatus,
  actor: Actor,
): boolean {
  const allowed = matrix[from]?.[actor];
  return Boolean(allowed?.includes(to));
}

export function assertTransition(
  from: AdStatus,
  to: AdStatus,
  actor: Actor,
): void {
  if (!canTransition(from, to, actor)) {
    throw new Error(`Invalid transition ${from} → ${to} for ${actor}`);
  }
}

export function actorForRole(
  role: string,
): "client" | "moderator" | "admin" | "system" {
  if (role === "moderator") return "moderator";
  if (role === "admin" || role === "super_admin") return "admin";
  if (role === "client") return "client";
  return "client";
}
