import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/env";

export function SetupBanner() {
  if (isSupabaseConfigured()) return null;
  return (
    <div className="border-b border-amber-400/30 bg-amber-500/15 px-4 py-2 text-center text-sm text-amber-100">
      Database keys missing or still set to placeholders.{" "}
      <Link href="/setup" className="font-semibold underline decoration-amber-300/80 hover:text-white">
        Open setup guide
      </Link>
    </div>
  );
}
