/*
  # Add Users and Policies

  1. New Tables
    - `users` table with basic fields and role management
  
  2. Security
    - Enable RLS on career_postings and blog_posts
    - Add policies for public viewing and admin management
    - Ensure policies don't conflict with existing ones
  
  3. Demo Data
    - Add demo admin user
    - Create initial blog post
    - Add sample career posting
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on career_postings if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'career_postings' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE career_postings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add RLS policies for career_postings
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'career_postings' 
    AND policyname = 'Anyone can view open positions'
  ) THEN
    CREATE POLICY "Anyone can view open positions"
    ON career_postings
    FOR SELECT
    TO public
    USING (status = 'open');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'career_postings' 
    AND policyname = 'Admins can manage career postings'
  ) THEN
    CREATE POLICY "Admins can manage career postings"
    ON career_postings
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'admin'
      )
    );
  END IF;
END $$;

-- Enable RLS on blog_posts if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'blog_posts' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Add RLS policies for blog_posts
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Anyone can view published posts'
  ) THEN
    CREATE POLICY "Anyone can view published posts"
    ON blog_posts
    FOR SELECT
    TO public
    USING (status = 'published');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'blog_posts' 
    AND policyname = 'Authors can manage own posts'
  ) THEN
    CREATE POLICY "Authors can manage own posts"
    ON blog_posts
    FOR ALL
    TO authenticated
    USING (author_id = auth.uid());
  END IF;
END $$;

-- Insert demo data
INSERT INTO users (id, email, role)
VALUES 
  ('00000000-0000-0000-0000-000000000000', 'demo@skillswapx.com', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO blog_posts (
  title, 
  slug, 
  excerpt,
  content,
  author_id,
  published_at,
  status,
  tags
) VALUES (
  'Welcome to SkillSwapX',
  'welcome-to-skillswapx',
  'Learn about our platform and how it can help you grow professionally.',
  'Welcome to SkillSwapX! Our platform is designed to help professionals connect, learn, and grow together.\n\nWe believe in the power of skill sharing and mentorship to accelerate career growth and foster innovation.\n\nStay tuned for more updates and features!',
  '00000000-0000-0000-0000-000000000000',
  NOW(),
  'published',
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
  'Join our engineering team to build the future of professional development and skill sharing.',
  ARRAY[
    'Minimum 5 years of experience with modern web technologies',
    'Strong knowledge of React, Node.js, and TypeScript',
    'Experience with PostgreSQL and RESTful APIs',
    'Excellent problem-solving and communication skills'
  ],
  'Remote',
  'Full-time',
  'Engineering',
  'open'
) ON CONFLICT (slug) DO NOTHING;