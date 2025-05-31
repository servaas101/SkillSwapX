/*
  # Add mentor statistics function and fix table relationships

  1. New Functions
    - `get_mentor_stats`: Returns aggregated statistics for a mentor including:
      - Number of badges issued
      - Total mentees
      - Average rating
      - Years of experience
      - Completed mentorships
      - Validation percentage
      - Reputation score

  2. Changes
    - Add function to calculate mentor statistics
    - Ensure proper table relationships for user profiles
*/

-- Create function to get mentor statistics
CREATE OR REPLACE FUNCTION public.get_mentor_stats(p_uid UUID)
RETURNS JSON AS $$
DECLARE
  v_profile_id UUID;
  v_stats JSON;
BEGIN
  -- Get profile ID for the user
  SELECT id INTO v_profile_id FROM profiles WHERE uid = p_uid;

  -- Calculate statistics
  SELECT json_build_object(
    'badges', (
      SELECT COUNT(*)
      FROM user_badges
      WHERE iss = v_profile_id
    ),
    'mentees', (
      SELECT COUNT(DISTINCT uid)
      FROM matches
      WHERE mid = p_uid
    ),
    'rating', COALESCE((
      SELECT AVG(rating)::NUMERIC(10,2)
      FROM testimonials
      WHERE mentor_id = p_uid
    ), 0),
    'experience', COALESCE((
      SELECT EXTRACT(YEAR FROM age(now(), MIN(cdt)))
      FROM matches
      WHERE mid = p_uid
    ), 0),
    'completed', (
      SELECT COUNT(*)
      FROM matches
      WHERE mid = p_uid AND sts = 'completed'
    ),
    'validation', COALESCE((
      SELECT ROUND((COUNT(CASE WHEN sts = 'completed' THEN 1 END)::NUMERIC / 
             NULLIF(COUNT(*), 0) * 100))
      FROM matches
      WHERE mid = p_uid
    ), 0),
    'reputation', COALESCE((
      SELECT COUNT(*) * 10 + 
             COUNT(CASE WHEN sts = 'completed' THEN 1 END) * 20
      FROM matches
      WHERE mid = p_uid
    ), 0)
  ) INTO v_stats;

  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;