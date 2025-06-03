/*
  # Initial Database Setup

  1. Tables
    - Core user tables (profiles, skills)
    - Content tables (blog_posts, career_postings)
    - Project collaboration tables (projects, applications)
    - Mentorship tables (mentorships, matches)
    - Achievement system (badges, user_badges, verifications, achievements)
    - Consent tracking (consent_logs)
    - Auth events tracking (auth_events)

  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Set up audit logging

  3. Indexes and Constraints
    - Primary and foreign keys
    - Unique constraints
    - Check constraints for data validation
*/

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  em text,
  fn text,
  ln text,
  bio text,
  img text,
  ph text,
  loc text,
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now(),
  set jsonb,
  gdp boolean DEFAULT false,
  gdl timestamptz,
  UNIQUE(uid)
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  tags text[],
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS career_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  requirements text[] NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  department text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb
);

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  org text NOT NULL,
  ttl text NOT NULL,
  dsc text,
  img text,
  skl jsonb,
  bgt jsonb,
  sts text DEFAULT 'draft',
  str timestamptz NOT NULL,
  edt timestamptz,
  loc text,
  typ text NOT NULL,
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now(),
  met jsonb
);

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pid uuid REFERENCES projects(id) ON DELETE CASCADE,
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  msg text,
  exp jsonb,
  sts text DEFAULT 'pending',
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  skl text[] NOT NULL,
  exp integer NOT NULL,
  cap integer NOT NULL,
  cur integer DEFAULT 0,
  bio text,
  rte jsonb,
  avl jsonb,
  sts text DEFAULT 'active',
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mid uuid REFERENCES mentorships(id) ON DELETE CASCADE,
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  gls text[] NOT NULL,
  dur integer NOT NULL,
  sts text DEFAULT 'pending',
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nam text NOT NULL,
  dsc text,
  img text,
  typ text NOT NULL,
  lvl integer DEFAULT 1,
  exp timestamptz,
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now(),
  met jsonb
);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  bid uuid REFERENCES badges(id) ON DELETE CASCADE,
  iss uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sta text DEFAULT 'pending',
  prf jsonb,
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now(),
  vrf timestamptz,
  exp timestamptz,
  hsh text,
  pub boolean DEFAULT false
);

CREATE TABLE IF NOT EXISTS verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ubg uuid REFERENCES user_badges(id) ON DELETE CASCADE,
  vby uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  typ text NOT NULL,
  sta text NOT NULL,
  prf jsonb,
  cdt timestamptz DEFAULT now(),
  met jsonb
);

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hsh text NOT NULL,
  typ text NOT NULL,
  lvl integer DEFAULT 1,
  dat jsonb NOT NULL,
  cdt timestamptz DEFAULT now(),
  exp timestamptz
);

CREATE TABLE IF NOT EXISTS consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id),
  typ text NOT NULL,
  dat jsonb NOT NULL,
  ts timestamptz DEFAULT now(),
  ip text
);

CREATE TABLE IF NOT EXISTS auth_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name text NOT NULL,
  proficiency_level integer DEFAULT 1,
  years_experience integer DEFAULT 0,
  category text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(uid, skill_name)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Enable read access for all users" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = uid);

CREATE POLICY "Anyone can view published posts" ON blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can manage own posts" ON blog_posts FOR ALL USING (author_id = auth.uid());

CREATE POLICY "Anyone can view open positions" ON career_postings FOR SELECT USING (status = 'open');
CREATE POLICY "Admins can manage career postings" ON career_postings FOR ALL USING (EXISTS (SELECT 1 FROM auth.users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Users can manage own projects" ON projects FOR ALL USING (uid = auth.uid());
CREATE POLICY "Users can view active projects" ON projects FOR SELECT USING (sts = 'active');

CREATE POLICY "Users can manage own applications" ON applications FOR ALL USING (uid = auth.uid());
CREATE POLICY "Project owners can view applications" ON applications FOR SELECT USING (EXISTS (SELECT 1 FROM projects WHERE projects.id = pid AND projects.uid = auth.uid()));

CREATE POLICY "Users can manage own mentorships" ON mentorships FOR ALL USING (uid = auth.uid());
CREATE POLICY "Users can view active mentorships" ON mentorships FOR SELECT USING (sts = 'active');

CREATE POLICY "Users can manage own matches" ON matches FOR ALL USING (uid = auth.uid());
CREATE POLICY "Mentors can view matches" ON matches FOR SELECT USING (EXISTS (SELECT 1 FROM mentorships WHERE mentorships.id = mid AND mentorships.uid = auth.uid()));

CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);

CREATE POLICY "Users can view own badges" ON user_badges FOR SELECT USING (uid = auth.uid());
CREATE POLICY "Badge issuers can manage badges" ON user_badges FOR ALL USING (iss = auth.uid());

CREATE POLICY "Users can view own verifications" ON verifications FOR SELECT USING (EXISTS (SELECT 1 FROM user_badges WHERE user_badges.id = ubg AND user_badges.uid = auth.uid()));

CREATE POLICY "Users can view own achievements" ON achievements FOR SELECT USING (EXISTS (SELECT 1 FROM user_badges WHERE user_badges.hsh = hsh AND user_badges.uid = auth.uid()));

CREATE POLICY "Users can view own consent logs" ON consent_logs FOR SELECT USING (uid = auth.uid());

CREATE POLICY "Users can view own auth events" ON auth_events FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own skills" ON skills FOR ALL USING (uid = auth.uid());
CREATE POLICY "Anyone can view skills" ON skills FOR SELECT USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at);

CREATE INDEX IF NOT EXISTS idx_career_postings_status ON career_postings(status);
CREATE INDEX IF NOT EXISTS idx_career_postings_location ON career_postings(location);

CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(sts);
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(uid);

CREATE INDEX IF NOT EXISTS idx_applications_project ON applications(pid);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(uid);

CREATE INDEX IF NOT EXISTS idx_mentorships_status ON mentorships(sts);
CREATE INDEX IF NOT EXISTS idx_mentorships_skills ON mentorships USING gin(skl);

CREATE INDEX IF NOT EXISTS idx_matches_mentor ON matches(mid);
CREATE INDEX IF NOT EXISTS idx_matches_user ON matches(uid);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(uid);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON user_badges(bid);

CREATE INDEX IF NOT EXISTS idx_verifications_badge ON verifications(ubg);
CREATE INDEX IF NOT EXISTS idx_verifications_verifier ON verifications(vby);

CREATE INDEX IF NOT EXISTS idx_achievements_hash ON achievements(hsh);

CREATE INDEX IF NOT EXISTS idx_consent_logs_user ON consent_logs(uid);
CREATE INDEX IF NOT EXISTS idx_consent_logs_type ON consent_logs(typ);

CREATE INDEX IF NOT EXISTS idx_auth_events_user ON auth_events(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_events_type ON auth_events(event_type);

CREATE INDEX IF NOT EXISTS idx_skills_user ON skills(uid);
CREATE INDEX IF NOT EXISTS idx_skills_name ON skills(skill_name);