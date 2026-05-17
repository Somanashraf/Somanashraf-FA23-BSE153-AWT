import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdCard, type AdCardData } from "@/components/ads/AdCard";

type Props = { params: Promise<{ slug: string }> };

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const db = supabaseAdmin();
  const { data: cat } = await db
    .from("categories")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!cat) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-slate-500">Category not found.</p>
        <Link href="/explore" className="mt-4 inline-block text-teal-300">
          Back to explore
        </Link>
      </div>
    );
  }
  const now = new Date().toISOString();
  const { data } = await db
    .from("ads")
    .select(
      `id, title, slug, is_featured, categories ( name, slug ), cities ( name, slug ), ad_media ( thumbnail_url )`,
    )
    .eq("status", "published")
    .eq("category_id", cat.id)
    .lte("publish_at", now)
    .gt("expire_at", now)
    .limit(24);

  const ads = (data ?? []) as AdCardData[];

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-300">Category</p>
      <h1 className="mt-2 text-3xl font-semibold">{cat.name}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Taxonomy-driven browse — only active, approved listings appear here.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ads.map((ad) => (
          <AdCard key={ad.id} ad={ad} />
        ))}
      </div>
      {!ads.length && <p className="mt-8 text-sm text-slate-500">No live ads in this category.</p>}
    </div>
  );
}
