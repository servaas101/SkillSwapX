/*
  # Initial Schema Setup

  1. Tables
    - profiles: User profile information
      - id (uuid, primary key)
      - uid (references auth.users)
      - em (email)
      - fn (first name)
      - ln (last name)
      - bio (biography)
      - img (profile image URL)
      - ph (phone)
      - loc (location)
      - cdt (created date)
      - udt (updated date)
      - set (settings JSON)
      - gdp (GDPR consent flag)
      - gdl (GDPR consent date)

    - consent_logs: GDPR compliance logs
      - id (uuid, primary key)
      - uid (user ID)
      - typ (type of consent action)
      - dat (JSON data about consent)
      - ts (timestamp)
      - ip (IP address)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Drop existing tables if any exist
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS consent_logs CASCADE;

-- Create profiles table
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users NOT NULL,
  em text,
  fn text,
  ln text,
  bio text,
  img text,
  ph text,
  loc text,
  cdt timestamptz DEFAULT now(),
  udt timestamptz DEFAULT now(),
  set jsonb,
  gdp boolean DEFAULT false,
  gdl timestamptz,
  UNIQUE(uid)
);

-- Create consent_logs table
CREATE TABLE consent_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid REFERENCES auth.users NOT NULL,
  typ text NOT NULL,
  dat jsonb NOT NULL,
  ts timestamptz DEFAULT now(),
  ip text
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid);

-- Create policies for consent_logs
CREATE POLICY "Users can view own consent logs"
  ON consent_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can create own consent logs"
  ON consent_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uid);

-- Create indexes
CREATE INDEX profiles_uid_idx ON profiles(uid);
CREATE INDEX consent_logs_uid_idx ON consent_logs(uid);
CREATE INDEX consent_logs_ts_idx ON consent_logs(ts);

-- Create functions
CREATE OR REPLACE FUNCTION log_consent(
  p_uid uuid,
  p_typ text,
  p_dat jsonb,
  p_ip text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO consent_logs (uid, typ, dat, ip)
  VALUES (p_uid, p_typ, p_dat, p_ip)
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;