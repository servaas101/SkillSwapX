import { Calendar, User, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const posts = [
  {
    title: 'The Future of Professional Development',
    excerpt: 'How blockchain and AI are transforming career progression.',
    author: 'Sarah Chen',
    date: new Date('2024-02-15'),
    category: 'Technology'
  },
  {
    title: 'Building a Data-Driven Career',
    excerpt: 'Leveraging analytics for better career decisions.',
    author: 'Michael Rodriguez',
    date: new Date('2024-02-10'),
    category: 'Career Growth'
  },
  {
    title: 'The Rise of Skill-Based Hiring',
    excerpt: 'Why companies are moving beyond traditional credentials.',
    author: 'Alex Thompson',
    date: new Date('2024-02-05'),
    category: 'Industry Trends'
  }
];

export function Blog() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <p className="mt-1 text-gray-500">
          Insights and updates from the SkillSwapX team
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <div key={index} className="bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
              <div>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {post.category}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                <p className="mt-2 text-gray-600">{post.excerpt}</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="mr-1.5 h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1.5 h-4 w-4" />
                    {format(post.date, 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500">
                  Read more
                  <ArrowRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}