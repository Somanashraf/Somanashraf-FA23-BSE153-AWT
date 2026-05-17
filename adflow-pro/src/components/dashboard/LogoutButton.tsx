"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:border-rose-400/40 hover:text-rose-200"
    >
      Log out
    </button>
  );
}
