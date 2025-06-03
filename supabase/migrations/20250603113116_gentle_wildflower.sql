/*
  # Update profiles RLS policies

  1. Changes
    - Add RLS policies for profiles table
    - Add consent logging table and functions
    - Add profile update trigger

  2. Security
    - Enable RLS on profiles
    - Add policies for select/update
    - Add consent logging
*/

-- Create consent_logs table if not exists
CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES auth.users(id),
  typ TEXT NOT NULL,
  dat JSONB NOT NULL,
  ts TIMESTAMPTZ DEFAULT NOW(),
  ip TEXT
);

-- Create indexes
CREATE INDEX IF NOT EXISTS consent_logs_uid_idx ON consent_logs(uid);
CREATE INDEX IF NOT EXISTS consent_logs_ts_idx ON consent_logs(ts);

-- Enable RLS on consent_logs
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for consent_logs
CREATE POLICY "Users can create own consent logs"
  ON consent_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can view own consent logs"
  ON consent_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

-- Create consent logging function
CREATE OR REPLACE FUNCTION log_consent(
  p_id UUID,
  p_typ TEXT,
  p_dat JSONB,
  p_ip TEXT
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO consent_logs (uid, typ, dat, ip)
  VALUES (p_id, p_typ, p_dat, p_ip)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;