"use client";

import { useCallback, useEffect, useState } from "react";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
};

const ROLES = ["client", "moderator", "admin", "super_admin"] as const;

export default function AdminUsersPage() {
  const [me, setMe] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    const rMe = await fetch("/api/auth/me");
    if (!rMe.ok) {
      setMe(null);
      setUsers([]);
      setErr("Sign in required");
      setLoading(false);
      return;
    }
    const jMe = await rMe.json();
    setMe(jMe.user ?? null);
    const rUsers = await fetch("/api/admin/users");
    if (!rUsers.ok) {
      const j = await rUsers.json().catch(() => ({}));
      setErr(j.error || "Could not load users");
      setUsers([]);
      setLoading(false);
      return;
    }
    const jU = await rUsers.json();
    setUsers(jU.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function patchUser(
    id: string,
    body: { role?: string; status?: string },
  ) {
    setMsg(null);
    setErr(null);
    const r = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      setErr(j.error || "Update failed");
      return;
    }
    setMsg("Saved");
    load();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading users…</p>;
  }

  if (!me) {
    return <p className="text-sm text-rose-400">{err || "Unauthorized"}</p>;
  }

  const isSuper = me.role === "super_admin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm text-slate-500">
          Admins manage roles and account status. Only super admins can change or assign super admin.
        </p>
      </div>
      {err && <p className="text-sm text-rose-400">{err}</p>}
      {msg && <p className="text-sm text-teal-300">{msg}</p>}
      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-white/10 bg-slate-900/50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => {
              const self = me?.id === u.id;
              const targetSuper = u.role === "super_admin";
              const canEditRole =
                !self &&
                (isSuper || (!targetSuper && u.role !== "super_admin"));
              const roleChoices = ROLES.filter((r) => {
                if (r === "super_admin" && !isSuper) return false;
                return true;
              });

              return (
                <tr key={u.id} className="bg-slate-950/20">
                  <td className="px-4 py-3 text-slate-200">{u.name}</td>
                  <td className="px-4 py-3 text-slate-400">{u.email}</td>
                  <td className="px-4 py-3">
                    {canEditRole ? (
                      <select
                        key={`${u.id}-role-${u.role}`}
                        defaultValue={u.role}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        onChange={(e) => {
                          const role = e.target.value;
                          if (role !== u.role) patchUser(u.id, { role });
                        }}
                      >
                        {roleChoices.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-slate-400">{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!self ? (
                      <select
                        key={`${u.id}-status-${u.status}`}
                        defaultValue={u.status}
                        className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-slate-200"
                        onChange={(e) => {
                          const status = e.target.value;
                          if (status !== u.status) patchUser(u.id, { status });
                        }}
                      >
                        <option value="active">active</option>
                        <option value="suspended">suspended</option>
                      </select>
                    ) : (
                      <span className="text-slate-400">{u.status}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
