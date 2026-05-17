-- Fix: Set creator@test.com role to election_creator
UPDATE public.profiles 
SET role = 'election_creator' 
WHERE email = 'creator@test.com';

-- Verify it worked
SELECT id, email, role FROM public.profiles WHERE email = 'creator@test.com';
