import { supabase } from '@/lib/supabase'
import { logAudit } from '@/lib/audit'

interface VoterWithProfile {
  id: string
  user_id: string
  profiles: {
    email: string
    full_name: string | null
  }
}

interface ElectionData {
  id: string
  max_voters: number
  registered_count: number
  title?: string
}

/**
 * Promote voters from waitlist to registered status if seats are available
 */
export async function promoteFromWaitlist(electionId: string) {
  try {
    // Get election details
    const { data: election } = await supabase
      .from('elections')
      .select('id, max_voters, registered_count, title')
      .eq('id', electionId)
      .single()

    if (!election) return

    const seatsAvailable = election.max_voters - election.registered_count
    if (seatsAvailable <= 0) return

    // Get waitlisted voters ordered by registration time
    const { data: waitlisted } = await supabase
      .from('voter_registrations')
      .select('id, user_id, profiles(email, full_name)')
      .eq('election_id', electionId)
      .eq('status', 'waitlisted')
      .order('created_at', { ascending: true })
      .limit(seatsAvailable)

    if (!waitlisted || waitlisted.length === 0) return

    // Promote each waitlisted voter to registered
    for (const voter of waitlisted as unknown as VoterWithProfile[]) {
      await supabase
        .from('voter_registrations')
        .update({ status: 'registered' })
        .eq('id', voter.id)

      // Send notification
      await supabase.from('notifications').insert({
        user_id: voter.user_id,
        title: 'You were promoted from waitlist!',
        message: `Great news! A spot has opened up for you in this election. You can now register your vote.`,
        type: 'promotion',
        link: `/elections/${electionId}`,
      })

      // Send email
      await supabase.functions.invoke('send-email', {
        body: {
          to: voter.profiles.email,
          type: 'promotion',
          subject: 'You Have Been Promoted from Waitlist!',
          data: {
            name: voter.profiles.full_name ?? 'Voter',
            election: (election as ElectionData).title ?? 'Election',
            link: `${window.location.origin}/elections/${electionId}`,
          },
        },
      }).catch(err => console.error('Email send error:', err))

      await logAudit('waitlist_promotion', 'voter_registrations', voter.id, {
        election_id: electionId,
      })
    }

    return waitlisted.length
  } catch (error) {
    console.error('Waitlist promotion error:', error)
  }
}

/**
 * Add voter to waitlist table
 */
export async function addToWaitlist(electionId: string, userId: string) {
  try {
    // Get current waitlist position
    const { data: waitlistCount } = await supabase
      .from('voter_registrations')
      .select('id', { count: 'exact' })
      .eq('election_id', electionId)
      .eq('status', 'waitlisted')

    const position = (waitlistCount?.length ?? 0) + 1

    await supabase.from('waitlist').insert({
      election_id: electionId,
      user_id: userId,
      position: position,
    })

    // Send notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (profile) {
      const { data: election } = await supabase
        .from('elections')
        .select('title')
        .eq('id', electionId)
        .single()

      await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Added to waitlist',
        message: `You have been added to the waitlist at position ${position}. You will be notified if a spot opens up.`,
        type: 'waitlist',
        link: `/elections/${electionId}`,
      })

      // Send email
      await supabase.functions.invoke('send-email', {
        body: {
          to: profile.email,
          type: 'waitlist',
          subject: `Waitlist Confirmation - ${election?.title}`,
          data: {
            name: profile.full_name ?? 'Voter',
            election: election?.title ?? 'Election',
            position: String(position),
            link: `${window.location.origin}/elections/${electionId}`,
          },
        },
      }).catch(err => console.error('Email send error:', err))
    }
  } catch (error) {
    console.error('Add to waitlist error:', error)
  }
}
