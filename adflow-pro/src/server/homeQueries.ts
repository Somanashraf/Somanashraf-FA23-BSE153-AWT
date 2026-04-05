import "server-only";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeRankScore } from "@/lib/ranking";

export async function getHomePackages() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("packages")
    .select("*")
    .order("price_cents", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getFeaturedAndRecent() {
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from("ads")
    .select(
      `id, title, slug, is_featured, publish_at, admin_boost, rank_refresh_at,
       packages ( weight ),
       categories ( name, slug ),
       cities ( name, slug ),
       ad_media ( thumbnail_url, validation_status )`,
    )
    .eq("status", "published")
    .lte("publish_at", now)
    .gt("expire_at", now)
    .limit(60);
  if (error) throw new Error(error.message);
  type Row = NonNullable<typeof data>[number];
  const scored = (data ?? []).map((row: Row) => {
    const pkg = row.packages as { weight?: number } | null;
    const score = computeRankScore({
      packageWeight: pkg?.weight ?? 1,
      isFeatured: row.is_featured,
      adminBoost: row.admin_boost,
      publishAt: row.publish_at,
      rankRefreshAt: (row as { rank_refresh_at?: string | null }).rank_refresh_at ?? null,
    });
    return { row, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const featured = scored.filter((s) => s.row.is_featured).slice(0, 4);
  // fallback: if no featured ads, show top ranked ones
  const featuredResult = featured.length > 0 ? featured : scored.slice(0, 4);
  // recent: newest publish_at first, regardless of rank
  const recentSorted = [...scored].sort(
    (a, b) =>
      new Date(b.row.publish_at ?? 0).getTime() -
      new Date(a.row.publish_at ?? 0).getTime(),
  );
  const recent = recentSorted.slice(0, 8).map((s) => s.row);
  return {
    featured: featuredResult.map((f) => f.row),
    recent,
  };
}
