import Link from "next/link";
import { ArrowRight, ShieldCheck, Timer, Workflow } from "lucide-react";
import { LearningWidget } from "@/components/learning/LearningWidget";
import { AdCard, type AdCardData } from "@/components/ads/AdCard";
import { getFeaturedAndRecent, getHomePackages } from "@/server/homeQueries";

export default async function HomePage() {
  let packages: Awaited<ReturnType<typeof getHomePackages>> = [];
  let featured: AdCardData[] = [];
  let recent: AdCardData[] = [];
  try {
    packages = await getHomePackages();
    const h = await getFeaturedAndRecent();
    featured = h.featured as AdCardData[];
    recent = h.recent as AdCardData[];
  } catch {
    /* env / DB not configured — still render shell */
  }

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-4 py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-medium text-teal-300/90">
            Instructor-ready workflow marketplace
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Sponsored listings with{" "}
            <span className="text-gradient">moderation &amp; packages</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
            Clients submit paid ads, moderators review content, admins verify payments,
            and only approved listings go live with package-based ranking and expiry.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 rounded-full bg-teal-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-teal-500/25 transition hover:bg-teal-300"
            >
              Explore live ads
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/packages"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-teal-400/40 hover:text-white"
            >
              View packages
            </Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { icon: Workflow, t: "Stage-based workflow", d: "Draft → review → payment → publish." },
              { icon: ShieldCheck, t: "RBAC dashboards", d: "Client, moderator, admin, super admin." },
              { icon: Timer, t: "Cron automation", d: "Schedule, expiry, reminders, DB heartbeat." },
            ].map((x) => (
              <div key={x.t} className="glass rounded-xl p-4">
                <x.icon className="h-5 w-5 text-teal-300" aria-hidden />
                <p className="mt-2 text-sm font-semibold text-slate-100">{x.t}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
        <LearningWidget />
      </section>

      <section className="flex flex-wrap items-center justify-center gap-6 rounded-2xl border border-white/10 bg-slate-900/30 px-6 py-5 text-center text-xs text-slate-400">
        <span className="font-medium text-slate-300">Workflow-audited releases</span>
        <span>Supabase Postgres</span>
        <span>JWT + HTTP-only cookies</span>
        <span>Zod-validated APIs</span>
        <span>Scheduled automation</span>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Featured spotlight</h2>
            <p className="mt-1 text-sm text-slate-500">
              Boosted placements from premium packages and admin featuring.
            </p>
          </div>
          <Link href="/explore" className="text-sm text-teal-300 hover:text-teal-200">
            Browse all
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.length ? (
            featured.map((ad) => <AdCard key={ad.id} ad={ad} />)
          ) : (
            <p className="text-sm text-slate-500">
              Connect Supabase and run the SQL seed to see featured listings here.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Packages</h2>
        <p className="mt-1 text-sm text-slate-500">
          Duration, visibility weight, and homepage rules — engine-driven ranking.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {packages.map((p) => (
            <div key={p.id} className="glass flex flex-col rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-300/90">
                {p.slug}
              </p>
              <h3 className="mt-2 text-xl font-semibold">{p.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                {p.description}
              </p>
              <ul className="mt-4 space-y-1 text-xs text-slate-500">
                <li>{p.duration_days} days on-air</li>
                <li>Weight factor: {p.weight}×</li>
                <li>{p.homepage_visibility ? "Homepage eligible" : "Category placement"}</li>
              </ul>
              <p className="mt-4 text-lg font-semibold text-white">
                ${(p.price_cents / 100).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold">Recently published</h2>
          <Link href="/explore?sort=newest" className="text-sm text-teal-300 hover:text-teal-200">
            Newest first
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recent.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </section>
    </div>
  );
}
