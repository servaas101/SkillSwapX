-- Skills table
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  weight INT DEFAULT 1,
  related UUID[] DEFAULT '{}',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Skill endorsements
CREATE TABLE skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  endorser_id UUID REFERENCES profiles(id),
  weight INT DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Badge metadata table
CREATE TABLE badge_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE badge_metadata ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Skills are readable by all"
  ON skills FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Endorsements are readable by all"
  ON skill_endorsements FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Badge metadata is readable by all"
  ON badge_metadata FOR SELECT
  TO authenticated
  USING (true);

-- Functions
CREATE OR REPLACE FUNCTION get_skill_recommendations(
  p_uid UUID,
  p_limit INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  weight INT
) AS $$
BEGIN
  RETURN QUERY
  WITH user_skills AS (
    SELECT DISTINCT s.id
    FROM skills s
    JOIN skill_endorsements se ON s.id = se.skill_id
    WHERE se.endorser_id = (
      SELECT id FROM profiles WHERE uid = p_uid
    )
  )
  SELECT s.id, s.name, s.weight
  FROM skills s
  WHERE s.id = ANY(
    SELECT UNNEST(related)
    FROM skills
    WHERE id IN (SELECT id FROM user_skills)
  )
  AND s.id NOT IN (SELECT id FROM user_skills)
  ORDER BY s.weight DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_skill_weight(
  p_id UUID,
  p_weight INT
)
RETURNS void AS $$
BEGIN
  UPDATE skills
  SET weight = p_weight
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;