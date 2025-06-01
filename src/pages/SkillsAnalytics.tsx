import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Brain, Target, TrendingUp, Users, AlertTriangle, BookOpen } from 'lucide-react';
import { analytics } from '../lib/analytics';

const dOid = '550e8400-e29b-41d4-a716-446655440000';
const btnCls = 'flex items-center rounded-lg px-4 py-2';
const actBtn = `${btnCls} bg-blue-100 text-blue-700`;
const inactBtn = `${btnCls} bg-gray-50 text-gray-700 hover:bg-gray-100`;

export function SkillsAnalytics() {
  const { usr } = useAuthContext();
  const nav = useNavigate();
  
  const [gaps, setGaps] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [ldg, setLdg] = useState(true);
  const [sel, setSel] = useState('ai');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!usr) {
      nav('/signin');
      return;
    }

    const lDt = async () => {
      if (!usr) return;      
      try {
        console.log("Loading analytics data...");
        const [gDat, sDat, tDat] = await Promise.all([
          analytics.getSkillGaps(dOid),
          analytics.getProjectStaffing('blockchain-pilot'),
          Promise.all(['react', 'blockchain', 'ai'].map(s => 
            analytics.trackSkillTrend(s)
          ))
        ]);
        console.log("Analytics data loaded");
        setGaps(gDat);
        setStaff(sDat);
        setTrends(tDat.flat());
      } catch (e: any) {
        console.error('Failed to load analytics:', e);
        setErr(e.message || "Failed to load analytics data");
      } finally {
        setLdg(false);
      }
    };

    lDt();
  }, [usr, nav]);

  if (!usr) return null;

  // Mock data for the bar chart
  const mockGaps = [
    {name: 'React', required: 4, current: 2, gap: 2, course: 'Advanced React'},
    {name: 'TypeScript', required: 3, current: 2, gap: 1, course: 'TypeScript Fundamentals'},
    {name: 'Cloud Architecture', required: 5, current: 2, gap: 3, course: 'AWS Solutions Architect'},
    {name: 'GraphQL', required: 3, current: 1, gap: 2, course: 'GraphQL Mastery'},
    {name: 'DevOps', required: 4, current: 2, gap: 2, course: 'CI/CD Pipeline Management'}
  ];

  // Use mock data if gaps is empty
  const displayGaps = gaps.length > 0 ? gaps : mockGaps;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Skills Intelligence</h1>
        <p className="mt-1 text-gray-500">
          Analyze skill gaps, track trends, and make data-driven staffing decisions
        </p>
      </div>

      {err && (
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{err}</p>
          </div>
        </div>
      )}

      {/* Initiative Selector */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex space-x-4">
          <button
            onClick={() => setSel('ai')}
            className={sel === 'ai' ? actBtn : inactBtn}
          >
            <Brain className="mr-2 h-5 w-5" />
            AI Transformation
          </button>
          <button
            onClick={() => setSel('blockchain')}
            className={sel === 'blockchain' ? actBtn : inactBtn}
          >
            <Target className="mr-2 h-5 w-5" />
            Blockchain Pilot
          </button>
        </div>
      </div>

      {/* Skills Gap Analysis */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Skills Gap Analysis</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={displayGaps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="required" fill="#3b82f6" name="Required Level">
                  {displayGaps.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={entry.gap > 2 ? '#ef4444' : '#3b82f6'}
                    />
                  ))}
                </Bar>
                <Bar dataKey="current" fill="#93c5fd" name="Current Level" />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h3 className="ml-2 text-sm font-medium text-red-800">
                    Critical Skill Gaps
                  </h3>
                </div>
                <ul className="mt-2 space-y-2">
                  {displayGaps.filter(g => g.gap > 2).map(g => (
                    <li key={g.name} className="text-sm text-red-700">
                      • {g.name}: Level {g.current} → {g.required}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  <h3 className="ml-2 text-sm font-medium text-blue-800">
                    Learning Recommendations
                  </h3>
                </div>
                <ul className="mt-2 space-y-2">
                  {displayGaps.filter(g => g.gap > 0).map(g => (
                    <li key={g.name} className="text-sm text-blue-700">
                      • {g.name}: {g.course} ({g.duration || '4 weeks'})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Project Staffing */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Project Staffing</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        <div className="p-6">
          <div className="rounded-lg bg-yellow-50 p-4 text-center">
            <p className="text-sm font-medium text-yellow-800">
              Sample data is displayed. Connect to your Supabase instance to see real data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}