import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowLeft, Loader2 } from 'lucide-react';
import { sb } from '../lib/supabase';

type CareerPosting = {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  type: string;
  requirements: string[];
};

export function CareerPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [posting, setPosting] = useState<CareerPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPosting = async () => {
      try {
        const { data, error } = await sb
          .from('career_postings')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'open')
          .single();

        if (error) throw error;
        setPosting(data);
      } catch (e) {
        console.error('Failed to load career posting:', e);
        setError('Failed to load position details');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      loadPosting();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !posting) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <p className="text-sm text-red-700">{error || 'Position not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <button
          onClick={() => navigate('/careers')}
          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Careers
        </button>

        <div className="mt-4">
          <h1 className="text-3xl font-bold text-gray-900">{posting.title}</h1>
          
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Briefcase className="mr-1.5 h-4 w-4" />
              {posting.department}
            </div>
            <div className="flex items-center">
              <MapPin className="mr-1.5 h-4 w-4" />
              {posting.location}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1.5 h-4 w-4" />
              {posting.type}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="prose max-w-none">
          <h2 className="text-xl font-bold text-gray-900">About the Role</h2>
          {posting.description.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-600">
              {paragraph}
            </p>
          ))}

          <h2 className="mt-8 text-xl font-bold text-gray-900">Requirements</h2>
          <ul className="mt-4 space-y-2">
            {posting.requirements.map((requirement, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2 mt-1 flex h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></span>
                <span className="text-gray-600">{requirement}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Apply for this Position
          </button>
        </div>
      </div>
    </div>
  );
}