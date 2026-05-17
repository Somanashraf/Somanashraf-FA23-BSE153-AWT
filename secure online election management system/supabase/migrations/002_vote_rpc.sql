-- Migration to add increment_vote_count RPC and update election_results
CREATE OR REPLACE FUNCTION public.increment_vote_count(election_uuid UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.elections
  SET vote_count = vote_count + 1
  WHERE id = election_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC to get aggregated results for an election
CREATE OR REPLACE FUNCTION public.get_election_results(election_uuid UUID)
RETURNS TABLE (
  poll_id UUID,
  candidate_id UUID,
  vote_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.poll_id, 
    v.candidate_id, 
    COUNT(*) as vote_count
  FROM public.votes v
  JOIN public.polls p ON p.id = v.poll_id
  WHERE p.election_id = election_uuid
  GROUP BY v.poll_id, v.candidate_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
