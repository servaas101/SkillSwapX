/*
  # Fix blog posts relationship and add demo content

  1. Changes
    - Update blog posts query to join with profiles table
    - Add demo blog posts with proper relationships
    - Enable RLS on blog_posts table
    - Add policies for blog posts

  2. Security
    - Enable RLS on blog_posts table
    - Add policy for public to read published posts
    - Add policy for authors to manage their own posts
*/

-- First ensure we have some demo profiles to reference
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE em = 'demo.author@skillswapx.com'
  ) THEN
    INSERT INTO public.profiles (uid, em, fn, ln, bio)
    VALUES (
      gen_random_uuid(),
      'demo.author@skillswapx.com',
      'Sarah',
      'Johnson',
      'Senior Software Engineer and Technical Writer'
    );
  END IF;
END $$;

-- Add some demo blog posts
INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  author_id,
  published_at,
  status,
  tags
) 
SELECT 
  'Getting Started with Skill Sharing',
  'getting-started-with-skill-sharing',
  'Learn how to make the most of our skill sharing platform and connect with mentors.',
  'Welcome to SkillSwapX! In this guide, we''ll walk you through the essential features of our platform and show you how to get started with skill sharing.

Our platform is designed to connect learners with experienced mentors across various technical disciplines. Whether you''re looking to improve your coding skills, learn about system design, or dive into new technologies, you''ll find a supportive community here.

Key features to explore:
1. Skill Assessment: Evaluate your current skill level
2. Mentor Matching: Find the perfect mentor for your learning journey
3. Progress Tracking: Monitor your growth and achievements
4. Community Engagement: Connect with peers and share experiences

Start your learning journey today by completing your profile and exploring available mentorship opportunities.',
  (SELECT uid FROM public.profiles WHERE em = 'demo.author@skillswapx.com'),
  NOW() - INTERVAL '2 days',
  'published',
  ARRAY['getting started', 'mentorship', 'learning']
WHERE NOT EXISTS (
  SELECT 1 FROM public.blog_posts 
  WHERE slug = 'getting-started-with-skill-sharing'
);

INSERT INTO public.blog_posts (
  title,
  slug,
  excerpt,
  content,
  author_id,
  published_at,
  status,
  tags
)
SELECT
  'Best Practices for Technical Mentorship',
  'best-practices-for-technical-mentorship',
  'Discover proven strategies for effective technical mentorship and skill development.',
  'Effective technical mentorship is crucial for professional development in the tech industry. This post explores best practices for both mentors and mentees.

As a mentor, your role goes beyond simply sharing technical knowledge. You''re a guide, helping others navigate their career path and develop essential skills. Here are some key principles for effective mentorship:

1. Set Clear Expectations
- Define goals and objectives
- Establish regular meeting schedules
- Agree on communication channels

2. Foster Active Learning
- Encourage hands-on practice
- Provide constructive feedback
- Create learning opportunities

3. Build Trust and Rapport
- Listen actively
- Show empathy
- Maintain professional boundaries

Remember, successful mentorship is a two-way street. Both parties should be committed to the process and open to learning from each other.',
  (SELECT uid FROM public.profiles WHERE em = 'demo.author@skillswapx.com'),
  NOW() - INTERVAL '1 day',
  'published',
  ARRAY['mentorship', 'best practices', 'learning']
WHERE NOT EXISTS (
  SELECT 1 FROM public.blog_posts 
  WHERE slug = 'best-practices-for-technical-mentorship'
);

-- Update the blog posts query to join with profiles
CREATE OR REPLACE VIEW public.blog_posts_with_authors AS
SELECT 
  bp.*,
  p.fn,
  p.ln
FROM public.blog_posts bp
LEFT JOIN public.profiles p ON bp.author_id = p.uid;

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Public can read published blog posts"
ON public.blog_posts
FOR SELECT
TO public
USING (status = 'published');

CREATE POLICY "Authors can manage own posts"
ON public.blog_posts
FOR ALL
TO authenticated
USING (author_id = auth.uid())
WITH CHECK (author_id = auth.uid());