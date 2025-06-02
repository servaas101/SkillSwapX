/*
  # Fix Permissions and Add Demo Data

  1. Changes
    - Add missing foreign key constraint for blog_posts.author_id
    - Update RLS policies for blog_posts and career_postings
    - Add demo data for testing

  2. Security
    - Enable RLS on all tables
    - Add policies for public and authenticated access
    - Ensure proper data isolation
*/

-- Fix blog_posts foreign key relationship
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_author_id_fkey 
    FOREIGN KEY (author_id) 
    REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update RLS policies for blog_posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read published blog posts" ON blog_posts;
CREATE POLICY "Public can read published blog posts"
ON blog_posts
FOR SELECT
TO public
USING (status = 'published');

DROP POLICY IF EXISTS "Authors can manage own posts" ON blog_posts;
CREATE POLICY "Authors can manage own posts"
ON blog_posts
FOR ALL
TO authenticated
USING (author_id = auth.uid());

-- Update RLS policies for career_postings
ALTER TABLE career_postings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read open positions" ON career_postings;
CREATE POLICY "Public can read open positions"
ON career_postings
FOR SELECT
TO public
USING (status = 'open');

DROP POLICY IF EXISTS "Admins can manage career postings" ON career_postings;
CREATE POLICY "Admins can manage career postings"
ON career_postings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.role = 'admin'
  )
);

-- Insert demo data
INSERT INTO blog_posts (
  title,
  slug,
  content,
  excerpt,
  status,
  published_at,
  tags
) VALUES (
  'Welcome to SkillSwapX',
  'welcome-to-skillswapx',
  'Welcome to SkillSwapX! Our platform helps professionals own and manage their career data.\n\nWe believe your skills, achievements, and professional journey should belong to you forever.',
  'Learn about our mission to revolutionize career data ownership.',
  'published',
  NOW(),
  ARRAY['announcement', 'platform']
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO career_postings (
  title,
  slug,
  description,
  requirements,
  location,
  type,
  department,
  status
) VALUES (
  'Senior Full Stack Developer',
  'senior-full-stack-developer',
  'Join our engineering team to build the future of professional development.',
  ARRAY[
    '5+ years experience with React and TypeScript',
    'Strong knowledge of PostgreSQL and RESTful APIs',
    'Experience with cloud infrastructure',
    'Passion for data privacy and security'
  ],
  'Remote',
  'Full-time',
  'Engineering',
  'open'
) ON CONFLICT (slug) DO NOTHING;