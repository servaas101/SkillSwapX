-- Create mentorship_programs table
CREATE TABLE IF NOT EXISTS public.mentorship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID NOT NULL REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  skills TEXT[] NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  duration INTEGER NOT NULL CHECK (duration > 0),
  status TEXT NOT NULL DEFAULT 'active',
  schedule JSONB,
  requirements JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mentorship_sessions table
CREATE TABLE IF NOT EXISTS public.mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.mentorship_programs(id),
  mentee_id UUID NOT NULL REFERENCES public.profiles(id),
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mentorship_progress table
CREATE TABLE IF NOT EXISTS public.mentorship_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES public.mentorship_programs(id),
  mentee_id UUID NOT NULL REFERENCES public.profiles(id),
  milestone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE,
  evidence JSONB,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(program_id, mentee_id, milestone)
);

-- Create mentorship_badges table
CREATE TABLE IF NOT EXISTS public.mentorship_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL,
  requirements JSONB NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create function to schedule mentorship session
CREATE OR REPLACE FUNCTION public.schedule_mentorship_session(
  p_program_id UUID,
  p_mentee_id UUID,
  p_scheduled_at TIMESTAMP WITH TIME ZONE,
  p_duration INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_mentor_id UUID;
  v_capacity INTEGER;
  v_current_count INTEGER;
BEGIN
  -- Get mentor and capacity info
  SELECT mentor_id, capacity INTO v_mentor_id, v_capacity
  FROM mentorship_programs
  WHERE id = p_program_id;
  
  -- Check current mentee count
  SELECT COUNT(*) INTO v_current_count
  FROM mentorship_sessions
  WHERE program_id = p_program_id
  AND status = 'scheduled';
  
  -- Verify capacity
  IF v_current_count >= v_capacity THEN
    RAISE EXCEPTION 'Program is at full capacity';
  END IF;
  
  -- Create session
  INSERT INTO mentorship_sessions (
    program_id, mentee_id, scheduled_at, duration, status
  )
  VALUES (
    p_program_id, p_mentee_id, p_scheduled_at, p_duration, 'scheduled'
  )
  RETURNING id INTO v_session_id;
  
  RETURN v_session_id;
END;
$$;

-- Create function to update mentorship progress
CREATE OR REPLACE FUNCTION public.update_mentorship_progress(
  p_program_id UUID,
  p_mentee_id UUID,
  p_milestone TEXT,
  p_status TEXT,
  p_evidence JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_progress_id UUID;
BEGIN
  INSERT INTO mentorship_progress (
    program_id, mentee_id, milestone, status, evidence,
    completed_at
  )
  VALUES (
    p_program_id, p_mentee_id, p_milestone, p_status, p_evidence,
    CASE WHEN p_status = 'completed' THEN now() ELSE NULL END
  )
  ON CONFLICT (program_id, mentee_id, milestone)
  DO UPDATE SET
    status = EXCLUDED.status,
    evidence = EXCLUDED.evidence,
    completed_at = EXCLUDED.completed_at
  RETURNING id INTO v_progress_id;
  
  RETURN v_progress_id;
END;
$$;

-- Create function to issue mentorship badge
CREATE OR REPLACE FUNCTION public.issue_mentorship_badge(
  p_program_id UUID,
  p_mentee_id UUID,
  p_badge_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_mentor_id UUID;
  v_badge_requirements JSONB;
  v_completed_count INTEGER;
  v_total_count INTEGER;
  v_completion_percentage INTEGER;
BEGIN
  -- Get mentor ID
  SELECT mentor_id INTO v_mentor_id
  FROM mentorship_programs
  WHERE id = p_program_id;
  
  -- Get badge requirements
  SELECT requirements INTO v_badge_requirements
  FROM mentorship_badges
  WHERE id = p_badge_id;
  
  -- Calculate progress
  SELECT 
    COUNT(CASE WHEN status = 'completed' THEN 1 END),
    COUNT(*)
  INTO v_completed_count, v_total_count
  FROM mentorship_progress
  WHERE program_id = p_program_id
  AND mentee_id = p_mentee_id;
  
  v_completion_percentage := (v_completed_count::FLOAT / v_total_count * 100)::INTEGER;
  
  -- Verify requirements
  IF v_completion_percentage < (v_badge_requirements->>'min_completion')::INTEGER THEN
    RAISE EXCEPTION 'Badge requirements not met';
  END IF;
  
  -- Issue badge
  RETURN issue_badge(
    p_badge_id,
    p_mentee_id,
    v_mentor_id,
    jsonb_build_object(
      'program_id', p_program_id,
      'completion', v_completion_percentage,
      'issued_at', now()
    )
  );
END;
$$;

-- Create function to calculate mentor reputation
CREATE OR REPLACE FUNCTION public.calculate_mentor_reputation(
  p_mentor_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_base_score INTEGER := 100;
  v_completion_bonus INTEGER;
  v_feedback_score INTEGER;
  v_badge_multiplier FLOAT;
BEGIN
  -- Calculate completion bonus
  SELECT COUNT(*) * 10 INTO v_completion_bonus
  FROM mentorship_programs mp
  JOIN mentorship_progress mpr ON mp.id = mpr.program_id
  WHERE mp.mentor_id = p_mentor_id
  AND mpr.status = 'completed';
  
  -- Calculate feedback score
  SELECT COALESCE(AVG((feedback->>'rating')::INTEGER), 0)::INTEGER INTO v_feedback_score
  FROM mentorship_sessions
  WHERE program_id IN (
    SELECT id FROM mentorship_programs WHERE mentor_id = p_mentor_id
  );
  
  -- Calculate badge multiplier
  SELECT 1 + (COUNT(*) * 0.1) INTO v_badge_multiplier
  FROM badge_issuance
  WHERE issuer_id = p_mentor_id;
  
  -- Combine scores
  RETURN ((v_base_score + v_completion_bonus + v_feedback_score) * v_badge_multiplier)::INTEGER;
END;
$$;

-- Enable RLS
ALTER TABLE public.mentorship_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_badges ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Mentors can manage their programs"
  ON public.mentorship_programs FOR ALL
  USING (mentor_id IN (
    SELECT id FROM profiles WHERE uid = auth.uid()
  ));

CREATE POLICY "Users can view active programs"
  ON public.mentorship_programs FOR SELECT
  USING (status = 'active');

CREATE POLICY "Users can view their sessions"
  ON public.mentorship_sessions FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM mentorship_programs WHERE mentor_id IN (
        SELECT id FROM profiles WHERE uid = auth.uid()
      )
    )
    OR
    mentee_id IN (
      SELECT id FROM profiles WHERE uid = auth.uid()
    )
  );

CREATE POLICY "Users can view their progress"
  ON public.mentorship_progress FOR SELECT
  USING (
    program_id IN (
      SELECT id FROM mentorship_programs WHERE mentor_id IN (
        SELECT id FROM profiles WHERE uid = auth.uid()
      )
    )
    OR
    mentee_id IN (
      SELECT id FROM profiles WHERE uid = auth.uid()
    )
  );

CREATE POLICY "Everyone can view badges"
  ON public.mentorship_badges FOR SELECT
  USING (true);