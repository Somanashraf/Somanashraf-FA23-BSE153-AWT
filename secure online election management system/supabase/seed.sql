-- SecureVote Seed Data (run after migration, with test users created via Auth)
-- Replace UUIDs with your test user IDs from Supabase Auth

-- Example: promote first user to super_admin
-- UPDATE public.profiles SET role = 'super_admin' WHERE email = 'admin@securevote.app';

-- Sample elections (requires existing creator profile)
/*
INSERT INTO public.elections (
  creator_id, title, description, category, status,
  start_date, end_date, registration_deadline, max_voters,
  registered_count, vote_count, published_at
) VALUES (
  'YOUR-CREATOR-UUID',
  'Student Council 2026',
  'Annual student body election with secure anonymous voting and full audit transparency.',
  'education',
  'active',
  NOW() - INTERVAL '1 day',
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '2 days',
  500,
  127,
  89,
  NOW()
);
*/
