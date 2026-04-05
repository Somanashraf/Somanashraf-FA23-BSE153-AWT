"use client";

import { useCallback, useEffect, useState } from "react";

type Ad = {
  id: string;
  title: string;
  slug: string;
  status: string;
  package_id?: string | null;
  packages?: { name?: string; id?: string } | null;
  payments?: { status?: string }[];
};

export default function ClientDashboardPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [packages, setPackages] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cityId, setCityId] = useState("");
  const [mediaUrls, setMediaUrls] = useState("https://picsum.photos/800/600");

  const load = useCallback(async () => {
    const r = await fetch("/api/client/dashboard");
    if (r.ok) {
      const j = await r.json();
      setAds(j.ads ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const [p, c, ci] = await Promise.all([
        fetch("/api/packages").then((x) => x.json()),
        fetch("/api/categories").then((x) => x.json()),
        fetch("/api/cities").then((x) => x.json()),
      ]);
      setPackages((p.packages ?? []).map((x: { id: string; name: string }) => x));
      setCategories(c.categories ?? []);
      setCities(ci.cities ?? []);
    })();
  }, []);

  async function createDraft(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const urls = mediaUrls
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
    const r = await fetch("/api/client/ads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        category_id: categoryId || undefined,
        city_id: cityId || undefined,
        media_urls: urls,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setMsg(j.error || "Could not create draft");
      return;
    }
    setMsg("Draft created");
    setTitle("");
    setDescription("");
    load();
  }

  async function submitAd(id: string) {
    setMsg(null);
    const r = await fetch(`/api/client/ads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submit" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Submit failed");
    else {
      setMsg("Submitted for review");
      load();
    }
  }

  async function setPackage(adId: string, package_id: string) {
    setMsg(null);
    const r = await fetch(`/api/client/ads/${adId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ package_id }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Could not set package");
    else {
      setMsg("Package saved");
      load();
    }
  }

  async function pay(
    adId: string,
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const amount = Number(fd.get("amount"));
    const method = String(fd.get("method"));
    const transaction_ref = String(fd.get("transaction_ref"));
    const sender_name = String(fd.get("sender_name"));
    const screenshot_url = String(fd.get("screenshot_url") || "");
    setMsg(null);
    const r = await fetch("/api/client/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ad_id: adId,
        amount,
        method,
        transaction_ref,
        sender_name,
        screenshot_url: screenshot_url || undefined,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Payment submit failed");
    else {
      setMsg("Payment proof submitted");
      load();
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Client dashboard</h1>
        <p className="text-sm text-slate-500">
          Draft → submit → moderation → package &amp; payment → admin publish.
        </p>
        {msg && <p className="mt-2 text-sm text-teal-300">{msg}</p>}
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-medium">New draft</h2>
        <form onSubmit={createDraft} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            required
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm md:col-span-2"
          />
          <textarea
            required
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[100px] rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm md:col-span-2"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
          >
            <option value="">Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={cityId}
            onChange={(e) => setCityId(e.target.value)}
            className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
          >
            <option value="">City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Media URLs (comma or newline separated)"
            value={mediaUrls}
            onChange={(e) => setMediaUrls(e.target.value)}
            className="min-h-[70px] rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm md:col-span-2"
          />
          <button
            type="submit"
            className="rounded-xl bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 md:col-span-2"
          >
            Save draft
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Your listings</h2>
        <div className="space-y-4">
          {ads.map((ad) => (
            <div key={ad.id} className="glass rounded-2xl p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-white">{ad.title}</p>
                  <p className="text-xs text-slate-500">
                    {ad.status} · {ad.slug}
                  </p>
                </div>
                {ad.status === "draft" && (
                  <button
                    type="button"
                    onClick={() => submitAd(ad.id)}
                    className="rounded-lg bg-white/10 px-3 py-1 text-xs"
                  >
                    Submit for review
                  </button>
                )}
              </div>
              {ad.status === "payment_pending" && (
                <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-white/5 pt-3">
                  <div>
                    <p className="text-xs text-slate-500">Select package</p>
                    <select
                      defaultValue={ad.package_id ?? ""}
                      onChange={(e) => setPackage(ad.id, e.target.value)}
                      className="mt-1 rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs"
                    >
                      <option value="" disabled>
                        Choose…
                      </option>
                      {packages.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <form className="grid gap-2 md:grid-cols-3" onSubmit={(ev) => pay(ad.id, ev)}>
                    <input name="amount" type="number" step="0.01" placeholder="Amount" required className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs" />
                    <input name="method" placeholder="Method" defaultValue="Bank transfer" required className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs" />
                    <input name="transaction_ref" placeholder="Txn ref" required className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs" />
                    <input name="sender_name" placeholder="Sender name" required className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs md:col-span-1" />
                    <input name="screenshot_url" placeholder="Screenshot URL (optional)" className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs md:col-span-2" />
                    <button type="submit" className="rounded-lg bg-teal-400/90 px-3 py-1 text-xs font-semibold text-slate-950 md:col-span-3">
                      Submit payment proof
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
