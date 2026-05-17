"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  link: string | null;
  type?: string;
  created_at: string;
};

export function DashboardNotifications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const r = await fetch("/api/notifications");
    if (!r.ok) {
      setRows([]);
      setUnread(0);
      setLoading(false);
      return;
    }
    const j = await r.json();
    setRows(j.notifications ?? []);
    setUnread(j.unread_count ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    load();
  }

  async function markAll() {
    await fetch("/api/notifications/read-all", { method: "POST" });
    load();
  }

  if (loading) {
    return (
      <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
        Loading notifications…
      </div>
    );
  }

  if (!rows.length && unread === 0) {
    return (
      <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-sm text-slate-500">
        No notifications yet — workflow events (submit, review, payment, publish) appear here.
      </div>
    );
  }

  return (
    <section className="mb-8 glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-white">
          Notifications
          {unread > 0 && (
            <span className="ml-2 rounded-full bg-teal-500/30 px-2 py-0.5 text-xs text-teal-200">
              {unread} unread
            </span>
          )}
        </h2>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markAll()}
            className="text-xs font-medium text-teal-300 hover:text-teal-200"
          >
            Mark all read
          </button>
        )}
      </div>
      <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto">
        {rows.map((n) => (
          <li
            key={n.id}
            className={`rounded-lg border px-3 py-2 text-xs ${
              n.is_read ? "border-white/5 bg-slate-950/40 text-slate-500" : "border-teal-500/20 bg-teal-950/20 text-slate-200"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-slate-100">{n.title}</p>
                <p className="mt-0.5 text-slate-400">{n.message}</p>
                <p className="mt-1 text-[10px] text-slate-600">
                  {new Date(n.created_at).toLocaleString()}
                  {n.type && ` · ${n.type}`}
                </p>
                {n.link && (
                  <Link
                    href={n.link}
                    onClick={() => { if (!n.is_read) markRead(n.id); }}
                    className="mt-1 inline-block text-teal-400 hover:underline"
                  >
                    Open link
                  </Link>
                )}
              </div>
              {!n.is_read && (
                <button
                  type="button"
                  onClick={() => markRead(n.id)}
                  className="shrink-0 rounded bg-white/10 px-2 py-1 text-[10px] text-slate-300 hover:bg-white/15"
                >
                  Mark read
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
