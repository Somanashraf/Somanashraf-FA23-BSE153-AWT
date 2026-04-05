-- ONE-TIME: paste this entire file in Supabase SQL Editor on a NEW project (empty DB).

-- AdFlow Pro — Supabase Postgres schema
-- Run in Supabase SQL Editor (or psql) before first deploy.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TEXT + CHECK constraints for simpler JS/PostgREST compatibility

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'moderator', 'admin', 'super_admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seller_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  city TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  duration_days INT NOT NULL CHECK (duration_days > 0),
  weight INT NOT NULL DEFAULT 1,
  homepage_visibility BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured_tier BOOLEAN NOT NULL DEFAULT FALSE,
  price_cents INT NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id),
  category_id UUID REFERENCES categories(id),
  city_id UUID REFERENCES cities(id),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft','submitted','under_review','payment_pending','payment_submitted',
    'payment_verified','scheduled','published','expired','archived','rejected'
  )),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  admin_boost INT NOT NULL DEFAULT 0,
  publish_at TIMESTAMPTZ,
  expire_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,
  rank_refresh_at TIMESTAMPTZ,
  moderator_note TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'unknown' CHECK (source_type IN ('image_url','youtube','github_raw','cdn','unknown')),
  original_url TEXT NOT NULL,
  thumbnail_url TEXT,
  validation_status TEXT NOT NULL DEFAULT 'warning' CHECK (validation_status IN ('ok','warning','invalid')),
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  method TEXT NOT NULL,
  transaction_ref TEXT,
  sender_name TEXT,
  screenshot_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX payments_transaction_ref_unique
  ON payments (transaction_ref)
  WHERE transaction_ref IS NOT NULL AND transaction_ref <> '';

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ad_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE learning_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE system_health_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL,
  response_ms INT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL,
  detail TEXT
);

CREATE TABLE ad_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID NOT NULL REFERENCES ads(id) ON DELETE CASCADE,
  reporter_email TEXT,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_hash ON password_reset_tokens(token_hash);

CREATE TABLE analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload JSONB NOT NULL
);

CREATE INDEX idx_analytics_snapshots_captured ON analytics_snapshots(captured_at DESC);

CREATE INDEX idx_ads_user ON ads(user_id);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_category ON ads(category_id);
CREATE INDEX idx_ads_city ON ads(city_id);
CREATE INDEX idx_ads_publish ON ads(publish_at, expire_at);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- Rank helper: freshness decay over 14 days (used in app layer; index supports sort)
CREATE INDEX idx_ads_published_list ON ads(status, expire_at) WHERE status = 'published';


-- --- SEED DATA ---

-- Static taxonomy & demo content (run after schema.sql)
-- Users & ads: run `npm run db:seed` for bcrypt-backed accounts and listings.

INSERT INTO packages (name, slug, duration_days, weight, homepage_visibility, is_featured_tier, price_cents, description) VALUES
  ('Basic', 'basic', 7, 1, FALSE, FALSE, 1999, '7-day listing, standard placement.'),
  ('Standard', 'standard', 15, 2, FALSE, FALSE, 4999, '15 days, category priority, manual refresh.'),
  ('Premium', 'premium', 30, 3, TRUE, TRUE, 9999, '30 days, homepage visibility, featured weight, auto refresh every 3 days.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (name, slug) VALUES
  ('Electronics', 'electronics'),
  ('Vehicles', 'vehicles'),
  ('Real Estate', 'real-estate'),
  ('Services', 'services'),
  ('Jobs', 'jobs'),
  ('Fashion', 'fashion'),
  ('Home & Garden', 'home-garden'),
  ('Sports', 'sports')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO cities (name, slug) VALUES
  ('Karachi', 'karachi'),
  ('Lahore', 'lahore'),
  ('Islamabad', 'islamabad'),
  ('Rawalpindi', 'rawalpindi'),
  ('Faisalabad', 'faisalabad')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO learning_questions (question, answer, topic, difficulty) VALUES
  ('What does RBAC stand for?', 'Role-Based Access Control — permissions tied to roles.', 'Security', 'easy'),
  ('Why use workflow states for ads instead of a single approved flag?', 'It encodes business stages (review, payment, schedule) and prevents invalid skips.', 'Architecture', 'medium'),
  ('How should external media URLs be handled?', 'Normalize, validate domains/protocols, derive thumbnails (e.g. YouTube), and degrade to placeholders.', 'Media', 'medium');
