import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { 
  Award, Star, Users, BookOpen, ChevronRight, 
  Clock, Target, Check, DollarSign 
} from 'lucide-react';
import { format } from 'date-fns';
import { sb } from '../lib/supabase';

type Testimonial = {
  id: string;
  mentee: {
    name: string;
    title: string;
    company: string;
    image: string;
  };
  content: string;
  outcome: string;
  rating: number;
  date: string;
};

type ContentModule = {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: string;
  price: number;
  topics: string[];
};

export function MentorProfile() {
  const { usr } = useAuthContext();
  const nav = useNavigate();
  
  const [stats, setStats] = useState({
    badges: 0,
    mentees: 0,
    rating: 0,
    experience: 0
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [modules, setModules] = useState<ContentModule[]>([]);
  const [ldg, setLdg] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!usr) {
      nav('/signin');
      return;
    }

    const loadData = async () => {
      try {
        const [statsData, testimonialsData, modulesData] = await Promise.all([
          sb.rpc('get_mentor_stats', { p_uid: usr.id }),
          sb.from('testimonials')
            .select(`
              id,
              mentee:profiles(fn, ln, title, company, img),
              content,
              outcome,
              rating,
              created_at
            `)
            .eq('mentor_id', usr.id)
            .order('created_at', { ascending: false }),
          sb.from('content_modules')
            .select('*')
            .eq('author_id', usr.id)
            .order('created_at', { ascending: true })
        ]);

        if (statsData.error) throw statsData.error;
        if (testimonialsData.error) throw testimonialsData.error;
        if (modulesData.error) throw modulesData.error;

        setStats(statsData.data);
        setTestimonials(testimonialsData.data.map((t: any) => ({
          id: t.id,
          mentee: {
            name: `${t.mentee.fn} ${t.mentee.ln}`,
            title: t.mentee.title,
            company: t.mentee.company,
            image: t.mentee.img
          },
          content: t.content,
          outcome: t.outcome,
          rating: t.rating,
          date: t.created_at
        })));
        setModules(modulesData.data);
      } catch (e: any) {
        console.error('Failed to load mentor profile:', e);
        setErr(e.message);
      } finally {
        setLdg(false);
      }
    };

    loadData();
  }, [usr, nav]);

  if (!usr) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex items-center space-x-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100">
            <span className="text-3xl font-bold text-blue-600">
              {usr.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Enterprise API Expert</h1>
            <p className="mt-1 text-lg text-gray-500">
              Helping professionals master cloud architecture and system design
            </p>
            <div className="mt-2 flex items-center space-x-4">
              <span className="inline-flex items-center text-sm text-gray-500">
                <Star className="mr-1 h-4 w-4 text-yellow-400" />
                {stats.rating.toFixed(1)} Rating
              </span>
              <span className="inline-flex items-center text-sm text-gray-500">
                <Users className="mr-1 h-4 w-4" />
                {stats.mentees} Mentees
              </span>
              <span className="inline-flex items-center text-sm text-gray-500">
                <Award className="mr-1 h-4 w-4" />
                {stats.badges} Badges Issued
              </span>
              <span className="inline-flex items-center text-sm text-gray-500">
                <Clock className="mr-1 h-4 w-4" />
                {stats.experience}+ Years Experience
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Success Stories</h2>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {testimonial.mentee.image ? (
                      <img
                        src={testimonial.mentee.image}
                        alt={testimonial.mentee.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                        <span className="text-lg font-medium text-blue-600">
                          {testimonial.mentee.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {testimonial.mentee.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {testimonial.mentee.title} at {testimonial.mentee.company}
                        </p>
                      </div>
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < testimonial.rating
                                ? 'text-yellow-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-gray-600">{testimonial.content}</p>
                    </div>
                    <div className="mt-4 rounded-lg bg-green-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-400" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-800">
                            {testimonial.outcome}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No testimonials yet
          </div>
        )}
      </div>

      {/* Content Modules */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Learning Modules</h2>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : modules.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {modules.map(module => (
              <div key={module.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {module.title}
                    </h3>
                    <p className="mt-1 text-gray-600">{module.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="inline-flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {module.duration}
                      </span>
                      <span className="inline-flex items-center">
                        <Target className="mr-1.5 h-4 w-4" />
                        {module.level}
                      </span>
                      <span className="inline-flex items-center">
                        <DollarSign className="mr-1.5 h-4 w-4" />
                        ${module.price}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => nav(`/modules/${module.id}`)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {module.topics.map(topic => (
                      <span
                        key={topic}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No learning modules available
          </div>
        )}
      </div>
    </div>
  );
}