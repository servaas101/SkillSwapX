import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { 
  Users, Award, Clock, ChevronRight, Star,
  BookOpen, Target, AlertTriangle, Check, X 
} from 'lucide-react';
import { format } from 'date-fns';
import { sb } from '../lib/supabase';
import { bc } from '../lib/blockchain';

type MenteeRequest = {
  id: string;
  uid: string;
  name: string;
  goals: string[];
  duration: number;
  status: string;
  created_at: string;
};

type ActiveMentorship = {
  id: string;
  mentee: {
    id: string;
    name: string;
    progress: number;
    next_milestone: string;
  };
  start_date: string;
  duration: number;
  status: string;
};

export function MentorshipManagement() {
  const { usr } = useAuthContext();
  const nav = useNavigate();
  
  const [requests, setRequests] = useState<MenteeRequest[]>([]);
  const [active, setActive] = useState<ActiveMentorship[]>([]);
  const [stats, setStats] = useState({
    completed: 0,
    rating: 0,
    validation: 0,
    reputation: 0
  });
  const [ldg, setLdg] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!usr) {
      nav('/signin');
      return;
    }

    const loadData = async () => {
      try {
        const [requestsData, activeData, statsData] = await Promise.all([
          sb.from('matches')
            .select(`
              id,
              uid,
              profiles:profiles(fn, ln),
              gls,
              dur,
              sts,
              cdt
            `)
            .eq('mid', usr.id)
            .eq('sts', 'pending'),
            
          sb.from('matches')
            .select(`
              id,
              mentee:profiles!matches_uid_fkey(id, fn, ln),
              str,
              dur,
              sts,
              progress:match_progress(*)
            `)
            .eq('mid', usr.id)
            .eq('sts', 'active'),
            
          sb.rpc('get_mentor_stats', { p_uid: usr.id })
        ]);

        if (requestsData.error) throw requestsData.error;
        if (activeData.error) throw activeData.error;
        if (statsData.error) throw statsData.error;

        // Transform requests data
        const formattedRequests = requestsData.data.map((r: any) => ({
          id: r.id,
          uid: r.uid,
          name: `${r.profiles.fn} ${r.profiles.ln}`,
          goals: r.gls,
          duration: r.dur,
          status: r.sts,
          created_at: r.cdt
        }));

        // Transform active mentorships data
        const formattedActive = activeData.data.map((m: any) => ({
          id: m.id,
          mentee: {
            id: m.mentee.id,
            name: `${m.mentee.fn} ${m.mentee.ln}`,
            progress: m.progress?.percentage || 0,
            next_milestone: m.progress?.next_milestone || 'No milestone set'
          },
          start_date: m.str,
          duration: m.dur,
          status: m.sts
        }));

        setRequests(formattedRequests);
        setActive(formattedActive);
        setStats(statsData.data);
      } catch (e: any) {
        console.error('Failed to load mentorship data:', e);
        setErr(e.message);
      } finally {
        setLdg(false);
      }
    };

    loadData();
  }, [usr, nav]);

  const handleRequest = async (id: string, accept: boolean) => {
    setLdg(true);
    setErr('');

    try {
      const { error } = await sb.rpc('update_match_status', {
        p_id: id,
        p_sts: accept ? 'active' : 'rejected'
      });

      if (error) throw error;

      // Update local state
      setRequests(requests.filter(r => r.id !== id));
      
      if (accept) {
        const request = requests.find(r => r.id === id);
        if (request) {
          setActive([...active, {
            id: request.id,
            mentee: {
              id: request.uid,
              name: request.name,
              progress: 0,
              next_milestone: 'Initial Assessment'
            },
            start_date: new Date().toISOString(),
            duration: request.duration,
            status: 'active'
          }]);
        }
      }
    } catch (e: any) {
      console.error('Failed to update request:', e);
      setErr(e.message);
    } finally {
      setLdg(false);
    }
  };

  const issueBadge = async (menteeId: string, badgeType: string) => {
    setLdg(true);
    setErr('');

    try {
      // Create badge metadata
      const metadata = {
        type: badgeType,
        issuer: usr?.id,
        issuedAt: new Date().toISOString(),
        skills: ['Cloud Architecture', 'System Design'],
        endorsement: 'Successfully completed mentorship program'
      };

      // Store metadata and get IPFS URI
      const uri = await bc.store(metadata);

      // Mint badge NFT
      const { error } = await sb.rpc('issue_badge', {
        p_uid: menteeId,
        p_bid: uri,
        p_prf: metadata
      });

      if (error) throw error;

      // Update mentorship status
      await sb.rpc('update_match_status', {
        p_id: active.find(m => m.mentee.id === menteeId)?.id,
        p_sts: 'completed'
      });

      // Update local state
      setActive(active.filter(m => m.mentee.id !== menteeId));
      setStats({
        ...stats,
        completed: stats.completed + 1,
        validation: Math.round(((stats.completed + 1) / (stats.completed + 2)) * 100)
      });
    } catch (e: any) {
      console.error('Failed to issue badge:', e);
      setErr(e.message);
    } finally {
      setLdg(false);
    }
  };

  if (!usr) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentorship Management</h1>
            <p className="mt-1 text-gray-500">
              Review mentee requests and manage active mentorships
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-medium text-blue-800">
              <Star className="mr-1 h-4 w-4" />
              {stats.reputation} Reputation
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 text-green-600">
              <Check className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100 text-yellow-600">
              <Star className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Rating</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.rating}/5</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 text-blue-600">
              <Award className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Validation</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.validation}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <Target className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Reputation</h3>
              <p className="text-2xl font-bold text-gray-700">{stats.reputation}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mentee Requests */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Mentee Requests</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : requests.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {requests.map(request => (
              <div key={request.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{request.name}</h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {request.duration} months
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="mr-1.5 h-4 w-4" />
                        {request.goals.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRequest(request.id, true)}
                      disabled={ldg}
                      className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Accept
                    </button>
                    <button
                      onClick={() => handleRequest(request.id, false)}
                      disabled={ldg}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No pending mentee requests
          </div>
        )}
      </div>

      {/* Active Mentorships */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Mentorships</h2>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : active.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {active.map(mentorship => (
              <div key={mentorship.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {mentorship.mentee.name}
                    </h3>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        Started {format(new Date(mentorship.start_date), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center">
                        <Target className="mr-1.5 h-4 w-4" />
                        {mentorship.mentee.next_milestone}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        {mentorship.mentee.progress}%
                      </div>
                      <p className="text-sm text-gray-500">Progress</p>
                    </div>
                    <button
                      onClick={() => issueBadge(mentorship.mentee.id, 'completion')}
                      disabled={ldg || mentorship.mentee.progress < 100}
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Issue Badge
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <div className="w-full">
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span className="text-gray-900">Progress</span>
                        <span className="text-gray-500">{mentorship.mentee.progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{ width: `${mentorship.mentee.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No active mentorships
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