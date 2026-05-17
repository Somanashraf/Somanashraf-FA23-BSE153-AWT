import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { secretCode, candidateId, pollId } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: secretRow, error: secretError } = await supabase
      .from('secret_ids')
      .select('id, is_used, poll_id, registration_id')
      .eq('secret_code', secretCode)
      .eq('poll_id', pollId)
      .single()

    if (secretError || !secretRow) {
      return new Response(JSON.stringify({ error: 'Invalid secret voter ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (secretRow.is_used) {
      return new Response(JSON.stringify({ error: 'This ID has already been used' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: poll } = await supabase
      .from('polls')
      .select('election_id, elections(status, end_date)')
      .eq('id', pollId)
      .single()

    const election = poll?.elections as { status: string; end_date: string } | undefined
    if (!election || election.status !== 'active') {
      return new Response(JSON.stringify({ error: 'Election is not active' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (new Date(election.end_date) < new Date()) {
      return new Response(JSON.stringify({ error: 'Election has ended' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const voteHash = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${pollId}:${candidateId}:${crypto.randomUUID()}`),
    )
    const hashHex = Array.from(new Uint8Array(voteHash))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

    const { error: voteError } = await supabase.from('votes').insert({
      poll_id: pollId,
      candidate_id: candidateId,
      vote_hash: hashHex,
    })

    if (voteError) {
      return new Response(JSON.stringify({ error: voteError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase
      .from('secret_ids')
      .update({ is_used: true })
      .eq('id', secretRow.id)

    await supabase.rpc('increment_vote_count', { election_uuid: poll.election_id }).catch(async () => {
      // Fallback if RPC doesn't exist
      const { data: eData } = await supabase.from('elections').select('vote_count').eq('id', poll.election_id).single()
      if (eData) {
        await supabase
          .from('elections')
          .update({ vote_count: eData.vote_count + 1 })
          .eq('id', poll.election_id)
      }
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
