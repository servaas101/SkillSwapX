import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { 
  Users, Building2, Shield, ChevronRight, Clock, 
  Award, TrendingUp, Target, AlertTriangle 
} from 'lucide-react';
import { format } from 'date-fns';
import { sb } from '../lib/supabase';
import { p } from '../lib/privacy';

type Partner = {
  id: string;
  name: string;
  domain: string;
  status: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  start_date: string;
  edt: string | null;
  status: string;
  partner_id: string;
  metrics: {
    cost_savings: number;
    time_saved: number;
    knowledge_score: number;
  };
};

export function ProjectCollaboration() {
  const { usr } = useAuthContext();
  const nav = useNavigate();
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [ldg, setLdg] = useState(true);
  const [err, setErr] = useState('');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    partner_id: '',
    start_date: '',
    edt: ''
  });

  useEffect(() => {
    if (!usr) {
      nav('/signin');
      return;
    }

    const loadData = async () => {
      try {
        const [partnersData, projectsData] = await Promise.all([
          sb.from('partners').select('*').eq('org_id', usr.org_id),
          sb.from('projects')
            .select(`
              *,
              partner:partners(name),
              metrics:project_metrics(*)
            `)
            .eq('org_id', usr.org_id)
            .order('created_at', { ascending: false })
        ]);

        if (partnersData.error) throw partnersData.error;
        if (projectsData.error) throw projectsData.error;

        setPartners(partnersData.data);
        setProjects(projectsData.data);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLdg(false);
      }
    };

    loadData();
  }, [usr, nav]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLdg(true);
    setErr('');

    try {
      const { data, error } = await sb.rpc('cPrj', {
        ttl: newProject.title,
        dsc: newProject.description,
        pid: newProject.partner_id,
        str: newProject.start_date,
        edt: newProject.edt || null
      });

      if (error) throw error;

      // Refresh projects list
      const { data: uPrj, error: pErr } = await sb
        .from('projects')
        .select(`
          *,
          partner:partners(name),
          metrics:project_metrics(*)
        `)
        .eq('org_id', usr.org_id)
        .order('created_at', { ascending: false });

      if (pErr) throw pErr;

      setProjects(uPrj);
      setShowNewProject(false);
      setNewProject({
        title: '',
        description: '',
        partner_id: '',
        start_date: '',
        edt: ''
      });
    } catch (e: any) {
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
            <h1 className="text-2xl font-bold text-gray-900">Partner Collaboration</h1>
            <p className="mt-1 text-gray-500">
              Manage cross-company projects and talent sharing initiatives
            </p>
          </div>
          <button
            onClick={() => setShowNewProject(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            New Project
          </button>
        </div>
      </div>

      {/* Partner Organizations */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Partner Organizations</h2>
            <Building2 className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {partners.map(partner => (
              <div key={partner.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-lg font-medium text-blue-600">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{partner.name}</h3>
                      <p className="text-sm text-gray-500">{partner.domain}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    partner.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {partner.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Projects */}
      <div className="bg-white shadow-sm sm:rounded-lg">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Active Projects</h2>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
        </div>
        
        {ldg ? (
          <div className="p-6">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {projects.map(project => (
              <div key={project.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{project.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{project.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Clock className="mr-1.5 h-4 w-4" />
                        {format(new Date(project.start_date), 'MMM d, yyyy')}
                        {project.edt && (
                          <> - {format(new Date(project.edt), 'MMM d, yyyy')}</>
                        )}
                      </div>
                      <div className="flex items-center">
                        <Building2 className="mr-1.5 h-4 w-4" />
                        {project.partner.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      project.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : project.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status}
                    </span>
                    <button
                      onClick={() => nav(`/projects/${project.id}`)}
                      className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </button>
                  </div>
                </div>

                {project.metrics && (
                  <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-400" />
                        <h4 className="ml-2 text-sm font-medium text-green-800">
                          Cost Savings
                        </h4>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-green-900">
                        ${project.metrics.cost_savings.toLocaleString()}
                      </p>
                    </div>

                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-blue-400" />
                        <h4 className="ml-2 text-sm font-medium text-blue-800">
                          Time Saved
                        </h4>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-blue-900">
                        {project.metrics.time_saved} weeks
                      </p>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-purple-400" />
                        <h4 className="ml-2 text-sm font-medium text-purple-800">
                          Knowledge Score
                        </h4>
                      </div>
                      <p className="mt-2 text-2xl font-bold text-purple-900">
                        {project.metrics.knowledge_score}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProject && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">&#8203;</span>

            <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
              <form onSubmit={handleCreateProject}>
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 className="text-lg font-medium leading-6 text-gray-900">
                        Create New Project
                      </h3>
                      <div className="mt-2">
                        <div className="space-y-4">
                          <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                              Project Title
                            </label>
                            <input
                              type="text"
                              id="title"
                              value={newProject.title}
                              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              id="description"
                              value={newProject.description}
                              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                              rows={3}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="partner" className="block text-sm font-medium text-gray-700">
                              Partner Organization
                            </label>
                            <select
                              id="partner"
                              value={newProject.partner_id}
                              onChange={(e) => setNewProject({ ...newProject, partner_id: e.target.value })}
                              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                              required
                            >
                              <option value="">Select a partner</option>
                              {partners.map(partner => (
                                <option key={partner.id} value={partner.id}>
                                  {partner.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                                Start Date
                              </label>
                              <input
                                type="date"
                                id="start_date"
                                value={newProject.start_date}
                                onChange={(e) => setNewProject({ ...newProject, start_date: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                                required
                              />
                            </div>

                            <div>
                              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                                End Date
                              </label>
                              <input
                                type="date"
                                id="edt"
                                value={newProject.edt}
                                onChange={(e) => setNewProject({ ...newProject, edt: e.target.value })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {err && (
                  <div className="bg-red-50 px-4 py-3">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-red-800">{err}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="submit"
                    disabled={ldg}
                    className="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {ldg ? 'Creating...' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewProject(false)}
                    className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}