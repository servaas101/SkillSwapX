/*
  # Fix Profile Policies and Structure
  
  1. Changes
    - Add IF NOT EXISTS checks for policies
    - Ensure clean policy creation
    - Maintain existing table structure
  
  2. Security
    - Maintain RLS policies for profile access
    - Keep foreign key constraint to auth.users
*/

-- First ensure the table exists with correct structure
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid UNIQUE NOT NULL,
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
  CONSTRAINT profiles_uid_fkey FOREIGN KEY (uid) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies to ensure clean state
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Add RLS policies
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = uid);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (auth.uid() = uid);

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = uid);

-- Create index for faster lookups if not exists
CREATE INDEX IF NOT EXISTS profiles_uid_idx ON profiles(uid);

-- Create or replace function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (uid, em)
  VALUES (new.id, new.email)
  ON CONFLICT (uid) 
  DO UPDATE SET
    em = EXCLUDED.em,
    udt = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();