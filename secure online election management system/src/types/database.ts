export type UserRole = 'super_admin' | 'election_creator' | 'voter'

export type ElectionStatus =
  | 'draft'
  | 'published'
  | 'registration_open'
  | 'registration_closed'
  | 'active'
  | 'completed'
  | 'cancelled'

export type RequestStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  phone: string | null
  organization: string | null
  two_factor_enabled: boolean
  created_at: string
  updated_at: string
}

export interface ElectionRequest {
  id: string
  user_id: string
  purpose: string
  organization: string
  contact_email: string
  phone: string
  identity_details: string
  status: RequestStatus
  rejection_reason: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Election {
  id: string
  creator_id: string
  title: string
  description: string
  banner_url: string | null
  category: string
  status: ElectionStatus
  start_date: string
  end_date: string
  registration_deadline: string
  max_voters: number
  registered_count: number
  vote_count: number
  is_registration_locked: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Poll {
  id: string
  election_id: string
  title: string
  description: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Candidate {
  id: string
  poll_id: string
  name: string
  designation: string | null
  manifesto: string | null
  photo_url: string | null
  order_index: number
  created_at: string
}

export interface VoterRegistration {
  id: string
  election_id: string
  user_id: string
  status: 'registered' | 'waitlisted' | 'finalized'
  terms_accepted: boolean
  created_at: string
}

export interface SecretId {
  id: string
  registration_id: string
  poll_id: string
  secret_code: string
  is_used: boolean
  emailed_at: string | null
  created_at: string
}

export interface Vote {
  id: string
  poll_id: string
  candidate_id: string
  vote_hash: string
  cast_at: string
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface ElectionResult {
  id: string
  election_id: string
  poll_id: string
  candidate_id: string
  vote_count: number
  percentage: number
  is_winner: boolean
  finalized_at: string | null
}

export interface PlatformStats {
  total_users: number
  total_elections: number
  active_elections: number
  total_votes: number
}
