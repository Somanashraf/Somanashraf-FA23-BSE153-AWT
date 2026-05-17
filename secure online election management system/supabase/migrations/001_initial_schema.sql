-- SecureVote Database Schema
-- Run in Supabase SQL Editor or via CLI

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('super_admin', 'election_creator', 'voter');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'election_status') THEN
    CREATE TYPE election_status AS ENUM (
      'draft', 'published', 'registration_open', 'registration_closed',
      'active', 'completed', 'cancelled'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'request_status') THEN
    CREATE TYPE request_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'registration_status') THEN
    CREATE TYPE registration_status AS ENUM ('registered', 'waitlisted', 'finalized');
  END IF;
END$$;

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'voter',
  phone TEXT,
  organization TEXT,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Election creator approval requests
CREATE TABLE public.election_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  organization TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT NOT NULL,
  identity_details TEXT NOT NULL,
  status request_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_election_requests_status ON public.election_requests(status);
CREATE INDEX idx_election_requests_user ON public.election_requests(user_id);

-- Elections
CREATE TABLE public.elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  banner_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  status election_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ NOT NULL,
  max_voters INTEGER NOT NULL CHECK (max_voters > 0),
  registered_count INTEGER NOT NULL DEFAULT 0,
  vote_count INTEGER NOT NULL DEFAULT 0,
  is_registration_locked BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_elections_status ON public.elections(status);
CREATE INDEX idx_elections_creator ON public.elections(creator_id);
CREATE INDEX idx_elections_dates ON public.elections(start_date, end_date);

-- Polls within elections
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_polls_election ON public.polls(election_id);

-- Candidates
CREATE TABLE public.candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  designation TEXT,
  manifesto TEXT,
  photo_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_candidates_poll ON public.candidates(poll_id);

-- Voter registrations
CREATE TABLE public.voter_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status registration_status NOT NULL DEFAULT 'registered',
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, user_id)
);

CREATE INDEX idx_voter_reg_election ON public.voter_registrations(election_id);
CREATE INDEX idx_voter_reg_user ON public.voter_registrations(user_id);

-- Waitlist
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(election_id, user_id)
);

-- Secret voter IDs (one per poll per registration)
CREATE TABLE public.secret_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID NOT NULL REFERENCES public.voter_registrations(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  secret_code TEXT NOT NULL UNIQUE,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  emailed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(registration_id, poll_id)
);

CREATE INDEX idx_secret_ids_code ON public.secret_ids(secret_code);
CREATE INDEX idx_secret_ids_poll ON public.secret_ids(poll_id);

-- Anonymous votes (NO user_id - preserves anonymity)
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  vote_hash TEXT NOT NULL UNIQUE,
  cast_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(poll_id, vote_hash)
);

CREATE INDEX idx_votes_poll ON public.votes(poll_id);
CREATE INDEX idx_votes_candidate ON public.votes(candidate_id);

-- Cached election results
CREATE TABLE public.election_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES public.elections(id) ON DELETE CASCADE,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  vote_count INTEGER NOT NULL DEFAULT 0,
  percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  is_winner BOOLEAN NOT NULL DEFAULT FALSE,
  finalized_at TIMESTAMPTZ,
  UNIQUE(poll_id, candidate_id)
);

-- Audit logs
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- Notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'voter'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER elections_updated_at
  BEFORE UPDATE ON public.elections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Registration count increment
CREATE OR REPLACE FUNCTION public.increment_registration_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.elections
  SET registered_count = registered_count + 1,
      is_registration_locked = (registered_count + 1 >= max_voters)
  WHERE id = NEW.election_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_voter_registered
  AFTER INSERT ON public.voter_registrations
  FOR EACH ROW
  WHEN (NEW.status = 'registered')
  EXECUTE FUNCTION public.increment_registration_count();

-- Helper: check role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_election_creator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('election_creator', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.owns_election(election_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.elections
    WHERE id = election_uuid AND creator_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secret_ids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile role"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Election requests
CREATE POLICY "Users can view own requests"
  ON public.election_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Users can create requests"
  ON public.election_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update requests"
  ON public.election_requests FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- Elections
CREATE POLICY "Public can view published elections"
  ON public.elections FOR SELECT
  USING (
    status NOT IN ('draft', 'cancelled')
    OR creator_id = auth.uid()
    OR public.is_super_admin()
  );

CREATE POLICY "Creators can insert elections"
  ON public.elections FOR INSERT TO authenticated
  WITH CHECK (
    creator_id = auth.uid() AND public.is_election_creator()
  );

CREATE POLICY "Creators can update own elections"
  ON public.elections FOR UPDATE TO authenticated
  USING (creator_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Creators can delete draft elections"
  ON public.elections FOR DELETE TO authenticated
  USING (creator_id = auth.uid() AND status = 'draft');

-- Polls & candidates (follow election visibility)
CREATE POLICY "View polls for visible elections"
  ON public.polls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id
      AND (e.status NOT IN ('draft', 'cancelled') OR e.creator_id = auth.uid() OR public.is_super_admin())
    )
  );

CREATE POLICY "Creators manage polls"
  ON public.polls FOR ALL TO authenticated
  USING (public.owns_election(election_id) OR public.is_super_admin())
  WITH CHECK (public.owns_election(election_id) OR public.is_super_admin());

CREATE POLICY "View candidates"
  ON public.candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      JOIN public.elections e ON e.id = p.election_id
      WHERE p.id = poll_id
      AND (e.status NOT IN ('draft', 'cancelled') OR e.creator_id = auth.uid() OR public.is_super_admin())
    )
  );

CREATE POLICY "Creators manage candidates"
  ON public.candidates FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_id AND (public.owns_election(p.election_id) OR public.is_super_admin())
    )
  );

-- Voter registrations
CREATE POLICY "Users view own registrations"
  ON public.voter_registrations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.elections e WHERE e.id = election_id AND e.creator_id = auth.uid()
  ));

CREATE POLICY "Users can register"
  ON public.voter_registrations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND terms_accepted = true);

-- Waitlist
CREATE POLICY "Users view own waitlist"
  ON public.waitlist FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Users join waitlist"
  ON public.waitlist FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Secret IDs - voters see only their own (masked via view)
CREATE POLICY "Voters see own secret ids"
  ON public.secret_ids FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.voter_registrations vr
      WHERE vr.id = registration_id AND vr.user_id = auth.uid()
    )
    OR public.is_super_admin()
  );

-- Votes: insert via service role only (edge function); select aggregated
CREATE POLICY "Anyone can view vote aggregates via results table"
  ON public.votes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      JOIN public.elections e ON e.id = p.election_id
      WHERE p.id = poll_id AND e.status IN ('active', 'completed')
    )
  );

CREATE POLICY "Service role inserts votes"
  ON public.votes FOR INSERT TO authenticated
  WITH CHECK (false);

-- Results
CREATE POLICY "View results for active/completed elections"
  ON public.election_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id AND e.status IN ('active', 'completed', 'published')
    )
  );

-- Audit logs
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Authenticated users insert audit logs"
  ON public.audit_logs FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- Notifications
CREATE POLICY "Users view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.elections;
ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.election_results;

-- Storage buckets (run in dashboard or):
-- INSERT INTO storage.buckets (id, name, public) VALUES ('election-banners', 'election-banners', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-photos', 'candidate-photos', true);
