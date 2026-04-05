"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setDevUrl(null);
    setPending(true);
    const r = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const j = await r.json().catch(() => ({}));
    setPending(false);
    if (!r.ok) {
      setErr(j.error || "Request failed");
      return;
    }
    setMsg(j.message || "Check your email if an account exists.");
    if (typeof j.resetUrl_for_local_testing_only === "string") {
      setDevUrl(j.resetUrl_for_local_testing_only);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Forgot password</h1>
      <p className="mt-2 text-sm text-slate-500">
        We send a one-hour reset link. In production, wire this to email; development may show a test URL
        below.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 glass rounded-2xl p-6">
        <div>
          <label className="text-xs text-slate-500" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        {err && <p className="text-sm text-rose-400">{err}</p>}
        {msg && <p className="text-sm text-teal-200/90">{msg}</p>}
        {devUrl && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/30 p-3 text-xs text-amber-100/90">
            <p className="font-medium text-amber-200">Development only</p>
            <p className="mt-1 break-all text-amber-100/80">{devUrl}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-teal-400 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-teal-300 hover:text-teal-200">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
