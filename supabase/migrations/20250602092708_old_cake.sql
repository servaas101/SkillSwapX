/*
  # Blog and Careers Schema

  1. New Tables
    - blog_posts
      - id (uuid, primary key)
      - title (text)
      - slug (text, unique)
      - content (text)
      - excerpt (text)
      - author_id (uuid, references users)
      - published_at (timestamptz)
      - created_at (timestamptz)
      - updated_at (timestamptz)
      - status (text)
      - tags (text[])
      - metadata (jsonb)

    - career_postings
      - id (uuid, primary key)
      - title (text)
      - slug (text, unique)
      - description (text)
      - requirements (text[])
      - location (text)
      - type (text)
      - department (text)
      - status (text)
      - created_at (timestamptz)
      - updated_at (timestamptz)
      - metadata (jsonb)

  2. Security
    - Enable RLS
    - Public read access
    - Write access for authenticated admins
*/

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'draft',
  tags text[],
  metadata jsonb,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'archived'))
);

-- Create career_postings table
CREATE TABLE IF NOT EXISTS career_postings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  requirements text[] NOT NULL,
  location text NOT NULL,
  type text NOT NULL,
  department text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb,
  CONSTRAINT valid_status CHECK (status IN ('open', 'closed', 'draft'))
);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_postings ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts
CREATE POLICY "Public can read published blog posts"
  ON blog_posts
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authors can CRUD own posts"
  ON blog_posts
  USING (author_id = auth.uid());

-- Create policies for career_postings
CREATE POLICY "Public can read open positions"
  ON career_postings
  FOR SELECT
  USING (status = 'open');

CREATE POLICY "Admins can manage career postings"
  ON career_postings
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX blog_posts_slug_idx ON blog_posts(slug);
CREATE INDEX blog_posts_published_at_idx ON blog_posts(published_at);
CREATE INDEX blog_posts_status_idx ON blog_posts(status);
CREATE INDEX career_postings_slug_idx ON career_postings(slug);
CREATE INDEX career_postings_status_idx ON career_postings(status);

-- Create functions for slug generation and validation
CREATE OR REPLACE FUNCTION generate_slug(title text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug text;
  final_slug text;
  counter integer := 1;
BEGIN
  -- Convert title to lowercase and replace spaces/special chars with hyphens
  base_slug := lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'));
  -- Remove leading/trailing hyphens
  base_slug := trim(both '-' from base_slug);
  
  -- Try the base slug first
  final_slug := base_slug;
  
  -- If slug exists, append numbers until we find a unique one
  WHILE EXISTS (
    SELECT 1 FROM blog_posts WHERE slug = final_slug
    UNION
    SELECT 1 FROM career_postings WHERE slug = final_slug
  ) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter::text;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- Create function to create blog post
CREATE OR REPLACE FUNCTION create_blog_post(
  p_title text,
  p_content text,
  p_excerpt text DEFAULT NULL,
  p_tags text[] DEFAULT NULL,
  p_status text DEFAULT 'draft',
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slug text;
  v_id uuid;
BEGIN
  -- Generate slug
  v_slug := generate_slug(p_title);
  
  -- Insert post
  INSERT INTO blog_posts (
    title,
    slug,
    content,
    excerpt,
    author_id,
    status,
    tags,
    metadata,
    published_at
  )
  VALUES (
    p_title,
    v_slug,
    p_content,
    p_excerpt,
    auth.uid(),
    p_status,
    p_tags,
    p_metadata,
    CASE WHEN p_status = 'published' THEN now() ELSE NULL END
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- Create function to create career posting
CREATE OR REPLACE FUNCTION create_career_posting(
  p_title text,
  p_description text,
  p_requirements text[],
  p_location text,
  p_type text,
  p_department text,
  p_status text DEFAULT 'draft',
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slug text;
  v_id uuid;
BEGIN
  -- Generate slug
  v_slug := generate_slug(p_title);
  
  -- Insert posting
  INSERT INTO career_postings (
    title,
    slug,
    description,
    requirements,
    location,
    type,
    department,
    status,
    metadata
  )
  VALUES (
    p_title,
    v_slug,
    p_description,
    p_requirements,
    p_location,
    p_type,
    p_department,
    p_status,
    p_metadata
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;