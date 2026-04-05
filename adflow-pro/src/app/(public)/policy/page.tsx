export default function PolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Platform usage policy</h1>
      <ul className="mt-6 list-disc space-y-3 pl-5 text-sm text-slate-400">
        <li>Moderators document decisions; admins own payment verification and publishing.</li>
        <li>Clients may not attempt to bypass workflow states or share fraudulent proofs.</li>
        <li>Automated jobs must be observable — health logs and analytics back operational maturity.</li>
        <li>Reports from the public detail page create traceable records for abuse workflows.</li>
      </ul>
    </div>
  );
}
