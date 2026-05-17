export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        Demo deployments should use HTTPS, rotate service keys, and avoid logging raw passwords. JWT cookies
        are HTTP-only in this app; align cookie policies with your campus security checklist.
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        External media URLs are stored as references — ensure your retention and GDPR story covers any
        personal data entered into listing descriptions or payment notes.
      </p>
    </div>
  );
}
