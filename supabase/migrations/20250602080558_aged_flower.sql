/*
  # Skills Table Setup

  1. New Tables
    - skills: User skills and proficiency
      - id (uuid, primary key)
      - uid (user ID reference)
      - skill_name (text)
      - proficiency_level (integer)
      - years_experience (integer)
      - category (text)
      - created_at (timestamp)
      - updated_at (timestamp)

  2. Security
    - Enable RLS on skills table
    - Add policies for authenticated users
    - Add unique constraint for user-skill pairs
*/

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  skill_name text NOT NULL,
  proficiency_level integer NOT NULL DEFAULT 1,
  years_experience integer NOT NULL DEFAULT 0,
  category text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_skill UNIQUE (uid, skill_name)
);

-- Enable RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read all skills"
  ON skills FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own skills"
  ON skills FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can delete own skills"
  ON skills FOR DELETE
  TO authenticated
  USING (auth.uid() = uid);

-- Create function for upserting skills
CREATE OR REPLACE FUNCTION upsert_skill(
  p_skill_name text,
  p_level integer DEFAULT 1,
  p_years integer DEFAULT 0,
  p_category text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skill skills;
BEGIN
  -- Validate input
  IF p_level < 1 OR p_level > 5 THEN
    RAISE EXCEPTION 'Invalid skill level: must be between 1 and 5';
  END IF;

  -- Attempt upsert
  INSERT INTO skills (
    uid,
    skill_name,
    proficiency_level,
    years_experience,
    category,
    updated_at
  )
  VALUES (
    auth.uid(),
    p_skill_name,
    p_level,
    p_years,
    p_category,
    now()
  )
  ON CONFLICT (uid, skill_name)
  DO UPDATE SET
    proficiency_level = EXCLUDED.proficiency_level,
    years_experience = EXCLUDED.years_experience,
    category = EXCLUDED.category,
    updated_at = EXCLUDED.updated_at
  RETURNING * INTO v_skill;

  -- Log skill update
  PERFORM log_auth_event(
    'skill_update',
    jsonb_build_object(
      'skill', p_skill_name,
      'level', p_level,
      'years', p_years
    )
  );

  RETURN jsonb_build_object(
    'id', v_skill.id,
    'skill_name', v_skill.skill_name,
    'level', v_skill.proficiency_level,
    'updated_at', v_skill.updated_at
  );
END;
$$;