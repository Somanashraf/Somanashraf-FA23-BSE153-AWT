export type UserRole = "client" | "moderator" | "admin" | "super_admin";

export type AdStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "payment_pending"
  | "payment_submitted"
  | "payment_verified"
  | "scheduled"
  | "published"
  | "expired"
  | "archived"
  | "rejected";

export type SessionUser = {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
};
