import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { sb } from '../lib/supabase';

type BlogPost = {
  id: string;
  title: string;
  content: string;
  author: {
    fn: string;
    ln: string;
  };
  published_at: string;
  tags: string[];
};

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        const { data, error } = await sb
          .from('blog_posts')
          .select(`
            id,
            title,
            content,
            published_at,
            tags,
            author:author_id(fn, ln)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (error) throw error;
        setPost(data);
      } catch (e) {
        console.error('Failed to load blog post:', e);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error || 'Post not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <button
          onClick={() => navigate('/blog')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Blog
        </button>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
          
          <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <User className="mr-1.5 h-4 w-4" />
              {post.author.fn} {post.author.ln}
            </div>
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-4 w-4" />
              {format(new Date(post.published_at), 'MMM d, yyyy')}
            </div>
          </div>

          {post.tags?.length > 0 && (
            <div className="mt-4 flex space-x-2">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="prose max-w-none">
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}