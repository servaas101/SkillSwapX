import { Briefcase, MapPin, Clock, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sb } from '../lib/supabase';

type CareerPosting = {
  id: string;
  title: string;
  slug: string;
  description: string;
  department: string;
  location: string;
  type: string;
  requirements: string[];
};

export function Careers() {
  const [positions, setPositions] = useState<CareerPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPositions = async () => {
      try {
        const { data, error } = await sb
          .from('career_postings')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPositions(data || []);
      } catch (e) {
        console.error('Failed to load career postings:', e);
        setError('Failed to load open positions');
      } finally {
        setLoading(false);
      }
    };

    loadPositions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Join Our Team</h1>
        <p className="mt-1 text-gray-500">
          Help us build the future of professional development
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
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="divide-y divide-gray-200">
            {positions.map((position, index) => (
              <div key={index} className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {position.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Briefcase className="mr-1.5 h-4 w-4" />
                        {position.department}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1.5 h-4 w-4" />
                        {position.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {position.type}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/careers/${position.slug}`}
                    className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                  >
                    Apply Now
                  </Link>
                </div>
                <p className="mt-4 text-sm text-gray-600">{position.description}</p>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {position.requirements.map((req, i) => (
                      <li key={i} className="text-sm text-gray-600">{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>)}
    </div>
  );
}