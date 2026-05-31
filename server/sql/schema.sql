-- ============================================================
-- Plantaech Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  avatar TEXT CHECK (
    avatar IS NULL OR avatar LIKE 'http%' OR avatar LIKE 'supabase-private://%'
  ),
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL CHECK (
    image_url LIKE 'http%' OR image_url LIKE 'supabase-private://%'
  ),
  disease_name TEXT NOT NULL,
  scientific_name TEXT,
  confidence FLOAT NOT NULL,
  severity TEXT CHECK (severity IN ('healthy', 'mild', 'moderate', 'severe')),
  immediate_action TEXT,
  treatment_plan TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Diseases knowledge base (model class → treatment info)
CREATE TABLE IF NOT EXISTS diseases (
  id SERIAL PRIMARY KEY,
  class_key TEXT UNIQUE NOT NULL,
  disease_name TEXT NOT NULL,
  scientific_name TEXT,
  severity TEXT CHECK (severity IS NULL OR severity IN ('healthy', 'mild', 'moderate', 'severe')),
  immediate_action TEXT,
  treatment_plan TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Forum threads
CREATE TABLE IF NOT EXISTS threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT CHECK (
    image_url IS NULL OR image_url LIKE 'http%' OR image_url LIKE 'supabase-private://%'
  ),
  category TEXT CHECK (category IN (
    'penyakit_tanaman', 'tips_pertanian', 'tanya_jawab',
    'pupuk_nutrisi', 'hama_pengendalian', 'umum'
  )),
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES users(id),   -- NULL = self-deleted, set = admin removed
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
-- If the threads table already exists, run this in Supabase SQL editor:
-- ALTER TABLE threads ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID REFERENCES users(id),   -- NULL = self-deleted, set = admin removed
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Reports
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason TEXT NOT NULL CHECK (reason IN (
    'spam', 'harassment', 'inappropriate', 'misinformation', 'other'
  )),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_diagnoses_user_id ON diagnoses(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_user_id ON threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_category ON threads(category);
CREATE INDEX IF NOT EXISTS idx_threads_is_deleted ON threads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_comments_thread_id ON comments(thread_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_diseases_class_key ON diseases(class_key);

-- ============================================================
-- Updated_at trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_threads_updated_at BEFORE UPDATE ON threads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diseases_updated_at BEFORE UPDATE ON diseases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Password Reset OTPs (auto-cleaned: rows deleted after use)
-- ============================================================
CREATE TABLE IF NOT EXISTS password_resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);

-- ============================================================
-- Email Verification OTPs (registration, auto-cleaned after use)
-- ============================================================
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  registration_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
