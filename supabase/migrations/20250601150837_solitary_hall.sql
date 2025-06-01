-- Drop existing tables in reverse dependency order
DROP TABLE IF EXISTS mentorship_progress CASCADE;
DROP TABLE IF EXISTS mentorship_sessions CASCADE;
DROP TABLE IF EXISTS mentorship_badges CASCADE;
DROP TABLE IF EXISTS skill_assessments CASCADE;
DROP TABLE IF EXISTS skill_inventory CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS mentorships CASCADE;
DROP TABLE IF EXISTS badge_issuance CASCADE;
DROP TABLE IF EXISTS badge_templates CASCADE;
DROP TABLE IF EXISTS skill_endorsements CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS achievements CASCADE;
DROP TABLE IF EXISTS verifications CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS consent_logs CASCADE;
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS encrypted_data CASCADE;
DROP TABLE IF EXISTS compliance_logs CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,
  em TEXT,                              -- email
  fn TEXT,                              -- first name
  ln TEXT,                              -- last name
  bio TEXT,                             -- biography
  img TEXT,                             -- profile image
  ph TEXT,                              -- phone
  loc TEXT,                             -- location
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- updated date
  set JSONB,                            -- settings
  gdp BOOLEAN DEFAULT false,            -- gdpr consent
  gdl TIMESTAMP WITH TIME ZONE,         -- gdpr consent date
  UNIQUE(uid)
);

-- Foreign key to auth.users
ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create compliance_logs table
CREATE TABLE public.compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,
  typ TEXT NOT NULL,                    -- type
  act TEXT NOT NULL,                    -- action
  dat JSONB NOT NULL,                   -- data
  ip TEXT,                              -- ip address
  ts TIMESTAMP WITH TIME ZONE DEFAULT now() -- timestamp
);

-- Foreign key to auth.users
ALTER TABLE public.compliance_logs
  ADD CONSTRAINT compliance_logs_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create encrypted_data table
CREATE TABLE public.encrypted_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,
  typ TEXT NOT NULL,                    -- type
  dat TEXT NOT NULL,                    -- encrypted data
  iv TEXT NOT NULL,                     -- initialization vector
  exp TIMESTAMP WITH TIME ZONE,         -- expiration
  ts TIMESTAMP WITH TIME ZONE DEFAULT now() -- timestamp
);

-- Foreign key to auth.users
ALTER TABLE public.encrypted_data
  ADD CONSTRAINT encrypted_data_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,
  org UUID NOT NULL,
  ttl TEXT NOT NULL,                    -- title
  dsc TEXT,                             -- description
  img TEXT,                             -- image
  skl JSONB,                            -- skills
  bgt JSONB,                            -- budget
  sts TEXT NOT NULL DEFAULT 'open',     -- status
  str TIMESTAMP WITH TIME ZONE NOT NULL, -- start date
  edt TIMESTAMP WITH TIME ZONE,         -- end date (renamed from "end")
  loc TEXT,                             -- location
  typ TEXT NOT NULL,                    -- type
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- updated date
  met JSONB                             -- metadata
);

-- Foreign key to auth.users
ALTER TABLE public.projects
  ADD CONSTRAINT projects_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Foreign key to profiles
ALTER TABLE public.projects
  ADD CONSTRAINT projects_org_fkey 
  FOREIGN KEY (org) REFERENCES profiles(id);

-- Create applications table
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pid UUID NOT NULL,                    -- project id
  uid UUID NOT NULL,                    -- user id
  msg TEXT,                             -- message
  exp JSONB,                            -- experience
  sts TEXT NOT NULL DEFAULT 'pending',  -- status
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- updated date
  UNIQUE(pid, uid)
);

-- Foreign keys
ALTER TABLE public.applications
  ADD CONSTRAINT applications_pid_fkey 
  FOREIGN KEY (pid) REFERENCES projects(id) 
  ON DELETE CASCADE;

ALTER TABLE public.applications
  ADD CONSTRAINT applications_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create consent_logs table
CREATE TABLE public.consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,
  typ TEXT NOT NULL,                    -- type
  dat JSONB NOT NULL,                   -- data
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(), -- timestamp
  ip TEXT                               -- ip address
);

-- Foreign key to auth.users
ALTER TABLE public.consent_logs
  ADD CONSTRAINT consent_logs_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nam TEXT NOT NULL,                    -- name
  dsc TEXT,                             -- description
  img TEXT,                             -- image
  typ TEXT NOT NULL,                    -- type
  lvl INTEGER DEFAULT 1,                -- level
  exp TIMESTAMP WITH TIME ZONE,         -- expiration
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- updated date
  met JSONB                             -- metadata
);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,                    -- user id
  bid UUID NOT NULL,                    -- badge id
  iss UUID NOT NULL,                    -- issuer id (profile)
  sta TEXT NOT NULL DEFAULT 'pending',  -- status
  prf JSONB,                            -- proof
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- updated date
  vrf TIMESTAMP WITH TIME ZONE,         -- verified date
  exp TIMESTAMP WITH TIME ZONE,         -- expiration
  hsh TEXT,                             -- hash
  pub BOOLEAN DEFAULT false,            -- public
  UNIQUE(uid, bid)
);

-- Foreign keys
ALTER TABLE public.user_badges
  ADD CONSTRAINT user_badges_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_badges
  ADD CONSTRAINT user_badges_bid_fkey 
  FOREIGN KEY (bid) REFERENCES badges(id) 
  ON DELETE CASCADE;

ALTER TABLE public.user_badges
  ADD CONSTRAINT user_badges_iss_fkey 
  FOREIGN KEY (iss) REFERENCES profiles(id);

-- Create verifications table
CREATE TABLE public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ubg UUID NOT NULL,                    -- user badge id
  vby UUID NOT NULL,                    -- verified by (profile)
  typ TEXT NOT NULL,                    -- type
  sta TEXT NOT NULL,                    -- status
  prf JSONB,                            -- proof
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  met JSONB                             -- metadata
);

-- Foreign keys
ALTER TABLE public.verifications
  ADD CONSTRAINT verifications_ubg_fkey 
  FOREIGN KEY (ubg) REFERENCES user_badges(id) 
  ON DELETE CASCADE;

ALTER TABLE public.verifications
  ADD CONSTRAINT verifications_vby_fkey 
  FOREIGN KEY (vby) REFERENCES profiles(id);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hsh TEXT NOT NULL UNIQUE,             -- hash
  typ TEXT NOT NULL,                    -- type
  lvl INTEGER DEFAULT 1,                -- level
  dat JSONB NOT NULL,                   -- data
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  exp TIMESTAMP WITH TIME ZONE          -- expiration
);

-- Create skills table
CREATE TABLE public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,                    -- user id
  name TEXT NOT NULL,                   -- skill name
  level INTEGER NOT NULL CHECK (level >= 1 AND level <= 5), -- proficiency level
  category TEXT NOT NULL,               -- category
  weight INTEGER DEFAULT 1,             -- weight/importance
  metadata JSONB,                       -- additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Foreign key to auth.users
ALTER TABLE public.skills
  ADD CONSTRAINT skills_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create skill_endorsements table
CREATE TABLE public.skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL,               -- skill id
  endorser_id UUID NOT NULL,            -- endorser profile id
  weight INTEGER DEFAULT 1,             -- endorsement weight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(skill_id, endorser_id)
);

-- Foreign keys
ALTER TABLE public.skill_endorsements
  ADD CONSTRAINT skill_endorsements_skill_id_fkey 
  FOREIGN KEY (skill_id) REFERENCES skills(id) 
  ON DELETE CASCADE;

ALTER TABLE public.skill_endorsements
  ADD CONSTRAINT skill_endorsements_endorser_id_fkey 
  FOREIGN KEY (endorser_id) REFERENCES profiles(id);

-- Create badge_templates table
CREATE TABLE public.badge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                   -- badge name
  description TEXT,                     -- description
  image_url TEXT,                       -- image URL
  category TEXT NOT NULL,               -- category
  requirements JSONB NOT NULL,          -- requirements
  metadata JSONB,                       -- additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create badge_issuance table
CREATE TABLE public.badge_issuance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id UUID NOT NULL,               -- badge template id
  recipient_id UUID NOT NULL,           -- recipient profile id
  issuer_id UUID NOT NULL,              -- issuer profile id
  status TEXT NOT NULL DEFAULT 'pending', -- status
  evidence JSONB,                       -- evidence
  issued_at TIMESTAMP WITH TIME ZONE,   -- issued date
  expires_at TIMESTAMP WITH TIME ZONE,  -- expiration date
  metadata JSONB,                       -- additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(badge_id, recipient_id)
);

-- Foreign keys
ALTER TABLE public.badge_issuance
  ADD CONSTRAINT badge_issuance_badge_id_fkey 
  FOREIGN KEY (badge_id) REFERENCES badge_templates(id);

ALTER TABLE public.badge_issuance
  ADD CONSTRAINT badge_issuance_recipient_id_fkey 
  FOREIGN KEY (recipient_id) REFERENCES profiles(id);

ALTER TABLE public.badge_issuance
  ADD CONSTRAINT badge_issuance_issuer_id_fkey 
  FOREIGN KEY (issuer_id) REFERENCES profiles(id);

-- Create mentorships table
CREATE TABLE public.mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL,                    -- user id
  skl TEXT[] NOT NULL,                  -- skills
  exp INTEGER NOT NULL,                 -- experience (years)
  cap INTEGER NOT NULL,                 -- capacity
  cur INTEGER DEFAULT 0,                -- current mentees
  bio TEXT,                             -- biography
  rte JSONB,                            -- rates
  avl JSONB,                            -- availability
  sts TEXT NOT NULL DEFAULT 'active',   -- status
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now()   -- updated date
);

-- Foreign key to auth.users
ALTER TABLE public.mentorships
  ADD CONSTRAINT mentorships_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create matches table
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mid UUID NOT NULL,                    -- mentorship id
  uid UUID NOT NULL,                    -- user id
  gls TEXT[],                           -- goals
  dur INTEGER NOT NULL,                 -- duration
  sts TEXT NOT NULL DEFAULT 'pending',  -- status
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- created date
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),  -- updated date
  UNIQUE(mid, uid)
);

-- Foreign keys
ALTER TABLE public.matches
  ADD CONSTRAINT matches_mid_fkey 
  FOREIGN KEY (mid) REFERENCES mentorships(id) 
  ON DELETE CASCADE;

ALTER TABLE public.matches
  ADD CONSTRAINT matches_uid_fkey 
  FOREIGN KEY (uid) REFERENCES auth.users(id) 
  ON DELETE CASCADE;

-- Create skill_inventory table
CREATE TABLE public.skill_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id UUID NOT NULL,                  -- employee profile id
  skill_name TEXT NOT NULL,              -- skill name
  category TEXT NOT NULL,                -- category
  subcategory TEXT,                      -- subcategory
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  years_experience NUMERIC(4,1),         -- years of experience
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,                        -- additional metadata
  UNIQUE(emp_id, skill_name)
);

-- Foreign key to profiles
ALTER TABLE public.skill_inventory
  ADD CONSTRAINT skill_inventory_emp_id_fkey 
  FOREIGN KEY (emp_id) REFERENCES profiles(id) 
  ON DELETE CASCADE;

-- Create skill_assessments table
CREATE TABLE public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id UUID NOT NULL,                  -- employee profile id
  skill_id UUID NOT NULL,                -- skill inventory id
  assessor_id UUID NOT NULL,             -- assessor profile id
  score INTEGER CHECK (score >= 1 AND score <= 100), -- assessment score
  feedback TEXT,                         -- feedback
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_assessment TIMESTAMP WITH TIME ZONE,
  metadata JSONB                         -- additional metadata
);

-- Foreign keys
ALTER TABLE public.skill_assessments
  ADD CONSTRAINT skill_assessments_emp_id_fkey 
  FOREIGN KEY (emp_id) REFERENCES profiles(id);

ALTER TABLE public.skill_assessments
  ADD CONSTRAINT skill_assessments_skill_id_fkey 
  FOREIGN KEY (skill_id) REFERENCES skill_inventory(id);

ALTER TABLE public.skill_assessments
  ADD CONSTRAINT skill_assessments_assessor_id_fkey 
  FOREIGN KEY (assessor_id) REFERENCES profiles(id);

-- Create mentorship_programs table
CREATE TABLE public.mentorship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL,               -- mentor profile id
  title TEXT NOT NULL,                   -- program title
  description TEXT,                      -- description
  skills TEXT[] NOT NULL,                -- skills covered
  capacity INTEGER NOT NULL CHECK (capacity > 0), -- max mentees
  duration INTEGER NOT NULL CHECK (duration > 0), -- duration in months
  status TEXT NOT NULL DEFAULT 'active', -- status
  schedule JSONB,                        -- schedule details
  requirements JSONB,                    -- requirements
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Foreign key to profiles
ALTER TABLE public.mentorship_programs
  ADD CONSTRAINT mentorship_programs_mentor_id_fkey 
  FOREIGN KEY (mentor_id) REFERENCES profiles(id);

-- Create mentorship_sessions table
CREATE TABLE public.mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL,              -- mentorship program id
  mentee_id UUID NOT NULL,               -- mentee profile id
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL, -- session date/time
  duration INTEGER NOT NULL,             -- duration in minutes
  status TEXT NOT NULL DEFAULT 'scheduled', -- status
  notes TEXT,                            -- session notes
  feedback JSONB,                        -- feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Foreign keys
ALTER TABLE public.mentorship_sessions
  ADD CONSTRAINT mentorship_sessions_program_id_fkey 
  FOREIGN KEY (program_id) REFERENCES mentorship_programs(id);

ALTER TABLE public.mentorship_sessions
  ADD CONSTRAINT mentorship_sessions_mentee_id_fkey 
  FOREIGN KEY (mentee_id) REFERENCES profiles(id);

-- Create mentorship_progress table
CREATE TABLE public.mentorship_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL,               -- mentorship program id
  mentee_id UUID NOT NULL,                -- mentee profile id
  milestone TEXT NOT NULL,                -- milestone name
  status TEXT NOT NULL DEFAULT 'pending', -- status
  completed_at TIMESTAMP WITH TIME ZONE,  -- completion date
  evidence JSONB,                         -- evidence
  feedback TEXT,                          -- feedback
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(program_id, mentee_id, milestone)
);

-- Foreign keys
ALTER TABLE public.mentorship_progress
  ADD CONSTRAINT mentorship_progress_program_id_fkey 
  FOREIGN KEY (program_id) REFERENCES mentorship_programs(id);

ALTER TABLE public.mentorship_progress
  ADD CONSTRAINT mentorship_progress_mentee_id_fkey 
  FOREIGN KEY (mentee_id) REFERENCES profiles(id);

-- Create mentorship_badges table
CREATE TABLE public.mentorship_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                    -- badge name
  description TEXT,                      -- description
  level TEXT NOT NULL,                   -- level (beginner, intermediate, advanced)
  requirements JSONB NOT NULL,           -- requirements
  metadata JSONB,                        -- additional metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trigger functions for updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  AS $$
BEGIN
  NEW.udt = now();
  RETURN NEW;
END;
$$;

-- Create triggers for all tables with updated_at fields
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER badges_updated_at
  BEFORE UPDATE ON badges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER user_badges_updated_at
  BEFORE UPDATE ON user_badges
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER mentorships_updated_at
  BEFORE UPDATE ON mentorships
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_issuance ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_badges ENABLE ROW LEVEL SECURITY;

-- Profile policies
CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (uid() = uid);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (uid() = uid);

-- Compliance logs policies
CREATE POLICY "Users can view own compliance logs" 
  ON compliance_logs FOR SELECT 
  USING (uid = uid());

-- Encrypted data policies
CREATE POLICY "Users can access own encrypted data" 
  ON encrypted_data FOR SELECT 
  USING (uid = uid());

-- Projects policies
CREATE POLICY "Projects are manageable by owners" 
  ON projects FOR ALL 
  USING ((uid = uid()) OR (org = (SELECT id FROM profiles WHERE uid = uid())));

CREATE POLICY "Projects are publicly readable" 
  ON projects FOR SELECT 
  USING (true);

-- Applications policies
CREATE POLICY "Applications are visible to involved parties" 
  ON applications FOR SELECT 
  USING ((uid = uid()) OR (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = applications.pid 
    AND (projects.uid = uid() OR projects.org = (
      SELECT id FROM profiles WHERE uid = uid()
    ))
  )));

CREATE POLICY "Users can create applications" 
  ON applications FOR INSERT 
  WITH CHECK (uid = uid());

-- Consent logs policies
CREATE POLICY "Users can view own consent logs" 
  ON consent_logs FOR SELECT 
  USING (uid() = uid);

CREATE POLICY "System can insert consent logs" 
  ON consent_logs FOR INSERT 
  WITH CHECK (true);

-- Badges policies
CREATE POLICY "Badges are readable by all users" 
  ON badges FOR SELECT 
  USING (true);

-- User badges policies
CREATE POLICY "Users can view own badges" 
  ON user_badges FOR SELECT 
  USING ((uid = uid()) OR (iss = (SELECT id FROM profiles WHERE uid = uid())));

-- Verifications policies
CREATE POLICY "Verifications are readable by involved parties" 
  ON verifications FOR SELECT 
  USING ((vby = (SELECT id FROM profiles WHERE uid = uid())) OR (
    EXISTS (
      SELECT 1 FROM user_badges 
      WHERE user_badges.id = verifications.ubg 
      AND user_badges.uid = uid()
    )
  ));

-- Achievements policies
CREATE POLICY "Achievements are readable by hash owner" 
  ON achievements FOR SELECT 
  USING (hsh IN (SELECT hsh FROM user_badges WHERE uid = uid()));

-- Skills policies
CREATE POLICY "Users can manage their skills" 
  ON skills FOR ALL 
  USING (uid = uid());

-- Skill endorsements policies
CREATE POLICY "Users can manage own endorsements" 
  ON skill_endorsements FOR ALL 
  USING (endorser_id = (SELECT id FROM profiles WHERE uid = uid()));

CREATE POLICY "Users can view endorsements" 
  ON skill_endorsements FOR SELECT 
  USING (true);

-- Badge templates policies
CREATE POLICY "Badge templates are viewable by all" 
  ON badge_templates FOR SELECT 
  USING (true);

-- Badge issuance policies
CREATE POLICY "Badge issuance viewable by recipient and issuer" 
  ON badge_issuance FOR SELECT 
  USING ((recipient_id IN (SELECT id FROM profiles WHERE uid = uid())) OR (
    issuer_id IN (SELECT id FROM profiles WHERE uid = uid())
  ));

-- Skill inventory policies
CREATE POLICY "Users can view own skills" 
  ON skill_inventory FOR SELECT 
  USING (emp_id IN (SELECT id FROM profiles WHERE uid = uid()));

CREATE POLICY "Users can view department skills" 
  ON skill_inventory FOR SELECT 
  USING (emp_id IN (
    SELECT id FROM profiles 
    WHERE loc = (SELECT loc FROM profiles WHERE uid = uid())
  ));

CREATE POLICY "Users can manage own skills" 
  ON skill_inventory FOR ALL 
  USING (emp_id IN (SELECT id FROM profiles WHERE uid = uid()));

-- Skill assessments policies
CREATE POLICY "Assessments viewable by employee and assessor" 
  ON skill_assessments FOR SELECT 
  USING ((emp_id IN (SELECT id FROM profiles WHERE uid = uid())) OR (
    assessor_id IN (SELECT id FROM profiles WHERE uid = uid())
  ));

-- Mentorships policies
CREATE POLICY "Mentorships are publicly readable" 
  ON mentorships FOR SELECT 
  USING (true);

CREATE POLICY "Mentors can manage their listings" 
  ON mentorships FOR ALL 
  USING (uid = uid());

-- Matches policies
CREATE POLICY "Matches are visible to participants" 
  ON matches FOR SELECT 
  USING ((uid = uid()) OR (EXISTS (
    SELECT 1 FROM mentorships 
    WHERE mentorships.id = matches.mid 
    AND mentorships.uid = uid()
  )));

-- Mentorship programs policies
CREATE POLICY "Users can view active programs" 
  ON mentorship_programs FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Mentors can manage their programs" 
  ON mentorship_programs FOR ALL 
  USING (mentor_id IN (SELECT id FROM profiles WHERE uid = uid()));

-- Mentorship sessions policies
CREATE POLICY "Users can view their sessions" 
  ON mentorship_sessions FOR SELECT 
  USING ((program_id IN (
    SELECT id FROM mentorship_programs 
    WHERE mentor_id IN (SELECT id FROM profiles WHERE uid = uid())
  )) OR (mentee_id IN (SELECT id FROM profiles WHERE uid = uid())));

-- Mentorship progress policies
CREATE POLICY "Users can view their progress" 
  ON mentorship_progress FOR SELECT 
  USING ((program_id IN (
    SELECT id FROM mentorship_programs 
    WHERE mentor_id IN (SELECT id FROM profiles WHERE uid = uid())
  )) OR (mentee_id IN (SELECT id FROM profiles WHERE uid = uid())));

-- Mentorship badges policies
CREATE POLICY "Everyone can view badges" 
  ON mentorship_badges FOR SELECT 
  USING (true);

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
BEGIN
  INSERT INTO public.profiles (uid, em, cdt, udt, gdp)
  VALUES (NEW.id, NEW.email, now(), now(), false);
  RETURN NEW;
END;
$$;

-- Create a trigger to handle new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();