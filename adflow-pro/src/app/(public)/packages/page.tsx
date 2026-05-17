import Link from "next/link";
import { getHomePackages } from "@/server/homeQueries";

export default async function PackagesPage() {
  let packages: Awaited<ReturnType<typeof getHomePackages>> = [];
  try {
    packages = await getHomePackages();
  } catch {
    /* missing env */
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Listing packages</h1>
      <p className="mt-3 max-w-2xl text-slate-400">
        Packages drive duration, ranking weight, and homepage visibility. Clients choose a
        package after moderation clears content for payment.
      </p>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {packages.map((p) => (
          <div
            key={p.id}
            className="glass flex flex-col rounded-2xl border border-teal-400/10 p-8"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-teal-300">
              {p.name}
            </p>
            <p className="mt-4 text-4xl font-semibold text-white">
              ${(p.price_cents / 100).toFixed(0)}
            </p>
            <p className="mt-2 text-sm text-slate-500">per listing cycle</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-slate-300">
              <li>• {p.duration_days} days on-air before expiry automation</li>
              <li>• Ranking weight {p.weight}× in public sort</li>
              <li>
                •{" "}
                {p.homepage_visibility
                  ? "Eligible for homepage spotlight + featured tier hooks"
                  : "Category-first placement; upgrade for homepage"}
              </li>
              <li>• {p.is_featured_tier ? "Featured tier defaults for badges" : "Standard visibility"}</li>
            </ul>
            <Link
              href="/register"
              className="mt-8 inline-flex justify-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-400/20"
            >
              Start as client
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
