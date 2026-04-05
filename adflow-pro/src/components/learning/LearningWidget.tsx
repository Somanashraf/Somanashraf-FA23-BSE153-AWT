"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

type Q = {
  id: string;
  question: string;
  answer: string;
  topic: string;
  difficulty: string;
};

export function LearningWidget() {
  const [q, setQ] = useState<Q | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await fetch("/api/questions/random");
        const j = await r.json();
        if (!cancelled && j.question) setQ(j.question);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!q) return null;

  return (
    <section className="glass rounded-2xl p-6">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-indigo-500/20 p-2 text-indigo-200">
          <BookOpen className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-300/90">
            Learning checkpoint
          </p>
          <p className="mt-1 text-sm text-slate-200">{q.question}</p>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="mt-3 text-xs font-medium text-teal-300 hover:text-teal-200"
          >
            {open ? "Hide answer" : "Reveal answer"}
          </button>
          {open && (
            <p className="mt-2 rounded-lg bg-slate-900/60 p-3 text-sm leading-relaxed text-slate-300">
              {q.answer}
            </p>
          )}
          <p className="mt-2 text-[11px] text-slate-500">
            Topic: {q.topic} · {q.difficulty}
          </p>
        </div>
      </div>
    </section>
  );
}
