/*
  # Initial Schema Setup
  
  1. Tables
    - profiles: Core user profile data
    - user_roles: User role assignments
    - skills: Available skills
    - user_skills: User skill mappings
    - badges: Achievement badges
    - user_badges: User badge awards
  
  2. Security
    - RLS policies for each table
    - Automatic profile creation trigger
    - Role-based access control
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'employee'::text,
  gdpr_consent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Profile updated trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();

-- Auto-create profile trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Skills table
CREATE TABLE public.skills (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  category text,
  created_at timestamptz DEFAULT now()
);

-- User skills table
CREATE TABLE public.user_skills (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id uuid REFERENCES public.skills(id) ON DELETE CASCADE,
  level integer CHECK (level BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- Badges table
CREATE TABLE public.badges (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- User badges table
CREATE TABLE public.user_badges (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id uuid REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- RLS Policies

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Skills policies
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Skills are viewable by everyone"
  ON public.skills FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify skills"
  ON public.skills FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- User skills policies
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User skills are viewable by everyone"
  ON public.user_skills FOR SELECT
  USING (true);

CREATE POLICY "Users can manage own skills"
  ON public.user_skills FOR ALL
  USING (auth.uid() = user_id);

-- Badges policies
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can modify badges"
  ON public.badges FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- User badges policies
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "Only admins can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );