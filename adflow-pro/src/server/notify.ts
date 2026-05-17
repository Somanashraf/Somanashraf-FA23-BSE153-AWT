import type { SupabaseClient } from "@supabase/supabase-js";

export async function notifyUser(
  db: SupabaseClient,
  input: {
    user_id: string;
    title: string;
    message: string;
    type?: string;
    link?: string | null;
  },
) {
  await db.from("notifications").insert({
    user_id: input.user_id,
    title: input.title,
    message: input.message,
    type: input.type ?? "info",
    link: input.link ?? null,
  });
}

export async function notifyModerators(
  db: Parameters<typeof notifyUser>[0],
  input: { title: string; message: string; link?: string | null; type?: string },
) {
  const { data } = await db.from("users").select("id").eq("role", "moderator");
  for (const u of data ?? []) {
    await notifyUser(db, {
      user_id: u.id as string,
      title: input.title,
      message: input.message,
      link: input.link ?? "/dashboard/moderator",
      type: input.type ?? "moderation",
    });
  }
}

export async function notifyAdmins(
  db: Parameters<typeof notifyUser>[0],
  input: { title: string; message: string; link?: string | null; type?: string },
) {
  const { data } = await db
    .from("users")
    .select("id")
    .in("role", ["admin", "super_admin"]);
  for (const u of data ?? []) {
    await notifyUser(db, {
      user_id: u.id as string,
      title: input.title,
      message: input.message,
      link: input.link ?? "/dashboard/admin",
      type: input.type ?? "admin",
    });
  }
}
