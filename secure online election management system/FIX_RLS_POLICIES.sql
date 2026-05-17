-- Drop the old restrictive RLS policies
DROP POLICY IF EXISTS "Creators can insert elections" ON public.elections;
DROP POLICY IF EXISTS "Creators can update own elections" ON public.elections;
DROP POLICY IF EXISTS "Public can view published elections" ON public.elections;

-- Keep the simpler policies that just check creator_id
-- These should already exist from your previous SQL run

-- SELECT: Allow viewing own elections
CREATE POLICY "election_creator can view own elections"
ON public.elections
FOR SELECT
TO authenticated
USING (auth.uid() = creator_id OR status NOT IN ('draft', 'cancelled'));

-- INSERT: Allow creating elections
CREATE POLICY "election_creator can insert elections"
ON public.elections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = creator_id);

-- UPDATE: Allow updating own elections
CREATE POLICY "election_creator can update own elections"
ON public.elections
FOR UPDATE
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

-- DELETE: Allow deleting own draft elections
CREATE POLICY "election_creator can delete own draft elections"
ON public.elections
FOR DELETE
TO authenticated
USING (auth.uid() = creator_id AND status = 'draft');

-- Verify policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename = 'elections' ORDER BY policyname;
