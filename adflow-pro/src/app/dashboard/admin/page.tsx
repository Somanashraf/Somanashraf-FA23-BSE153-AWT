"use client";

import { useCallback, useEffect, useState } from "react";

type PayRow = {
  id: string;
  amount: number;
  transaction_ref: string;
  ads?: { id: string; title: string; slug: string };
};

type PubRow = {
  id: string;
  title: string;
  slug: string;
};

export default function AdminPage() {
  const [payments, setPayments] = useState<PayRow[]>([]);
  const [publish, setPublish] = useState<PubRow[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [a, b] = await Promise.all([
      fetch("/api/admin/payment-queue"),
      fetch("/api/admin/publish-queue"),
    ]);
    if (a.ok) {
      const j = await a.json();
      setPayments(j.queue ?? []);
    }
    if (b.ok) {
      const j = await b.json();
      setPublish(j.queue ?? []);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function verifyPayment(id: string, status: "verified" | "rejected") {
    setMsg(null);
    const r = await fetch(`/api/admin/payments/${id}/verify`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, admin_note: "Admin dashboard" }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Failed");
    else {
      setMsg("Payment updated");
      load();
    }
  }

  async function publishAd(
    id: string,
    mode: "now" | "schedule",
    scheduled?: string,
  ) {
    setMsg(null);
    const r = await fetch(`/api/admin/ads/${id}/publish`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mode,
        scheduled_publish_at: mode === "schedule" ? scheduled : undefined,
      }),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) setMsg(j.error || "Publish failed");
    else {
      setMsg("Publish action saved");
      load();
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Admin operations</h1>
        <p className="text-sm text-slate-500">Verify proofs, then publish or schedule listings.</p>
        {msg && <p className="mt-2 text-sm text-teal-300">{msg}</p>}
      </div>

      <section>
        <h2 className="text-lg font-medium">Payment verification</h2>
        <div className="mt-4 space-y-3">
          {payments.map((p) => (
            <div key={p.id} className="glass flex flex-col gap-2 rounded-2xl p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-white">{p.ads?.title}</p>
                <p className="text-xs text-slate-500">
                  {p.transaction_ref} · ${p.amount}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => verifyPayment(p.id, "verified")}
                  className="rounded-lg bg-teal-400/90 px-3 py-1 text-xs font-semibold text-slate-950"
                >
                  Verify
                </button>
                <button
                  type="button"
                  onClick={() => verifyPayment(p.id, "rejected")}
                  className="rounded-lg bg-rose-500/30 px-3 py-1 text-xs text-rose-200"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!payments.length && <p className="text-sm text-slate-500">No pending proofs.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-medium">Ready to publish</h2>
        <div className="mt-4 space-y-4">
          {publish.map((ad) => (
            <div key={ad.id} className="glass rounded-2xl p-4">
              <p className="font-medium text-white">{ad.title}</p>
              <p className="text-xs text-slate-500">{ad.slug}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => publishAd(ad.id, "now")}
                  className="rounded-lg bg-teal-400 px-3 py-1 text-xs font-semibold text-slate-950"
                >
                  Publish now
                </button>
                <SchedulePublish onSchedule={(iso) => publishAd(ad.id, "schedule", iso)} />
              </div>
            </div>
          ))}
          {!publish.length && <p className="text-sm text-slate-500">Nothing waiting to publish.</p>}
        </div>
      </section>
    </div>
  );
}

function SchedulePublish({
  onSchedule,
}: {
  onSchedule: (iso: string) => void;
}) {
  const [dt, setDt] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="datetime-local"
        value={dt}
        onChange={(e) => setDt(e.target.value)}
        className="rounded-lg border border-white/10 bg-slate-950 px-2 py-1 text-xs"
      />
      <button
        type="button"
        onClick={() => {
          if (!dt) return;
          const iso = new Date(dt).toISOString();
          onSchedule(iso);
        }}
        className="rounded-lg bg-white/10 px-3 py-1 text-xs"
      >
        Schedule
      </button>
    </div>
  );
}
