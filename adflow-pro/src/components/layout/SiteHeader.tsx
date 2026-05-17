import Link from "next/link";
import { Sparkles } from "lucide-react";

const nav = [
  { href: "/setup", label: "Setup help" },
  { href: "/explore", label: "Explore" },
  { href: "/packages", label: "Packages" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-400/15 text-teal-300">
            <Sparkles className="h-5 w-5" aria-hidden />
          </span>
          <span>
            AdFlow <span className="text-teal-300">Pro</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="transition hover:text-white"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm text-slate-300 transition hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-teal-400/90 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-teal-500/20 transition hover:bg-teal-300"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
