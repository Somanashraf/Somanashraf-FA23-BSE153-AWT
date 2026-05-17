import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(2).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adDraftSchema = z.object({
  title: z.string().min(4).max(200),
  description: z.string().min(10).max(8000),
  category_id: z.string().uuid().optional(),
  city_id: z.string().uuid().optional(),
  media_urls: z.array(z.string().url()).max(8).optional().default([]),
});

export const adPatchSchema = z.object({
  title: z.string().min(4).max(200).optional(),
  description: z.string().min(10).max(8000).optional(),
  category_id: z.string().uuid().nullable().optional(),
  city_id: z.string().uuid().nullable().optional(),
  package_id: z.string().uuid().nullable().optional(),
  action: z.enum(["submit", "save"]).optional(),
  media_urls: z.array(z.string().url()).max(8).optional(),
});

export const paymentSchema = z.object({
  ad_id: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().min(2).max(80),
  transaction_ref: z.string().min(4).max(120),
  sender_name: z.string().min(2).max(120),
  screenshot_url: z.string().url().optional().nullable(),
});

export const moderatorReviewSchema = z.object({
  decision: z.enum(["payment_pending", "rejected", "under_review"]),
  note: z.string().max(2000).optional(),
  rejection_reason: z.string().max(2000).optional(),
});

export const adminPaymentVerifySchema = z.object({
  status: z.enum(["verified", "rejected"]),
  admin_note: z.string().max(2000).optional(),
});

export const adminPublishSchema = z.object({
  mode: z.enum(["now", "schedule"]),
  scheduled_publish_at: z.string().datetime().optional(),
  is_featured: z.boolean().optional(),
  admin_boost: z.number().int().min(0).max(100).optional(),
});

export const reportSchema = z.object({
  reason: z.string().min(4).max(2000),
  reporter_email: z.union([z.string().email(), z.literal("")]).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(16).max(128),
  password: z.string().min(8).max(128),
});

const roleEnum = z.enum(["client", "moderator", "admin", "super_admin"]);
export const adminUserPatchSchema = z.object({
  role: roleEnum.optional(),
  status: z.enum(["active", "suspended"]).optional(),
});
