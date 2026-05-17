"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const tokenFromUrl = sp.get("token") || "";
  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (password !== confirm) {
      setErr("Passwords do not match");
      return;
    }
    setPending(true);
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const j = await r.json().catch(() => ({}));
    setPending(false);
    if (!r.ok) {
      setErr(j.error || "Reset failed");
      return;
    }
    setMsg(j.message || "Password updated.");
    setTimeout(() => router.push("/login"), 1200);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Set new password</h1>
      <p className="mt-2 text-sm text-slate-500">Use the token from your reset link (or paste it below).</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 glass rounded-2xl p-6">
        <div>
          <label className="text-xs text-slate-500" htmlFor="token">
            Reset token
          </label>
          <input
            id="token"
            type="text"
            required
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 font-mono text-xs outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="password">
            New password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="confirm">
            Confirm password
          </label>
          <input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        {err && <p className="text-sm text-rose-400">{err}</p>}
        {msg && <p className="text-sm text-teal-200/90">{msg}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-teal-400 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {pending ? "Updating…" : "Update password"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="text-teal-300 hover:text-teal-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading…</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
