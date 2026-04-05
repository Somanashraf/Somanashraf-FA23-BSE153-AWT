import { supabaseAdmin } from "@/lib/supabase/admin";
import { computeRankScore } from "@/lib/ranking";
import { jsonError, jsonOk } from "../_utils";

const FETCH_CAP = 500;

export async function GET(req: Request) {
  try {
    const db = supabaseAdmin();
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().replace(/%/g, "");
    const categorySlug = (searchParams.get("category") || "").trim();
    const citySlug = (searchParams.get("city") || "").trim();
    const sort = searchParams.get("sort") || "rank";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(48, Math.max(1, Number(searchParams.get("limit") || 12)));

    let categoryId: string | undefined;
    if (categorySlug) {
      const { data: cat } = await db
        .from("categories")
        .select("id")
        .eq("slug", categorySlug)
        .eq("is_active", true)
        .maybeSingle();
      if (!cat?.id) {
        return jsonOk({
          ads: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
        });
      }
      categoryId = cat.id;
    }

    let cityId: string | undefined;
    if (citySlug) {
      const { data: c } = await db
        .from("cities")
        .select("id")
        .eq("slug", citySlug)
        .eq("is_active", true)
        .maybeSingle();
      if (!c?.id) {
        return jsonOk({
          ads: [],
          page,
          limit,
          total: 0,
          totalPages: 0,
        });
      }
      cityId = c.id;
    }

    let query = db
      .from("ads")
      .select(
        `id, title, slug, description, publish_at, expire_at, is_featured, admin_boost, rank_refresh_at,
         packages ( weight, name, homepage_visibility, slug ),
         categories ( name, slug ),
         cities ( name, slug ),
         ad_media ( thumbnail_url, validation_status, source_type )`,
      )
      .eq("status", "published")
      .lte("publish_at", new Date().toISOString())
      .gt("expire_at", new Date().toISOString())
      .limit(FETCH_CAP);

    if (categoryId) query = query.eq("category_id", categoryId);
    if (cityId) query = query.eq("city_id", cityId);
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error } = await query;
    if (error) return jsonError(error.message, 500);

    type Row = NonNullable<typeof data>[number];
    const decorated = (data ?? []).map((row: Row) => {
      const pkg = row.packages as { weight?: number } | null;
      const w = pkg?.weight ?? 1;
      const score = computeRankScore({
        packageWeight: w,
        isFeatured: row.is_featured,
        adminBoost: row.admin_boost,
        publishAt: row.publish_at,
        rankRefreshAt: (row as { rank_refresh_at?: string | null }).rank_refresh_at ?? null,
      });
      return { ...row, _rank: score };
    });

    if (sort === "newest") {
      decorated.sort(
        (a, b) =>
          new Date(b.publish_at || 0).getTime() -
          new Date(a.publish_at || 0).getTime(),
      );
    } else {
      decorated.sort((a, b) => b._rank - a._rank);
    }

    const total = decorated.length;
    const from = (page - 1) * limit;
    const paged = decorated.slice(from, from + limit);

    return jsonOk({
      ads: paged.map(({ _rank, ...ad }) => ad),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Server error";
    return jsonError(msg, 500);
  }
}
