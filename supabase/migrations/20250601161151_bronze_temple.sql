/*
  # Create Initial Schema

  1. Tables Created
    - profiles: User profile information
    - consent_logs: GDPR compliance logs
    - projects: Collaboration projects
    - applications: Project applications
    - mentorships: Mentorship programs
    - matches: Mentorship matches
    - badges: Achievement badges
    - user_badges: User badge assignments
    - verifications: Badge verifications
    - achievements: User achievements

  2. Schema Details
    - All tables use UUID primary keys
    - Timestamps for creation/updates
    - Foreign key constraints with CASCADE delete
    - JSONB for flexible metadata storage
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  em text,
  fn text,
  ln text,
  bio text,
  img text,
  ph text,
  loc text,
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now(),
  set jsonb,
  gdp boolean NOT NULL DEFAULT false,
  gdl timestamptz,
  UNIQUE(uid)
);

-- Create consent_logs table
CREATE TABLE IF NOT EXISTS consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typ text NOT NULL,
  dat jsonb NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  ip text
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org text NOT NULL,
  ttl text NOT NULL,
  dsc text,
  img text,
  skl jsonb,
  bgt jsonb,
  sts text NOT NULL DEFAULT 'draft',
  str timestamptz NOT NULL,
  edt timestamptz,
  loc text,
  typ text NOT NULL,
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now(),
  met jsonb
);

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pid uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  msg text,
  exp jsonb,
  sts text NOT NULL DEFAULT 'pending',
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now()
);

-- Create mentorships table
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skl text[] NOT NULL,
  exp integer NOT NULL,
  cap integer NOT NULL,
  cur integer NOT NULL DEFAULT 0,
  bio text,
  rte jsonb,
  avl jsonb,
  sts text NOT NULL DEFAULT 'active',
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now()
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mid uuid NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gls text[] NOT NULL,
  dur integer NOT NULL,
  sts text NOT NULL DEFAULT 'pending',
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nam text NOT NULL,
  dsc text,
  img text,
  typ text NOT NULL,
  lvl integer NOT NULL DEFAULT 1,
  exp timestamptz,
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now(),
  met jsonb
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bid uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  iss uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sta text NOT NULL DEFAULT 'pending',
  prf jsonb,
  cdt timestamptz NOT NULL DEFAULT now(),
  udt timestamptz NOT NULL DEFAULT now(),
  vrf timestamptz,
  exp timestamptz,
  hsh text,
  pub boolean NOT NULL DEFAULT false
);

-- Create verifications table
CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ubg uuid NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
  vby uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  typ text NOT NULL,
  sta text NOT NULL,
  prf jsonb,
  cdt timestamptz NOT NULL DEFAULT now(),
  met jsonb
);

-- Create achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hsh text NOT NULL,
  typ text NOT NULL,
  lvl integer NOT NULL DEFAULT 1,
  dat jsonb NOT NULL,
  cdt timestamptz NOT NULL DEFAULT now(),
  exp timestamptz
);