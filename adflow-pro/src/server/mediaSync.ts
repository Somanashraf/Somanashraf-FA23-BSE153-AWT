import type { SupabaseClient } from "@supabase/supabase-js";
import { normalizeMediaUrl } from "@/lib/media";

export async function replaceAdMedia(
  db: SupabaseClient,
  adId: string,
  urls: string[],
) {
  await db.from("ad_media").delete().eq("ad_id", adId);
  if (!urls.length) return;
  const rows = urls.map((u, i) => {
    const n = normalizeMediaUrl(u);
    return {
      ad_id: adId,
      source_type: n.source_type,
      original_url: n.original_url,
      thumbnail_url: n.thumbnail_url,
      validation_status: n.validation_status,
      sort_order: i,
    };
  });
  await db.from("ad_media").insert(rows);
}
