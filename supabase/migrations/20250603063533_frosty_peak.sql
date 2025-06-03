/*
  # Enable RLS and add policies

  1. Security Changes
    - Enable RLS on tables that were missing it
    - Add policies for projects table
    - Add policies for applications table
    - Add policies for mentorships table
    - Add policies for matches table
    - Add policies for badges and user_badges tables
    - Add policies for verifications and achievements tables

  2. Changes
    - Enable RLS on multiple tables
    - Add CRUD policies with proper authentication checks
    - Ensure data can only be accessed by authorized users
*/

-- Enable RLS on tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view all active projects" 
  ON projects FOR SELECT 
  TO authenticated 
  USING (sts = 'open');

CREATE POLICY "Users can create own projects" 
  ON projects FOR INSERT 
  TO authenticated 
  WITH CHECK (uid = auth.uid());

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  TO authenticated 
  USING (uid = auth.uid());

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  TO authenticated 
  USING (uid = auth.uid());

-- Applications policies
CREATE POLICY "Users can view own applications" 
  ON applications FOR SELECT 
  TO authenticated 
  USING (uid = auth.uid());

CREATE POLICY "Project owners can view applications" 
  ON applications FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM projects 
    WHERE projects.id = applications.pid 
    AND projects.uid = auth.uid()
  ));

CREATE POLICY "Users can create applications" 
  ON applications FOR INSERT 
  TO authenticated 
  WITH CHECK (uid = auth.uid());

CREATE POLICY "Users can update own applications" 
  ON applications FOR UPDATE 
  TO authenticated 
  USING (uid = auth.uid());

-- Mentorships policies
CREATE POLICY "Anyone can view active mentorships" 
  ON mentorships FOR SELECT 
  TO authenticated 
  USING (sts = 'active');

CREATE POLICY "Users can create own mentorships" 
  ON mentorships FOR INSERT 
  TO authenticated 
  WITH CHECK (uid = auth.uid());

CREATE POLICY "Users can update own mentorships" 
  ON mentorships FOR UPDATE 
  TO authenticated 
  USING (uid = auth.uid());

-- Matches policies
CREATE POLICY "Mentors can view their matches" 
  ON matches FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM mentorships 
    WHERE mentorships.id = matches.mid 
    AND mentorships.uid = auth.uid()
  ));

CREATE POLICY "Mentees can view own matches" 
  ON matches FOR SELECT 
  TO authenticated 
  USING (uid = auth.uid());

CREATE POLICY "Users can create match requests" 
  ON matches FOR INSERT 
  TO authenticated 
  WITH CHECK (uid = auth.uid());

-- Badges policies
CREATE POLICY "Anyone can view badges" 
  ON badges FOR SELECT 
  TO authenticated 
  USING (true);

-- User badges policies
CREATE POLICY "Users can view own badges" 
  ON user_badges FOR SELECT 
  TO authenticated 
  USING (uid = auth.uid());

CREATE POLICY "Users can view public badges" 
  ON user_badges FOR SELECT 
  TO authenticated 
  USING (pub = true);

CREATE POLICY "Badge issuers can create badges" 
  ON user_badges FOR INSERT 
  TO authenticated 
  WITH CHECK (iss = auth.uid());

-- Verifications policies
CREATE POLICY "Users can view own verifications" 
  ON verifications FOR SELECT 
  TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM user_badges 
    WHERE user_badges.id = verifications.ubg 
    AND user_badges.uid = auth.uid()
  ));

CREATE POLICY "Verifiers can create verifications" 
  ON verifications FOR INSERT 
  TO authenticated 
  WITH CHECK (vby = auth.uid());

-- Achievements policies
CREATE POLICY "Users can view achievements" 
  ON achievements FOR SELECT 
  TO authenticated 
  USING (true);