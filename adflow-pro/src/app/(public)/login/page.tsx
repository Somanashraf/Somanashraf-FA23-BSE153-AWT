"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || "Login failed");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-slate-500">
        Demo accounts ship with the seed script — see README.
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
        <div>
          <label className="text-xs text-slate-500" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        {err && <p className="text-sm text-rose-400">{err}</p>}
        <button
          type="submit"
          className="w-full rounded-xl bg-teal-400 py-2.5 text-sm font-semibold text-slate-950"
        >
          Continue
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        No account?{" "}
        <Link href="/register" className="text-teal-300 hover:text-teal-200">
          Register
        </Link>
        {" · "}
        <Link href="/forgot-password" className="text-slate-400 hover:text-slate-300">
          Forgot password
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
