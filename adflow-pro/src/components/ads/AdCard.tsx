import Link from "next/link";
import { AdThumb } from "./AdThumb";

export type AdCardData = {
  id: string;
  title: string;
  slug: string;
  is_featured?: boolean;
  categories?: { name?: string; slug?: string } | null;
  cities?: { name?: string; slug?: string } | null;
  ad_media?: { thumbnail_url?: string | null }[] | null;
};

export function AdCard({ ad }: { ad: AdCardData }) {
  const thumb = ad.ad_media?.[0]?.thumbnail_url;
  const cat = ad.categories?.name;
  const city = ad.cities?.name;
  return (
    <Link
      href={`/ads/${ad.slug}`}
      className="group glass overflow-hidden rounded-2xl transition hover:border-teal-400/30 hover:shadow-lg hover:shadow-teal-500/10"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900/50">
        <AdThumb
          src={thumb}
          alt=""
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {ad.is_featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-900">
            Featured
          </span>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-white group-hover:text-teal-200">
          {ad.title}
        </h3>
        <p className="text-xs text-slate-500">
          {[cat, city].filter(Boolean).join(" · ")}
        </p>
      </div>
    </Link>
  );
}
