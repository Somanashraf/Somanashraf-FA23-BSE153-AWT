import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#050814]/90 py-12 text-sm text-slate-400">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-semibold text-slate-200">AdFlow Pro</p>
          <p className="mt-2 max-w-md leading-relaxed">
            Sponsored listing marketplace with moderation, payments, scheduling, and
            analytics — built for advanced web technologies coursework.
          </p>
        </div>
        <div>
          <p className="font-medium text-slate-200">Platform</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/terms" className="hover:text-teal-300">
                Terms
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-teal-300">
                Privacy
              </Link>
            </li>
            <li>
              <Link href="/policy" className="hover:text-teal-300">
                Usage policy
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium text-slate-200">Workflow</p>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href="/dashboard/client" className="hover:text-teal-300">
                Client hub
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-teal-300">
                Staff login
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-6xl px-4 text-xs text-slate-500">
        © {new Date().getFullYear()} AdFlow Pro — demo project. External media URLs only.
      </p>
    </footer>
  );
}
