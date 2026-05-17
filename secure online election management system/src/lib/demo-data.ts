import type { Election, PlatformStats } from '@/types/database'

const now = Date.now()
const day = 86400000

export const DEMO_ELECTIONS: Election[] = [
  {
    id: 'demo-1',
    creator_id: 'demo',
    title: 'Student Council 2026',
    description:
      'Annual student body election with secure anonymous voting, live results, and full audit transparency.',
    banner_url:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80',
    category: 'education',
    status: 'active',
    start_date: new Date(now - day).toISOString(),
    end_date: new Date(now + 7 * day).toISOString(),
    registration_deadline: new Date(now + 2 * day).toISOString(),
    max_voters: 500,
    registered_count: 342,
    vote_count: 218,
    is_registration_locked: false,
    published_at: new Date(now - 3 * day).toISOString(),
    created_at: new Date(now - 10 * day).toISOString(),
    updated_at: new Date(now).toISOString(),
  },
  {
    id: 'demo-2',
    creator_id: 'demo',
    title: 'Tech Guild Board Election',
    description:
      'Elect the next board for the university technology guild. One vote per verified member.',
    banner_url:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    category: 'organization',
    status: 'registration_open',
    start_date: new Date(now + 5 * day).toISOString(),
    end_date: new Date(now + 14 * day).toISOString(),
    registration_deadline: new Date(now + 4 * day).toISOString(),
    max_voters: 200,
    registered_count: 89,
    vote_count: 0,
    is_registration_locked: false,
    published_at: new Date(now - day).toISOString(),
    created_at: new Date(now - 5 * day).toISOString(),
    updated_at: new Date(now).toISOString(),
  },
  {
    id: 'demo-3',
    creator_id: 'demo',
    title: 'Community HOA Board Vote',
    description: 'Neighborhood association board selection with encrypted ballots and public audit trail.',
    banner_url: null,
    category: 'community',
    status: 'completed',
    start_date: new Date(now - 30 * day).toISOString(),
    end_date: new Date(now - 7 * day).toISOString(),
    registration_deadline: new Date(now - 14 * day).toISOString(),
    max_voters: 150,
    registered_count: 150,
    vote_count: 142,
    is_registration_locked: true,
    published_at: new Date(now - 35 * day).toISOString(),
    created_at: new Date(now - 40 * day).toISOString(),
    updated_at: new Date(now - 7 * day).toISOString(),
  },
]

export const DEMO_STATS: PlatformStats = {
  total_users: 12480,
  total_elections: 342,
  active_elections: 28,
  total_votes: 89420,
}

export const isDemoMode = () =>
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
