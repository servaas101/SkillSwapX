/*
  # Create profiles table with proper constraints

  1. New Tables
    - Ensure profiles table exists with correct columns and constraints
    - Add proper foreign key relationship to auth.users
    
  2. Security
    - Enable RLS on profiles table
    - Add policies for user access control
    
  3. Changes
    - Drop existing conflicting constraints if any
    - Add new unique constraint on uid
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

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS profiles_uid_idx ON profiles(uid);

-- Create function to handle new user creation
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

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();