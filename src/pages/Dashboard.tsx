import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../components/auth/AuthProvider';
import { Award, Book, Clock, Flag } from 'lucide-react';

export function Dashboard() {
  const { usr, gdp } = useAuthContext();
  const nav = useNavigate();

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

  if (!usr) {
    return null; // Redirect will happen via the useEffect
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 shadow-sm sm:rounded-lg">
        <h1 className="text-2xl font-bold text-gray-900">Welcome to SkillSwapX</h1>
        <p className="mt-1 text-gray-500">
          Your personalized dashboard for skill development and career growth.
        </p>
      </div>
      
      {/* Skills & stats summary */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100 text-blue-600">
              <Award className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Skills</h3>
              <p className="text-2xl font-bold text-gray-700">0</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-100 text-green-600">
              <Book className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
              <p className="text-2xl font-bold text-gray-700">0</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-yellow-100 text-yellow-600">
              <Clock className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Hours Logged</h3>
              <p className="text-2xl font-bold text-gray-700">0</p>
            </div>
          </div>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-red-100 text-red-600">
              <Flag className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Goals</h3>
              <p className="text-2xl font-bold text-gray-700">0</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Getting started section */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-gray-900">Getting Started</h2>
        <p className="mt-1 text-gray-500">Complete these steps to set up your profile</p>
        
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-sm font-medium">1</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Complete your profile</p>
                <p className="text-sm text-gray-500">Add your personal information and skills</p>
              </div>
            </div>
            <button
              onClick={() => nav('/profile')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Complete
            </button>
          </div>
          
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-sm font-medium">2</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Add your first skill</p>
                <p className="text-sm text-gray-500">Start building your skill portfolio</p>
              </div>
            </div>
            <button
              onClick={() => nav('/skills')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add skill
            </button>
          </div>
          
          <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <span className="text-sm font-medium">3</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Set a learning goal</p>
                <p className="text-sm text-gray-500">Define what you want to achieve</p>
              </div>
            </div>
            <button
              onClick={() => nav('/goals')}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Set goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}