-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Projects table (prj)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org UUID NOT NULL REFERENCES profiles(id),
  ttl TEXT NOT NULL, -- title
  dsc TEXT, -- description
  img TEXT, -- image url
  skl JSONB, -- required skills
  bgt JSONB, -- budget info
  sts TEXT NOT NULL DEFAULT 'open', -- status
  str TIMESTAMP WITH TIME ZONE NOT NULL, -- start date
  edt TIMESTAMP WITH TIME ZONE, -- end date
  loc TEXT, -- location (remote/hybrid/onsite)
  typ TEXT NOT NULL, -- type (contract/permanent/mentorship)
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  met JSONB -- metadata
);

-- Project applications table (app)
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pid UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  msg TEXT, -- cover message
  exp JSONB, -- relevant experience
  sts TEXT NOT NULL DEFAULT 'pending',
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pid, uid)
);

-- Mentorship listings table (mtr)
CREATE TABLE mentorships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skl TEXT[] NOT NULL, -- skills to mentor
  exp INT NOT NULL, -- years of experience
  cap INT NOT NULL, -- mentee capacity
  cur INT DEFAULT 0, -- current mentees
  bio TEXT, -- mentor bio
  rte JSONB, -- rate/compensation
  avl JSONB, -- availability
  sts TEXT NOT NULL DEFAULT 'active',
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  udt TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Mentorship matches table (mtc)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mid UUID NOT NULL REFERENCES mentorships(id) ON DELETE CASCADE,
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gls TEXT[], -- learning goals
  dur INT NOT NULL, -- duration in weeks
  sts TEXT NOT NULL DEFAULT 'pending',
  cdt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  udt TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(mid, uid)
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Projects are readable by all authenticated users
CREATE POLICY "Projects are publicly readable"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

-- Projects are manageable by owners and org admins
CREATE POLICY "Projects are manageable by owners"
  ON projects FOR ALL
  TO authenticated
  USING (
    uid = auth.uid() OR
    org = (SELECT id FROM profiles WHERE uid = auth.uid())
  );

-- Applications are readable by project owner and applicant
CREATE POLICY "Applications are visible to involved parties"
  ON applications FOR SELECT
  TO authenticated
  USING (
    uid = auth.uid() OR
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = applications.pid
      AND (projects.uid = auth.uid() OR projects.org = (SELECT id FROM profiles WHERE uid = auth.uid()))
    )
  );

-- Applications can be created by authenticated users
CREATE POLICY "Users can create applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (uid = auth.uid());

-- Mentorships are readable by all authenticated users
CREATE POLICY "Mentorships are publicly readable"
  ON mentorships FOR SELECT
  TO authenticated
  USING (true);

-- Mentorships are manageable by owners
CREATE POLICY "Mentors can manage their listings"
  ON mentorships FOR ALL
  TO authenticated
  USING (uid = auth.uid());

-- Matches are visible to involved parties
CREATE POLICY "Matches are visible to participants"
  ON matches FOR SELECT
  TO authenticated
  USING (
    uid = auth.uid() OR
    EXISTS (
      SELECT 1 FROM mentorships
      WHERE mentorships.id = matches.mid
      AND mentorships.uid = auth.uid()
    )
  );

-- Functions

-- Create a new project
CREATE OR REPLACE FUNCTION create_project(
  p_ttl TEXT,
  p_dsc TEXT,
  p_skl JSONB,
  p_bgt JSONB,
  p_str TIMESTAMP WITH TIME ZONE,
  p_edt TIMESTAMP WITH TIME ZONE,
  p_loc TEXT,
  p_typ TEXT,
  p_met JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_org UUID;
BEGIN
  -- Get organization profile id
  SELECT id INTO v_org FROM profiles WHERE uid = auth.uid();
  IF v_org IS NULL THEN
    RAISE EXCEPTION 'Organization profile not found';
  END IF;

  INSERT INTO projects (uid, org, ttl, dsc, skl, bgt, str, edt, loc, typ, met)
  VALUES (auth.uid(), v_org, p_ttl, p_dsc, p_skl, p_bgt, p_str, p_edt, p_loc, p_typ, p_met)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply for a project
CREATE OR REPLACE FUNCTION apply_project(
  p_pid UUID,
  p_msg TEXT,
  p_exp JSONB
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO applications (pid, uid, msg, exp)
  VALUES (p_pid, auth.uid(), p_msg, p_exp)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create mentorship listing
CREATE OR REPLACE FUNCTION create_mentorship(
  p_skl TEXT[],
  p_exp INT,
  p_cap INT,
  p_bio TEXT,
  p_rte JSONB,
  p_avl JSONB
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO mentorships (uid, skl, exp, cap, bio, rte, avl)
  VALUES (auth.uid(), p_skl, p_exp, p_cap, p_bio, p_rte, p_avl)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Request mentorship match
CREATE OR REPLACE FUNCTION request_mentorship(
  p_mid UUID,
  p_gls TEXT[],
  p_dur INT
) RETURNS UUID AS $$
DECLARE
  v_id UUID;
  v_cur INT;
  v_cap INT;
BEGIN
  -- Check mentor capacity
  SELECT cur, cap INTO v_cur, v_cap
  FROM mentorships
  WHERE id = p_mid;
  
  IF v_cur >= v_cap THEN
    RAISE EXCEPTION 'Mentor has reached capacity';
  END IF;

  -- Create match request
  INSERT INTO matches (mid, uid, gls, dur)
  VALUES (p_mid, auth.uid(), p_gls, p_dur)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update mentorship status
CREATE OR REPLACE FUNCTION update_match_status(
  p_id UUID,
  p_sts TEXT
) RETURNS VOID AS $$
BEGIN
  -- Verify mentor owns the mentorship
  IF NOT EXISTS (
    SELECT 1 FROM mentorships m
    JOIN matches mt ON m.id = mt.mid
    WHERE mt.id = p_id AND m.uid = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Update match status
  UPDATE matches SET sts = p_sts WHERE id = p_id;
  
  -- Update mentor capacity if accepted
  IF p_sts = 'accepted' THEN
    UPDATE mentorships m
    SET cur = cur + 1
    FROM matches mt
    WHERE mt.id = p_id AND m.id = mt.mid;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers

-- Update timestamp trigger
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
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