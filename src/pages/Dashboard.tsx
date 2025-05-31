import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { Award, Briefcase, Users, Clock, ChevronRight, QrCode } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { sb } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Badge = Database['public']['Tables']['user_badges']['Row'] & {
  badges?: Database['public']['Tables']['badges']['Row'];
};
type Project = Database['public']['Tables']['projects']['Row'];
type Mentorship = Database['public']['Tables']['mentorships']['Row'];

export function Dashboard() {
  const { usr, gdp } = useAuthContext();
  const nav = useNavigate();
  
  const [bdg, setBdg] = useState<Badge[]>([]);
  const [prj, setPrj] = useState<Project[]>([]);
  const [mtr, setMtr] = useState<Mentorship[]>([]);
  const [ldg, setLdg] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!usr) {
      nav('/signin');
    }
  }, [usr, nav]);

  // Redirect to GDPR consent if not provided
  useEffect(() => {
    if (usr && !gdp) {
      nav('/privacy-settings');
    }
  }, [usr, gdp, nav]);

  // Load user data
  useEffect(() => {
    const loadData = async () => {
      if (!usr) return;
      
      try {
        const [badges, projects, mentorships] = await Promise.all([
          sb.from('user_badges')
            .select('*, badges(*)')
            .eq('uid', usr.id)
            .order('cdt', { ascending: false })
            .limit(4),
          
          sb.from('projects')
            .select('*')
            .eq('uid', usr.id)
            .order('cdt', { ascending: false })
            .limit(4),
            
          sb.from('mentorships')
            .select('*')
            .eq('uid', usr.id)
            .order('cdt', { ascending: false })
            .limit(4)
        ]);

        if (badges.data) setBdg(badges.data);
        if (projects.data) setPrj(projects.data);
        if (mentorships.data) setMtr(mentorships.data);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      } finally {
        setLdg(false);
      }
    };

    loadData();
  }, [usr]);

  if (!usr) return null;

  return (
    <div className="space-y-6">
      {/* Profile Overview */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="mt-1 text-gray-500">
              Your career dashboard and digital portfolio
            </p>
          </div>
          <div className="hidden sm:block">
            <QRCodeSVG
              value={`${window.location.origin}/profile/${usr.id}`}
              size={64}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 text-blue-600">
              <Award className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Badges</h3>
              <p className="text-2xl font-bold text-gray-700">{bdg.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 text-green-600">
              <Briefcase className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Projects</h3>
              <p className="text-2xl font-bold text-gray-700">{prj.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100 text-yellow-600">
              <Users className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Mentorships</h3>
              <p className="text-2xl font-bold text-gray-700">{mtr.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-purple-100 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Hours</h3>
              <p className="text-2xl font-bold text-gray-700">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Badges */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Badges</h2>
            <button
              onClick={() => nav('/badges')}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : bdg.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {bdg.map((b) => (
              <li key={b.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <p className="font-medium text-gray-900">{b.badges?.nam}</p>
                      <p className="text-sm text-gray-500">
                        Issued {format(new Date(b.cdt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      b.sta === 'verified' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {b.sta}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No badges yet. Start earning them!
          </div>
        )}
      </div>

      {/* Active Projects */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Projects</h2>
            <button
              onClick={() => nav('/projects')}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : prj.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {prj.map((p) => (
              <li key={p.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{p.ttl}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(p.str), 'MMM d, yyyy')} - {p.edt ? format(new Date(p.edt), 'MMM d, yyyy') : 'Ongoing'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    p.sts === 'open' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {p.sts}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No active projects. Start or join one!
          </div>
        )}
      </div>

      {/* Mentorship Opportunities */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Mentorship</h2>
            <button
              onClick={() => nav('/mentorship')}
              className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : mtr.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {mtr.map((m) => (
              <li key={m.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {m.skl.join(', ')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {m.cur}/{m.cap} mentees • {m.exp} years experience
                    </p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    m.sts === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {m.sts}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No mentorship activities. Start mentoring or find a mentor!
          </div>
        )}
      </div>
    </div>
  );
}