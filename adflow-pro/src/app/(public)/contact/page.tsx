export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold">Contact</h1>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        This demo ships without a third-party mail provider. For coursework, describe how you would wire
        Resend, SendGrid, or SMTP with Supabase edge functions to deliver contact form mail and payment
        receipts.
      </p>
      <div className="mt-8 glass rounded-2xl p-6 text-sm text-slate-300">
        <p>Platform operations (demo): ops@adflow.local</p>
        <p className="mt-2 text-slate-500">Replace with your team inbox in production.</p>
      </div>
    </div>
  );
}
