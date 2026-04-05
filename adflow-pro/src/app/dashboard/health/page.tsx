"use client";

import { useEffect, useState } from "react";

export default function HealthPage() {
  const [ping, setPing] = useState<Record<string, unknown> | null>(null);
  const [logs, setLogs] = useState<Record<string, unknown>[]>([]);

  async function run() {
    const r = await fetch("/api/health/db");
    const j = await r.json().catch(() => ({}));
    setPing(j);
    const a = await fetch("/api/admin/analytics/summary");
    if (a.ok) {
      const aj = await a.json();
      setLogs((aj.operations?.health_recent as Record<string, unknown>[]) ?? []);
    }
  }

  useEffect(() => {
    run();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">System health</h1>
          <p className="text-sm text-slate-500">Database heartbeat and recent cron/API checks.</p>
        </div>
        <button
          type="button"
          onClick={() => run()}
          className="rounded-lg bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Run heartbeat
        </button>
      </div>
      <div className="glass rounded-2xl p-4 text-sm">
        <p className="text-slate-500">Latest check</p>
        <pre className="mt-2 overflow-x-auto text-xs text-teal-200">
          {JSON.stringify(ping, null, 2)}
        </pre>
      </div>
      <div className="glass rounded-2xl p-4">
        <p className="text-sm font-medium text-white">Recent health logs</p>
        <table className="mt-3 w-full text-left text-xs text-slate-400">
          <thead>
            <tr className="text-slate-500">
              <th className="py-2">Source</th>
              <th>Status</th>
              <th>ms</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l, i) => (
              <tr key={`${String(l.checked_at)}-${i}`} className="border-t border-white/5">
                <td className="py-2">{String(l.source)}</td>
                <td>{String(l.status)}</td>
                <td>{l.response_ms != null ? String(l.response_ms) : "—"}</td>
                <td>{l.checked_at ? String(l.checked_at) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
