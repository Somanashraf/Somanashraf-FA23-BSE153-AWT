import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/env";

export default function SetupHelpPage() {
  const ok = isSupabaseConfigured();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 text-sm leading-relaxed text-slate-300">
      <h1 className="text-3xl font-semibold text-white">Setup help (beginners)</h1>
      <p className="mt-3 text-slate-400">
        Follow these steps in order. You only create a free Supabase account once.
      </p>

      <ol className="mt-10 list-decimal space-y-8 pl-5 marker:text-teal-400">
        <li>
          <strong className="text-white">Install Node.js</strong> (if you do not have it): download the LTS
          version from{" "}
          <a
            href="https://nodejs.org/"
            className="text-teal-300 underline"
            target="_blank"
            rel="noreferrer"
          >
            nodejs.org
          </a>
          , install, restart your computer if the installer asks.
        </li>
        <li>
          <strong className="text-white">Run the Windows setup script</strong> (easiest):
          <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-400">
            <li>
              Open the project folder:{" "}
              <code className="rounded bg-slate-800 px-1.5 py-0.5 text-teal-200">AWT Mid\adflow-pro</code>
            </li>
            <li>
              Right-click <code className="rounded bg-slate-800 px-1.5">setup-windows.ps1</code> →{" "}
              <em>Run with PowerShell</em>. If Windows blocks it, open PowerShell in that folder and run:{" "}
              <code className="block mt-2 rounded bg-slate-900 p-3 text-xs text-teal-200">
                Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force; .\setup-windows.ps1
              </code>
            </li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Create Supabase (free database)</strong>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-400">
            <li>
              Go to{" "}
              <a href="https://supabase.com/" className="text-teal-300 underline" target="_blank" rel="noreferrer">
                supabase.com
              </a>{" "}
              → sign up → <strong>New project</strong> → wait until it finishes creating.
            </li>
            <li>
              In the project: <strong>Project Settings</strong> (gear) → <strong>API</strong>. Copy:
              <ul className="mt-2 list-[circle] space-y-1 pl-5">
                <li>
                  <strong>Project URL</strong> → paste into{" "}
                  <code className="text-teal-200">NEXT_PUBLIC_SUPABASE_URL</code> in{" "}
                  <code className="text-teal-200">.env.local</code>
                </li>
                <li>
                  <strong>service_role</strong> key (secret) → paste into{" "}
                  <code className="text-teal-200">SUPABASE_SERVICE_ROLE_KEY</code>
                </li>
              </ul>
            </li>
            <li>
              Save the file. <strong>Never</strong> share the service_role key or upload it to GitHub.
            </li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Create the database tables</strong>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-slate-400">
            <li>
              Supabase → <strong>SQL Editor</strong> → <strong>New query</strong>.
            </li>
            <li>
              Open the file{" "}
              <code className="rounded bg-slate-800 px-1.5 text-teal-200">supabase\full_setup.sql</code> in
              Notepad or VS Code, copy <strong>everything</strong>, paste into Supabase, click{" "}
              <strong>Run</strong>.
            </li>
            <li>You should see “Success”. Use a <strong>new empty</strong> project; do not run twice on the same DB.</li>
          </ul>
        </li>
        <li>
          <strong className="text-white">Add demo users and sample ads</strong>
          <p className="mt-2 text-slate-400">
            In PowerShell / Terminal, inside the <code className="text-teal-200">adflow-pro</code> folder:
          </p>
          <code className="mt-2 block rounded bg-slate-900 p-3 text-xs text-teal-200">npm run db:seed</code>
        </li>
        <li>
          <strong className="text-white">Start the website</strong>
          <code className="mt-2 block rounded bg-slate-900 p-3 text-xs text-teal-200">npm run dev</code>
          <p className="mt-2">
            Open{" "}
            <a href="http://localhost:3000" className="text-teal-300 underline">
              http://localhost:3000
            </a>
          </p>
        </li>
      </ol>

      <div className="mt-12 glass rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white">Demo logins (after seed)</h2>
        <p className="mt-2 text-slate-400">Password for all: </p>
        <p className="font-mono text-teal-300">Password123!</p>
        <ul className="mt-4 space-y-1 font-mono text-xs text-slate-400">
          <li>client@demo.local</li>
          <li>mod@demo.local</li>
          <li>admin@demo.local</li>
          <li>super@demo.local</li>
        </ul>
        <p className="mt-4">
          <Link href="/login" className="text-teal-300 underline">
            Go to login
          </Link>
        </p>
      </div>

      <p className="mt-10 text-slate-500">
        Status:{" "}
        {ok ? (
          <span className="text-teal-400">Supabase env looks configured on this machine.</span>
        ) : (
          <span className="text-amber-300">Still need real Supabase URL + service_role in .env.local</span>
        )}
      </p>
    </div>
  );
}
