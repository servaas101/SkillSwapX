-- Create function to analyze skill gaps
CREATE OR REPLACE FUNCTION public.analyze_skill_gaps(p_org_id UUID)
RETURNS TABLE (
  name TEXT,
  required INTEGER,
  current INTEGER,
  gap INTEGER,
  course TEXT,
  duration TEXT
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH org_skills AS (
    SELECT 
      si.skill_name,
      AVG(si.proficiency_level)::INTEGER as avg_level
    FROM skill_inventory si
    JOIN profiles p ON si.emp_id = p.id
    WHERE p.org_id = p_org_id
    GROUP BY si.skill_name
  )
  SELECT 
    os.skill_name as name,
    5 as required,
    os.avg_level as current,
    5 - os.avg_level as gap,
    CASE 
      WHEN os.skill_name ILIKE '%cloud%' THEN 'Advanced Cloud Architecture'
      WHEN os.skill_name ILIKE '%api%' THEN 'API Design Patterns'
      ELSE 'System Design Fundamentals'
    END as course,
    CASE 
      WHEN os.skill_name ILIKE '%cloud%' THEN '8 weeks'
      WHEN os.skill_name ILIKE '%api%' THEN '6 weeks'
      ELSE '4 weeks'
    END as duration
  FROM org_skills os;
END;
$$ LANGUAGE plpgsql;

-- Create function to get project staffing recommendations
CREATE OR REPLACE FUNCTION public.get_project_staffing(p_project_id TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  title TEXT,
  experience INTEGER,
  score INTEGER,
  skills JSON[]
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH project_skills AS (
    SELECT DISTINCT unnest(skills) as skill_name
    FROM projects
    WHERE id = p_project_id::UUID
  ),
  candidate_scores AS (
    SELECT 
      p.id,
      p.fn || ' ' || p.ln as full_name,
      COUNT(si.*) as matching_skills,
      AVG(si.proficiency_level) as avg_level
    FROM profiles p
    JOIN skill_inventory si ON p.id = si.emp_id
    WHERE si.skill_name IN (SELECT skill_name FROM project_skills)
    GROUP BY p.id, p.fn, p.ln
  )
  SELECT 
    cs.id,
    cs.full_name as name,
    'Senior Developer' as title,
    5 as experience,
    (cs.matching_skills * 20 + (cs.avg_level::INTEGER * 10))::INTEGER as score,
    array_agg(
      json_build_object(
        'name', si.skill_name,
        'level', si.proficiency_level
      )
    ) as skills
  FROM candidate_scores cs
  JOIN skill_inventory si ON cs.id = si.emp_id
  GROUP BY cs.id, cs.full_name, cs.matching_skills, cs.avg_level
  ORDER BY score DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;

-- Create function to track skill trends
CREATE OR REPLACE FUNCTION public.track_skill_trend(
  p_skill_name TEXT,
  p_months INTEGER DEFAULT 6
)
RETURNS TABLE (
  month DATE,
  demand INTEGER,
  supply INTEGER
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT generate_series(
      date_trunc('month', now()) - ((p_months-1) || ' months')::interval,
      date_trunc('month', now()),
      '1 month'::interval
    )::date as month
  ),
  skill_growth AS (
    SELECT 
      date_trunc('month', si.last_updated)::date as month,
      COUNT(*) as count
    FROM skill_inventory si
    WHERE si.skill_name = p_skill_name
    GROUP BY 1
  )
  SELECT 
    m.month,
    -- Simulated demand score (70-100)
    70 + floor(random() * 30)::INTEGER as demand,
    COALESCE(sg.count * 10, 40)::INTEGER as supply
  FROM months m
  LEFT JOIN skill_growth sg ON m.month = sg.month
  ORDER BY m.month;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS policies
ALTER TABLE public.skill_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view organization skills"
  ON public.skill_inventory FOR SELECT
  USING (
    emp_id IN (
      SELECT id FROM profiles 
      WHERE org_id = (
        SELECT org_id FROM profiles 
        WHERE uid = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage own skills"
  ON public.skill_inventory FOR ALL
  USING (
    emp_id IN (
      SELECT id FROM profiles 
      WHERE uid = auth.uid()
    )
  );