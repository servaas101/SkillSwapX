import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { Briefcase, MapPin, Clock, ChevronRight, Star, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { sb } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

export function Opportunities() {
  const { usr } = useAuthContext();
  const nav = useNavigate();
  
  const [prj, setPrj] = useState<Project[]>([]);
  const [ldg, setLdg] = useState(true);
  const [fil, setFil] = useState({
    match: 0,
    loc: '',
    typ: ''
  });

  // Load opportunities and calculate match scores
  useEffect(() => {
    const loadOpportunities = async () => {
      if (!usr) return;
      
      try {
        // Get user's verified skills
        const { data: skills } = await sb
          .from('skills')
          .select('*')
          .eq('uid', usr.id);

        // Get available projects
        const { data: projects } = await sb
          .from('projects')
          .select('*')
          .eq('sts', 'open')
          .order('cdt', { ascending: false });

        if (projects) {
          // Calculate match percentage for each project
          const projectsWithMatch = projects.map(p => {
            const reqSkills = p.skl as any[];
            const matchCount = skills?.filter(s => 
              reqSkills.some(r => 
                r.name.toLowerCase() === s.name.toLowerCase() && 
                r.level <= s.level
              )
            ).length || 0;
            
            const matchPercent = reqSkills?.length 
              ? Math.round((matchCount / reqSkills.length) * 100)
              : 0;

            return { ...p, match: matchPercent };
          });

          setPrj(projectsWithMatch);
        }
      } catch (e) {
        console.error('Failed to load opportunities:', e);
      } finally {
        setLdg(false);
      }
    };

    loadOpportunities();
  }, [usr]);

  // Filter projects
  const filteredProjects = prj
    .filter(p => p.match >= fil.match)
    .filter(p => !fil.loc || p.loc === fil.loc)
    .filter(p => !fil.typ || p.typ === fil.typ);

  // Quick apply
  const handleQuickApply = async (pid: string) => {
    if (!usr) return;
    
    try {
      await sb.rpc('apply_project', {
        p_pid: pid,
        p_msg: 'Quick application based on skill match',
        p_exp: {}
      });
      
      // Update project status
      setPrj(prj.map(p => 
        p.id === pid 
          ? { ...p, sts: 'applied' }
          : p
      ));
    } catch (e) {
      console.error('Failed to apply:', e);
    }
  };

  if (!usr) {
    nav('/signin');
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Career Opportunities</h1>
        <p className="mt-1 text-gray-500">
          Discover opportunities that match your verified skills and experience
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Filters</h2>
          <Filter className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Minimum Match
            </label>
            <select
              value={fil.match}
              onChange={(e) => setFil({ ...fil, match: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value={0}>All Opportunities</option>
              <option value={50}>50%+ Match</option>
              <option value={80}>80%+ Match</option>
              <option value={90}>90%+ Match</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <select
              value={fil.loc}
              onChange={(e) => setFil({ ...fil, loc: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Locations</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              value={fil.typ}
              onChange={(e) => setFil({ ...fil, typ: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All Types</option>
              <option value="permanent">Permanent</option>
              <option value="contract">Contract</option>
              <option value="mentorship">Mentorship</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities List */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">
            {ldg ? 'Loading opportunities...' : `${filteredProjects.length} Opportunities Found`}
          </h2>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : filteredProjects.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {filteredProjects.map((p) => (
              <li key={p.id} className="px-6 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium text-gray-900">{p.ttl}</h3>
                      {p.match >= 80 && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          <Star className="mr-1 h-3 w-3" />
                          Best Match
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      {p.loc}
                      <span className="mx-2">•</span>
                      <Clock className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      {format(new Date(p.str), 'MMM d, yyyy')}
                      <span className="mx-2">•</span>
                      <Briefcase className="mr-1.5 h-4 w-4 flex-shrink-0" />
                      {p.typ}
                    </div>
                    
                    <div className="mt-2">
                      <p className="line-clamp-2 text-sm text-gray-600">{p.dsc}</p>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center">
                        <div className="h-2 w-24 rounded-full bg-gray-200">
                          <div
                            className="h-2 rounded-full bg-blue-600"
                            style={{ width: `${p.match}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {p.match}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex items-center space-x-3">
                    <button
                      onClick={() => handleQuickApply(p.id)}
                      disabled={p.sts === 'applied'}
                      className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {p.sts === 'applied' ? 'Applied' : 'Quick Apply'}
                    </button>
                    
                    <button
                      onClick={() => nav(`/opportunities/${p.id}`)}
                      className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      View Details
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-6 py-4 text-center text-gray-500">
            No opportunities match your current filters
          </div>
        )}
      </div>
    </div>
  );
}