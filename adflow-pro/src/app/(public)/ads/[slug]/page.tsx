import Link from "next/link";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { AdThumb } from "@/components/ads/AdThumb";
import { ReportAdButton } from "@/components/ads/ReportAdButton";

type Props = { params: Promise<{ slug: string }> };

export default async function AdDetailPage({ params }: Props) {
  const { slug } = await params;
  const db = supabaseAdmin();
  const { data: ad } = await db
    .from("ads")
    .select(
      `id, user_id, title, slug, description, publish_at, expire_at, is_featured, status,
       packages ( name, slug, weight, duration_days, homepage_visibility ),
       categories ( name, slug ),
       cities ( name, slug ),
       ad_media ( id, source_type, original_url, thumbnail_url, validation_status )`,
    )
    .eq("slug", slug)
    .maybeSingle();

  if (!ad) notFound();
  const now = new Date().toISOString();
  const visible =
    ad.status === "published" &&
    ad.publish_at &&
    ad.expire_at &&
    ad.publish_at <= now &&
    ad.expire_at > now;
  if (!visible) notFound();

  const { data: seller } = await db
    .from("seller_profiles")
    .select("display_name, business_name, phone, city, is_verified")
    .eq("user_id", ad.user_id)
    .maybeSingle();

  const media = (ad.ad_media ?? []) as {
    id: string;
    thumbnail_url: string | null;
    original_url: string;
    source_type: string;
    validation_status: string;
  }[];

  const pkg = ad.packages as { name?: string; slug?: string } | null;
  const cat = ad.categories as { name?: string; slug?: string } | null;
  const city = ad.cities as { name?: string; slug?: string } | null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="grid gap-3 sm:grid-cols-2">
            {media.map((m) => (
              <div
                key={m.id}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50"
              >
                <AdThumb
                  src={m.thumbnail_url || m.original_url}
                  alt=""
                  className="object-cover"
                />
                <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] uppercase text-slate-200">
                  {m.validation_status} · {m.source_type}
                </span>
              </div>
            ))}
          </div>
          <h1 className="mt-8 text-3xl font-semibold">{ad.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            {cat && (
              <Link href={`/category/${cat.slug}`} className="rounded-full bg-white/5 px-2 py-1 hover:text-teal-300">
                {cat.name}
              </Link>
            )}
            {city && (
              <Link href={`/city/${city.slug}`} className="rounded-full bg-white/5 px-2 py-1 hover:text-teal-300">
                {city.name}
              </Link>
            )}
            {pkg && (
              <span className="rounded-full bg-teal-400/15 px-2 py-1 text-teal-200">
                Package: {pkg.name}
              </span>
            )}
            {ad.is_featured && (
              <span className="rounded-full bg-amber-400/20 px-2 py-1 text-amber-200">Featured</span>
            )}
          </div>
          <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {ad.description}
          </p>
          <p className="mt-6 text-xs text-slate-500">
            Live until {ad.expire_at ? new Date(ad.expire_at).toLocaleString() : "—"}
          </p>
          <div className="mt-6">
            <ReportAdButton slug={slug} />
          </div>
        </div>
        <aside className="glass h-fit rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-200">Seller</h2>
          <p className="mt-2 text-lg font-medium text-white">
            {seller?.display_name ?? "Verified seller"}
          </p>
          {seller?.business_name && (
            <p className="text-sm text-slate-500">{seller.business_name}</p>
          )}
          <dl className="mt-4 space-y-2 text-sm text-slate-400">
            {seller?.city && (
              <div>
                <dt className="text-xs uppercase text-slate-600">City</dt>
                <dd>{seller.city}</dd>
              </div>
            )}
            {seller?.phone && (
              <div>
                <dt className="text-xs uppercase text-slate-600">Phone</dt>
                <dd>{seller.phone}</dd>
              </div>
            )}
            {seller?.is_verified && (
              <p className="text-xs text-teal-300">Verified seller badge (demo)</p>
            )}
          </dl>
        </aside>
      </div>
    </div>
  );
}
