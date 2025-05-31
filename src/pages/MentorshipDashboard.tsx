import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { 
  Users, Award, Clock, ChevronRight, Star,
  BookOpen, Target, AlertTriangle, Check 
} from 'lucide-react';
import { format } from 'date-fns';
import { mtr } from '../lib/mentorship';

export function MentorshipDashboard() {
  const { usr } = useAuthContext();
  const nav = useNavigate();
  
  const [stats, setStats] = useState({
    reputation: 0,
    mentees: 0,
    sessions: 0,
    badges: 0
  });
  const [programs, setPrograms] = useState<any[]>([]);
  const [ldg, setLdg] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!usr) {
      nav('/signin');
      return;
    }

    const loadData = async () => {
      try {
        // Get mentor profile ID
        const { data: profile } = await sb
          .from('profiles')
          .select('id')
          .eq('uid', usr.id)
          .single();

        if (!profile) throw new Error('Profile not found');

        // Load mentor data
        const [mentorStats, mentorPrograms] = await Promise.all([
          mtr.getMentorStats(profile.id),
          mtr.getPrograms(profile.id)
        ]);

        setStats(mentorStats);
        setPrograms(mentorPrograms);
      } catch (e: any) {
        console.error('Failed to load mentor data:', e);
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentorship Dashboard</h1>
            <p className="mt-1 text-gray-500">
              Track your mentorship programs and mentee progress
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
              <Star className="mr-1 h-4 w-4" />
              {stats.reputation} Reputation
            </span>
            <button
              onClick={() => nav('/mentorship/new')}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Create Program
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Active Mentees</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.mentees}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 text-green-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Sessions</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.sessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <Award className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Badges Issued</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.badges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100 text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Reputation</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.reputation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Programs */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Programs</h2>
            <BookOpen className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : programs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {programs.map(program => (
              <div key={program.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {program.title}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="mr-1.5 h-4 w-4" />
                        {program.sessions.length}/{program.capacity} Mentees
                      </div>
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {program.duration} months
                      </div>
                      <div className="flex items-center">
                        <Target className="mr-1.5 h-4 w-4" />
                        {program.skills.join(', ')}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => nav(`/mentorship/programs/${program.id}`)}
                    className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View Details
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </button>
                </div>

                {program.sessions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Recent Sessions</h4>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {program.sessions.slice(0, 2).map((session: any) => (
                        <div
                          key={session.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
                        >
                          <div className="flex items-center">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {session.mentee.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {format(new Date(session.scheduled_at), 'MMM d, h:mm a')}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            session.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {program.progress.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Milestone Progress</h4>
                    <div className="mt-2">
                      {program.progress.map((milestone: any) => (
                        <div
                          key={milestone.id}
                          className="flex items-center space-x-2 text-sm"
                        >
                          <Check className={`h-4 w-4 ${
                            milestone.status === 'completed'
                              ? 'text-green-500'
                              : 'text-gray-300'
                          }`} />
                          <span className={milestone.status === 'completed' ? 'text-gray-900' : 'text-gray-500'}>
                            {milestone.milestone}
                          </span>
                          {milestone.completed_at && (
                            <span className="text-gray-500">
                              • Completed {format(new Date(milestone.completed_at), 'MMM d')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No active mentorship programs
          </div>
        )}
      </div>

      {err && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{err}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}