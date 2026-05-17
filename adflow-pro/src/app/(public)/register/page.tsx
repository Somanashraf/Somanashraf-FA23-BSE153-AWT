"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setErr(j.error || "Registration failed");
      return;
    }
    router.push("/dashboard/client");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-semibold">Create client account</h1>
      <p className="mt-2 text-sm text-slate-500">Moderator and admin roles are seeded separately.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 glass rounded-2xl p-6">
        <div>
          <label className="text-xs text-slate-500" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-teal-400/30 focus:ring-2"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500" htmlFor="password">
            Password (min 8 chars)
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
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
          Register &amp; continue
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already registered?{" "}
        <Link href="/login" className="text-teal-300 hover:text-teal-200">
          Sign in
        </Link>
      </p>
    </div>
  );
}
