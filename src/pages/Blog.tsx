import { Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  fn: string;
  ln: string;
  published_at: string;
  tags: string[];
};

export function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const { data, error } = await sb
          .from('blog_posts_with_authors')
          .select()
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (e) {
        console.error('Failed to load blog posts:', e);
        setError('Failed to load blog posts');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <p className="mt-1 text-gray-500">
          Insights and updates from the SkillSwapX team
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <div key={index} className="bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
              {post.tags?.map(tag => (
                <span key={tag} className="mr-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {tag}
                </span>
              ))}
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                <p className="mt-2 text-gray-600">{post.excerpt}</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="mr-1.5 h-4 w-4" />
                    {post.fn} {post.ln}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {format(new Date(post.published_at), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to={`/blog/${post.slug}`}
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  Read more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>)}
    </div>
  );
}