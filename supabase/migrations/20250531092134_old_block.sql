-- Create skill inventory table
CREATE TABLE IF NOT EXISTS public.skill_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  proficiency_level INTEGER CHECK (proficiency_level BETWEEN 1 AND 5),
  years_experience NUMERIC(4,1),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB,
  UNIQUE(emp_id, skill_name)
);

-- Create skill endorsements table
CREATE TABLE IF NOT EXISTS public.skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES public.skill_inventory(id) ON DELETE CASCADE,
  endorser_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(skill_id, endorser_id)
);

-- Create badge templates table
CREATE TABLE IF NOT EXISTS public.badge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT NOT NULL,
  requirements JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create badge issuance table
CREATE TABLE IF NOT EXISTS public.badge_issuance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_id UUID NOT NULL REFERENCES public.badge_templates(id),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id),
  issuer_id UUID NOT NULL REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'pending',
  evidence JSONB,
  issued_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(badge_id, recipient_id)
);

-- Create skill assessment table
CREATE TABLE IF NOT EXISTS public.skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emp_id UUID NOT NULL REFERENCES public.profiles(id),
  skill_id UUID NOT NULL REFERENCES public.skill_inventory(id),
  assessor_id UUID NOT NULL REFERENCES public.profiles(id),
  score INTEGER CHECK (score BETWEEN 1 AND 100),
  feedback TEXT,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_assessment TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);

-- Function to add or update skill
CREATE OR REPLACE FUNCTION public.upsert_skill(
  p_emp_id UUID,
  p_skill_name TEXT,
  p_category TEXT,
  p_subcategory TEXT,
  p_level INTEGER,
  p_years NUMERIC
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_skill_id UUID;
BEGIN
  INSERT INTO public.skill_inventory (
    emp_id, skill_name, category, subcategory,
    proficiency_level, years_experience
  )
  VALUES (
    p_emp_id, p_skill_name, p_category, p_subcategory,
    p_level, p_years
  )
  ON CONFLICT (emp_id, skill_name)
  DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    years_experience = EXCLUDED.years_experience,
    last_updated = now()
  RETURNING id INTO v_skill_id;
  
  RETURN v_skill_id;
END;
$$;

-- Function to endorse skill
CREATE OR REPLACE FUNCTION public.endorse_skill(
  p_skill_id UUID,
  p_endorser_id UUID,
  p_rating INTEGER,
  p_comment TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_endorsement_id UUID;
BEGIN
  INSERT INTO public.skill_endorsements (
    skill_id, endorser_id, rating, comment
  )
  VALUES (
    p_skill_id, p_endorser_id, p_rating, p_comment
  )
  ON CONFLICT (skill_id, endorser_id)
  DO UPDATE SET
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment
  RETURNING id INTO v_endorsement_id;
  
  RETURN v_endorsement_id;
END;
$$;

-- Function to issue badge
CREATE OR REPLACE FUNCTION public.issue_badge(
  p_badge_id UUID,
  p_recipient_id UUID,
  p_issuer_id UUID,
  p_evidence JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_issuance_id UUID;
BEGIN
  -- Verify requirements are met
  IF NOT EXISTS (
    SELECT 1 FROM badge_templates bt
    WHERE bt.id = p_badge_id
    AND requirements_met(p_recipient_id, bt.requirements)
  ) THEN
    RAISE EXCEPTION 'Badge requirements not met';
  END IF;

  INSERT INTO public.badge_issuance (
    badge_id, recipient_id, issuer_id,
    status, evidence, issued_at
  )
  VALUES (
    p_badge_id, p_recipient_id, p_issuer_id,
    'issued', p_evidence, now()
  )
  RETURNING id INTO v_issuance_id;
  
  RETURN v_issuance_id;
END;
$$;

-- Function to check if badge requirements are met
CREATE OR REPLACE FUNCTION public.requirements_met(
  p_emp_id UUID,
  p_requirements JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check skill requirements
  IF p_requirements->>'type' = 'skill' THEN
    RETURN EXISTS (
      SELECT 1 FROM skill_inventory si
      WHERE si.emp_id = p_emp_id
      AND si.skill_name = p_requirements->>'skill_name'
      AND si.proficiency_level >= (p_requirements->>'min_level')::INTEGER
    );
  END IF;
  
  -- Check assessment requirements
  IF p_requirements->>'type' = 'assessment' THEN
    RETURN EXISTS (
      SELECT 1 FROM skill_assessments sa
      WHERE sa.emp_id = p_emp_id
      AND sa.score >= (p_requirements->>'min_score')::INTEGER
    );
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Enable Row Level Security
ALTER TABLE public.skill_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_issuance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own skills"
  ON public.skill_inventory FOR SELECT
  USING (emp_id IN (
    SELECT id FROM profiles WHERE uid = auth.uid()
  ));

CREATE POLICY "Users can manage own skills"
  ON public.skill_inventory FOR ALL
  USING (emp_id IN (
    SELECT id FROM profiles WHERE uid = auth.uid()
  ));

CREATE POLICY "Users can view endorsements"
  ON public.skill_endorsements FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can manage own endorsements"
  ON public.skill_endorsements FOR ALL
  USING (endorser_id IN (
    SELECT id FROM profiles WHERE uid = auth.uid()
  ));

CREATE POLICY "Badge templates are viewable by all"
  ON public.badge_templates FOR SELECT
  USING (TRUE);

CREATE POLICY "Badge issuance viewable by recipient and issuer"
  ON public.badge_issuance FOR SELECT
  USING (
    recipient_id IN (SELECT id FROM profiles WHERE uid = auth.uid())
    OR issuer_id IN (SELECT id FROM profiles WHERE uid = auth.uid())
  );

CREATE POLICY "Assessments viewable by employee and assessor"
  ON public.skill_assessments FOR SELECT
  USING (
    emp_id IN (SELECT id FROM profiles WHERE uid = auth.uid())
    OR assessor_id IN (SELECT id FROM profiles WHERE uid = auth.uid())
  );