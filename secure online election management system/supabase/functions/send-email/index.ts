const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type EmailType =
  | 'verification'
  | 'approval'
  | 'rejection'
  | 'secret_id'
  | 'election_start'
  | 'election_end'
  | 'winner'
  | 'promotion'
  | 'waitlist'

const templates: Record<EmailType, (data: Record<string, string>) => string> = {
  verification: (d) => baseTemplate('Verify your email', `Hi ${d.name}, confirm your SecureVote account.`, d.link),
  approval: (d) =>
    baseTemplate(
      'Creator request approved',
      `Congratulations ${d.name}! You can now create elections on SecureVote.`,
      d.link,
    ),
  rejection: (d) =>
    baseTemplate(
      'Creator request update',
      `Hi ${d.name}, your request was not approved. Reason: ${d.reason}`,
      d.link,
    ),
  secret_id: (d) =>
    baseTemplate(
      'Your Secret Voter ID',
      `Your ID for ${d.election}: <strong>${d.secretId}</strong>. Keep it private. Do not share.`,
      d.link,
    ),
  election_start: (d) =>
    baseTemplate('Voting is open', `${d.election} has started. Cast your vote now.`, d.link),
  election_end: (d) =>
    baseTemplate('Election closed', `${d.election} has ended. View results on SecureVote.`, d.link),
  winner: (d) =>
    baseTemplate('Results announced', `Winners for ${d.election} are now available.`, d.link),
  promotion: (d) =>
    baseTemplate(
      'Promoted from waitlist',
      `Great news ${d.name}! A seat has opened up in ${d.election}. You are now registered to vote.`,
      d.link,
    ),
  waitlist: (d) =>
    baseTemplate(
      'Waitlist confirmation',
      `Hi ${d.name}, you have been added to the waitlist for ${d.election} at position ${d.position}. You will be notified if a spot opens up.`,
      d.link,
    ),
}

function baseTemplate(title: string, body: string, ctaLink: string) {
  return `<!DOCTYPE html><html><body style="font-family:Inter,sans-serif;background:#0f0f14;color:#fff;padding:40px">
  <table width="100%" cellpadding="0"><tr><td align="center">
  <div style="max-width:560px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:40px;border:1px solid rgba(255,255,255,0.1)">
  <h1 style="margin:0 0 8px;font-size:24px;background:linear-gradient(90deg,#6366f1,#a855f7);-webkit-background-clip:text;-webkit-text-fill-color:transparent">${title}</h1>
  <p style="color:#94a3b8;line-height:1.6">${body}</p>
  <a href="${ctaLink}" style="display:inline-block;margin-top:24px;padding:12px 24px;background:linear-gradient(90deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;border-radius:10px;font-weight:600">Open SecureVote</a>
  </div></td></tr></table></body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 })
  }

  const { to, type, data, subject } = await req.json()
  const html = templates[type as EmailType](data)

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'SecureVote <noreply@securevote.app>',
      to: [to],
      subject: subject ?? `SecureVote — ${type}`,
      html,
    }),
  })

  const result = await res.json()
  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
