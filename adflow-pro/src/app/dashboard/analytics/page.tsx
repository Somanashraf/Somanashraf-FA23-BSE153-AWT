"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#2dd4bf", "#f87171"];

export default function AnalyticsPage() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/analytics/summary");
      if (!r.ok) {
        setErr("Could not load analytics");
        return;
      }
      setData(await r.json());
    })();
  }, []);

  if (err) return <p className="text-sm text-rose-400">{err}</p>;
  if (!data) return <p className="text-sm text-slate-500">Loading metrics…</p>;

  const rev = data.revenue as { by_package?: Record<string, number> };
  const revRows = Object.entries(rev.by_package ?? {}).map(([name, value]) => ({
    name,
    revenue: value,
  }));

  const tax = data.taxonomy as {
    by_category?: Record<string, number>;
    by_city?: Record<string, number>;
    by_city_rows?: { name: string; ads: number }[];
  };
  const catRows = Object.entries(tax.by_category ?? {}).map(([name, ads]) => ({
    name,
    ads,
  }));

  const cityRows = [...(tax.by_city_rows ?? [])]
    .sort((a, b) => b.ads - a.ads)
    .slice(0, 14);

  const listings = data.listings as Record<string, number>;
  const moderation = data.moderation as Record<string, number | null>;
  const moderationPie = (data.moderation_pie as { name: string; value: number }[]) ?? [];
  const pieData = moderationPie.filter((x) => x.value > 0);
  const snapshots = (data.snapshots as { captured_at: string; payload: unknown }[]) ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-slate-500">KPIs required by the coursework brief.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Total ads", listings.total],
          ["Active", listings.active],
          ["Pipeline", listings.pending_pipeline],
          ["Expired", listings.expired],
        ].map(([k, v]) => (
          <div key={String(k)} className="glass rounded-2xl p-4">
            <p className="text-xs text-slate-500">{k}</p>
            <p className="mt-2 text-2xl font-semibold text-white">{v as number}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass h-80 rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-200">Revenue by package</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={revRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#2dd4bf" name="Verified revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass h-80 rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-200">Published ads by category</p>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart layout="vertical" data={catRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={100} fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="ads" fill="#818cf8" name="Ads" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass h-80 rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-200">Moderation outcomes (30d approx.)</p>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={String(i)} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="mt-8 text-sm text-slate-500">
              No moderation transitions in the last 30 days — pie chart will populate as ads move through
              review.
            </p>
          )}
        </div>
        <div className="glass h-80 rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-200">Published ads by city (top)</p>
          {cityRows.length ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart layout="vertical" data={cityRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#94a3b8" width={88} fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="ads" fill="#38bdf8" name="Ads" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="mt-8 text-sm text-slate-500">No city data for published ads yet.</p>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-4 text-sm text-slate-400">
        <p>
          Moderation summary: approvals {moderation.approx_approvals_30d}, rejections{" "}
          {moderation.approx_rejections_30d}, approval rate {moderation.approval_rate ?? "n/a"}%
        </p>
      </div>

      {snapshots.length > 0 && (
        <div className="glass rounded-2xl p-4">
          <p className="text-sm font-medium text-slate-200">Analytics snapshots (cron)</p>
          <p className="mt-1 text-xs text-slate-500">Recent captured payloads from scheduled jobs.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
              <thead className="border-b border-white/10 text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Captured</th>
                  <th className="py-2 font-medium">Payload (preview)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                {snapshots.map((s) => (
                  <tr key={s.captured_at}>
                    <td className="py-2 pr-4 whitespace-nowrap text-slate-300">
                      {new Date(s.captured_at).toLocaleString()}
                    </td>
                    <td className="py-2 font-mono text-[10px] leading-relaxed">
                      <pre className="max-h-24 overflow-auto whitespace-pre-wrap break-all text-slate-500">
                        {JSON.stringify(s.payload, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
