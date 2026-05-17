"use client";

import { useState } from "react";

export function ReportAdButton({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const r = await fetch(`/api/ads/${encodeURIComponent(slug)}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reason,
        reporter_email: email || undefined,
      }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setMsg(j.error || "Could not submit report");
      return;
    }
    setMsg("Thanks — moderators will review this report.");
    setOpen(false);
    setReason("");
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium text-rose-300 hover:text-rose-200"
      >
        Report listing
      </button>
      {open && (
        <form
          onSubmit={submit}
          className="mt-3 space-y-2 rounded-xl border border-white/10 bg-slate-950/60 p-3"
        >
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issue"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs outline-none"
            rows={3}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email (optional)"
            className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-2 text-xs outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-semibold text-white"
          >
            Submit report
          </button>
        </form>
      )}
      {msg && <p className="mt-2 text-xs text-teal-300">{msg}</p>}
    </div>
  );
}
