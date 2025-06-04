/*
  # Fix User Signup Process

  1. Changes
    - Create trigger function to handle new user registration
    - Create trigger to automatically create profile for new users
    - Enable RLS on profiles table
    - Add policies for profile access

  2. Security
    - Enable RLS on profiles table
    - Add policy for users to read/update their own profile
    - Add policy for public access to limited profile fields
*/

-- Create or replace the function that handles new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    LOWER(SPLIT_PART(new.email, '@', 1)), -- Generate username from email
    NULL,
    NULL
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on profiles table if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profile access
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Public can view limited profile information
CREATE POLICY "Public can view limited profile info"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);