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
