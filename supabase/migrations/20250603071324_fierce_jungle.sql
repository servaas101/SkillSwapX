/*
  # Fix Profile Access and RLS Policies

  1. Changes
    - Enable RLS on tables that need it
    - Add proper policies for profile access
    - Fix authenticated user access to own profile

  2. Security
    - Enable RLS on required tables
    - Add policies for authenticated users
    - Ensure proper data access control
*/

-- Enable RLS on tables that need it
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Fix profile access policies
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = uid);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = uid)
WITH CHECK (auth.uid() = uid);

-- Project policies
CREATE POLICY "Users can view all active projects"
ON projects FOR SELECT
TO authenticated
USING (sts = 'active');

CREATE POLICY "Users can manage own projects"
ON projects FOR ALL
TO authenticated
USING (uid = auth.uid());

-- Application policies
CREATE POLICY "Users can view own applications"
ON applications FOR SELECT
TO authenticated
USING (uid = auth.uid());

CREATE POLICY "Project owners can view applications"
ON applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = applications.pid 
    AND projects.uid = auth.uid()
  )
);

-- Mentorship policies
CREATE POLICY "Users can view active mentorships"
ON mentorships FOR SELECT
TO authenticated
USING (sts = 'active');

CREATE POLICY "Users can manage own mentorships"
ON mentorships FOR ALL
TO authenticated
USING (uid = auth.uid());

-- Match policies
CREATE POLICY "Users can view own matches"
ON matches FOR SELECT
TO authenticated
USING (uid = auth.uid());

CREATE POLICY "Mentors can view matches"
ON matches FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM mentorships 
    WHERE mentorships.id = matches.mid 
    AND mentorships.uid = auth.uid()
  )
);

-- Badge policies
CREATE POLICY "Anyone can view public badges"
ON badges FOR SELECT
TO public
USING (true);

-- User badge policies
CREATE POLICY "Users can view own badges"
ON user_badges FOR SELECT
TO authenticated
USING (uid = auth.uid());

CREATE POLICY "Badge issuers can view issued badges"
ON user_badges FOR SELECT
TO authenticated
USING (iss = auth.uid());

-- Verification policies
CREATE POLICY "Users can view own verifications"
ON verifications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_badges 
    WHERE user_badges.id = verifications.ubg 
    AND user_badges.uid = auth.uid()
  )
);

-- Achievement policies
CREATE POLICY "Users can view own achievements"
ON achievements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_badges 
    WHERE user_badges.hsh = achievements.hsh 
    AND user_badges.uid = auth.uid()
  )
);