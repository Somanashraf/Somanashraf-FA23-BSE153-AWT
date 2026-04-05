"use client";

import { useCallback, useEffect, useState } from "react";

type Row = {
  id: string;
  title: string;
  status: string;
  slug: string;
};

export default function ModeratorPage() {
  const [queue, setQueue] = useState<Row[]>([]);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await fetch("/api/moderator/review-queue");
    if (r.ok) {
      const j = await r.json();
      setQueue(j.queue ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function review(id: string, decision: string) {
    setMsg(null);
    const r = await fetch(`/api/moderator/ads/${id}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        note: note || undefined,
        rejection_reason: decision === "rejected" ? reason : undefined,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Failed");
    else {
      setMsg("Updated");
      setNote("");
      setReason("");
      load();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Moderation queue</h1>
        <p className="text-sm text-slate-500">
          Move submitted listings into review, then release to payment or reject with a reason.
        </p>
        <div className="mt-4 rounded-xl border border-indigo-400/30 bg-indigo-950/40 px-4 py-3 text-sm text-slate-300">
          <p className="font-medium text-indigo-200">Moderator vs admin (different people in this demo)</p>
          <p className="mt-1 text-slate-400">
            This screen only does <strong className="text-slate-200">content review</strong>.{" "}
            <strong className="text-slate-200">Payment verification</strong> and{" "}
            <strong className="text-slate-200">Publish</strong> are on the{" "}
            <strong className="text-teal-300">Admin</strong> dashboard — you must{" "}
            <strong className="text-slate-200">Log out</strong>, then sign in as{" "}
            <code className="text-teal-200">admin@demo.local</code> (same password{" "}
            <code className="text-teal-200">Password123!</code>).
          </p>
        </div>
        {msg && <p className="mt-2 text-sm text-teal-300">{msg}</p>}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <textarea
          placeholder="Internal moderation note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
        <textarea
          placeholder="Rejection reason (required when rejecting)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-3">
        {queue.map((ad) => (
          <div key={ad.id} className="glass flex flex-col gap-3 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-white">{ad.title}</p>
              <p className="text-xs text-slate-500">
                {ad.status} · {ad.slug}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {ad.status === "submitted" && (
                <button
                  type="button"
                  onClick={() => review(ad.id, "under_review")}
                  className="rounded-lg bg-white/10 px-3 py-1 text-xs"
                >
                  Mark in review
                </button>
              )}
              {ad.status === "under_review" && (
                <button
                  type="button"
                  onClick={() => review(ad.id, "payment_pending")}
                  className="rounded-lg bg-teal-400/20 px-3 py-1 text-xs text-teal-200"
                >
                  Approve → payment
                </button>
              )}
              <button
                type="button"
                onClick={() => review(ad.id, "rejected")}
                className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs text-rose-200"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
        {!queue.length && <p className="text-sm text-slate-500">Queue is clear.</p>}
      </div>
    </div>
  );
}
