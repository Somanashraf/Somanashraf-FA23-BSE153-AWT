"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AdCard, type AdCardData } from "@/components/ads/AdCard";

function ExploreInner() {
  const sp = useSearchParams();
  const [ads, setAds] = useState<AdCardData[]>([]);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>(
    [],
  );
  const [cities, setCities] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const q = sp.get("q") || "";
  const category = sp.get("category") || "";
  const city = sp.get("city") || "";
  const sort = sp.get("sort") || "rank";
  const page = Number(sp.get("page") || 1);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (city) params.set("city", city);
    if (sort) params.set("sort", sort);
    params.set("page", String(page));
    params.set("limit", "12");
    const r = await fetch(`/api/ads?${params.toString()}`);
    const j = await r.json();
    setAds(j.ads ?? []);
    setTotal(j.total ?? 0);
    setTotalPages(j.totalPages ?? 0);
    setLoading(false);
  }, [q, category, city, sort, page]);

  const pageHref = useMemo(() => {
    return (nextPage: number) => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (city) params.set("city", city);
      if (sort) params.set("sort", sort);
      params.set("page", String(nextPage));
      return `/explore?${params.toString()}`;
    };
  }, [q, category, city, sort]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const [c, ci] = await Promise.all([
        fetch("/api/categories").then((x) => x.json()),
        fetch("/api/cities").then((x) => x.json()),
      ]);
      setCategories(c.categories ?? []);
      setCities(ci.cities ?? []);
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Explore ads</h1>
      <p className="mt-2 text-sm text-slate-500">
        Active listings only — search and taxonomy filters apply after moderation approval.
      </p>

      <form
        className="mt-8 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-4 md:flex-row md:items-end"
        action="/explore"
        method="get"
      >
        <div className="flex-1">
          <label className="text-xs text-slate-500" htmlFor="q">
            Search
          </label>
          <input
            id="q"
            name="q"
            defaultValue={q}
            placeholder="Title or description keywords"
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/40 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={category}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none md:w-44"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="city">
            City
          </label>
          <select
            id="city"
            name="city"
            defaultValue={city}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none md:w-44"
          >
            <option value="">All</option>
            {cities.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={sort}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none md:w-40"
          >
            <option value="rank">Rank score</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Apply
        </button>
      </form>

      {loading ? (
        <p className="mt-10 text-sm text-slate-500">Loading…</p>
      ) : (
        <>
          <p className="mt-6 text-xs text-slate-500">
            {total} results
            {totalPages > 0 && (
              <span className="text-slate-600">
                {" "}
                · page {page} of {totalPages}
              </span>
            )}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ads.map((ad) => (
              <AdCard key={ad.id} ad={ad} />
            ))}
          </div>
          {!ads.length && (
            <p className="mt-8 text-sm text-slate-500">No active listings match your filters.</p>
          )}
          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(page - 1)}
                  className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-2 text-teal-300 hover:bg-slate-800/80"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-xl border border-white/5 px-4 py-2 text-slate-600">Previous</span>
              )}
              {page < totalPages ? (
                <Link
                  href={pageHref(page + 1)}
                  className="rounded-xl border border-white/15 bg-slate-900/50 px-4 py-2 text-teal-300 hover:bg-slate-800/80"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-xl border border-white/5 px-4 py-2 text-slate-600">Next</span>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading explore…</div>}>
      <ExploreInner />
    </Suspense>
  );
}
