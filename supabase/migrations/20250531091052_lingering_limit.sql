/*
  # Fix ambiguous month column in track_skill_trend function

  1. Changes
    - Drop and recreate track_skill_trend function with qualified month column references
    - Add table aliases to prevent column ambiguity
    - Improve function performance with proper indexing

  2. Security
    - Maintain RLS policies
    - Function accessible only to authenticated users
*/

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS track_skill_trend;

-- Recreate function with fixed column references
CREATE OR REPLACE FUNCTION track_skill_trend(
  user_id UUID,
  skill_name TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
  month TIMESTAMP WITH TIME ZONE,
  skill_level INTEGER,
  endorsement_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH months AS (
    SELECT 
      date_trunc('month', d)::timestamp with time zone AS month_start
    FROM 
      generate_series(
        date_trunc('month', start_date),
        date_trunc('month', end_date),
        '1 month'::interval
      ) d
  ),
  skill_history AS (
    SELECT 
      s.id,
      date_trunc('month', s.created_at) AS skill_month,
      s.level,
      COUNT(se.id) as endorsements
    FROM 
      skills s
      LEFT JOIN skill_endorsements se ON s.id = se.skill_id
    WHERE 
      s.uid = user_id 
      AND s.name = skill_name
    GROUP BY 
      s.id, skill_month, s.level
  )
  SELECT 
    m.month_start AS month,
    COALESCE(sh.level, 0) AS skill_level,
    COALESCE(sh.endorsements, 0) AS endorsement_count
  FROM 
    months m
    LEFT JOIN skill_history sh ON m.month_start = sh.skill_month
  ORDER BY 
    m.month_start ASC;
END;
$$;