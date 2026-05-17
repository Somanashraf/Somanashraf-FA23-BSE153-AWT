const items = [
  {
    q: "Why are only some ads visible publicly?",
    a: "AdFlow Pro uses a workflow: drafts and pipeline stages stay private until an admin publishes the listing after payment verification.",
  },
  {
    q: "Why external URLs for media instead of uploads?",
    a: "The coursework brief targets scalable references — URLs are normalized (including YouTube thumbnails) and validated before display.",
  },
  {
    q: "How does ranking work?",
    a: "A composite score blends package weight, featured flag, optional admin boost, and a freshness window so premium and new listings surface fairly.",
  },
  {
    q: "What do cron jobs do?",
    a: "Scheduled publishing, automatic expiry, expiring-soon notifications, and database heartbeat logging keep the marketplace healthy.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">FAQ</h1>
      <p className="mt-2 text-sm text-slate-500">High-signal answers for demos and vivas.</p>
      <dl className="mt-10 space-y-8">
        {items.map((x) => (
          <div key={x.q}>
            <dt className="font-medium text-teal-200">{x.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-400">{x.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
