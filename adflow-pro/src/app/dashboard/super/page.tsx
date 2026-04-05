"use client";

import { useCallback, useEffect, useState } from "react";

type Pkg = {
  id: string;
  name: string;
  slug: string;
  duration_days: number;
  weight: number;
  price_cents: number;
  homepage_visibility: boolean;
  is_featured_tier: boolean;
  description: string | null;
};

export default function SuperAdminPage() {
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/super/packages");
    if (r.ok) {
      const j = await r.json();
      setPackages(j.packages ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function save(p: Pkg, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const fd = new FormData(e.currentTarget);
    const patch = {
      id: p.id,
      duration_days: Number(fd.get("duration_days")),
      weight: Number(fd.get("weight")),
      price_cents: Math.round(Number(fd.get("price")) * 100),
      homepage_visibility: fd.get("homepage_visibility") === "on",
      is_featured_tier: fd.get("is_featured_tier") === "on",
      description: String(fd.get("description") || ""),
    };
    const r = await fetch("/api/super/packages", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Update failed");
    else {
      setMsg("Package updated");
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Super admin — packages</h1>
        <p className="text-sm text-slate-500">Adjust engine rules that drive ranking and visibility.</p>
        {msg && <p className="mt-2 text-sm text-teal-300">{msg}</p>}
      </div>
      <div className="space-y-6">
        {packages.map((p) => (
          <form
            key={p.id}
            onSubmit={(e) => save(p, e)}
            className="glass grid gap-3 rounded-2xl p-4 md:grid-cols-3"
          >
            <div className="md:col-span-3">
              <p className="text-sm font-semibold text-white">
                {p.name}{" "}
                <span className="text-xs font-normal text-slate-500">({p.slug})</span>
              </p>
            </div>
            <label className="text-xs text-slate-500">
              Duration (days)
              <input
                name="duration_days"
                type="number"
                defaultValue={p.duration_days}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              Weight
              <input
                name="weight"
                type="number"
                defaultValue={p.weight}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="text-xs text-slate-500">
              Price (USD)
              <input
                name="price"
                type="number"
                step="0.01"
                defaultValue={(p.price_cents / 100).toFixed(2)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 md:col-span-1">
              <input type="checkbox" name="homepage_visibility" defaultChecked={p.homepage_visibility} />
              Homepage visibility
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-400 md:col-span-1">
              <input type="checkbox" name="is_featured_tier" defaultChecked={p.is_featured_tier} />
              Featured tier
            </label>
            <label className="text-xs text-slate-500 md:col-span-3">
              Description
              <textarea
                name="description"
                defaultValue={p.description ?? ""}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-2 py-2 text-sm"
                rows={2}
              />
            </label>
            <button
              type="submit"
              className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-3"
            >
              Save package
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
