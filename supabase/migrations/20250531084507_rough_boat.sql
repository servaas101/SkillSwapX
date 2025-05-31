-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  category TEXT NOT NULL,
  weight INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Skill endorsements
CREATE TABLE skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES profiles(id),
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(skill_id, endorser_id)
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their skills"
  ON skills FOR ALL
  TO authenticated
  USING (uid = auth.uid());

CREATE POLICY "Skills are publicly readable"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their endorsements"
  ON skill_endorsements FOR ALL
  TO authenticated
  USING (endorser_id = (SELECT id FROM profiles WHERE uid = auth.uid()));

CREATE POLICY "Endorsements are publicly readable"
  ON skill_endorsements FOR SELECT
  TO authenticated
  USING (true);

-- Functions
CREATE OR REPLACE FUNCTION endorse_skill(p_skill_id UUID)
RETURNS UUID AS $$
DECLARE
  v_endorser_id UUID;
  v_id UUID;
BEGIN
  -- Get endorser's profile ID
  SELECT id INTO v_endorser_id
  FROM profiles
  WHERE uid = auth.uid();

  -- Create endorsement
  INSERT INTO skill_endorsements (skill_id, endorser_id)
  VALUES (p_skill_id, v_endorser_id)
  RETURNING id INTO v_id;

  -- Update skill weight
  UPDATE skills
  SET weight = weight + 1
  WHERE id = p_skill_id;

  RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER update_skills_updated_at
  BEFORE UPDATE ON skills
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();