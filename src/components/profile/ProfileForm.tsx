import { useState, useEffect } from 'react';
import { useAuth } from '../../store/auth';
import { User, Mail, Phone, MapPin, Save, Trash2 } from 'lucide-react';

export function ProfileForm() {
  const { usr, updatePrf, ldg } = useAuth();
  
  const [fn, setFn] = useState('');
  const [ln, setLn] = useState('');
  const [em, setEm] = useState('');
  const [ph, setPh] = useState('');
  const [loc, setLoc] = useState('');
  const [bio, setBio] = useState('');
  
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Load profile data when component mounts
  useEffect(() => {
    const loadProfile = async () => {
      if (!usr) return;
      
      try {
        const { data, error } = await fetch(`/api/profile/${usr.id}`).then(res => res.json());
        
        if (error) throw error;
        
        if (data) {
          setFn(data.fn || '');
          setLn(data.ln || '');
          setEm(data.em || usr.email || '');
          setPh(data.ph || '');
          setLoc(data.loc || '');
          setBio(data.bio || '');
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    };
    
    loadProfile();
  }, [usr]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    
    const { err: updateErr } = await updatePrf({
      fn,
      ln,
      em,
      ph,
      loc,
      bio
    });
    
    if (updateErr) {
      setErr(updateErr);
    } else {
      setMsg('Profile updated successfully');
      // Auto-clear success message after 3 seconds
      setTimeout(() => setMsg(''), 3000);
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 shadow-sm sm:rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update your profile information. This data belongs to you and will persist even if you change organizations.
          </p>
          
          {/* Profile completion indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Profile completion</span>
              <span className="text-sm font-medium text-gray-700">
                {[fn, ln, ph, loc, bio].filter(Boolean).length * 20}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
                style={{ width: `${[fn, ln, ph, loc, bio].filter(Boolean).length * 20}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="firstName"
                  value={fn}
                  onChange={(e) => setFn(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="lastName"
                  value={ln}
                  onChange={(e) => setLn(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={em}
                  onChange={(e) => setEm(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                  disabled={!!usr?.email} // Disable if set via authentication
                />
              </div>
              {usr?.email && (
                <p className="mt-1 text-xs text-gray-500">
                  Email is managed through your account settings
                </p>
              )}
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone number
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="location"
                  value={loc}
                  onChange={(e) => setLoc(e.target.value)}
                  placeholder="City, Country"
                  className="block w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div className="sm:col-span-6">
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                About
              </label>
              <div className="mt-1">
                <textarea
                  id="bio"
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A short bio about yourself"
                  className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                ></textarea>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Brief description about your skills and experience.
              </p>
            </div>
          </div>
        </div>
        
        {msg && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{msg}</p>
              </div>
            </div>
          </div>
        )}
        
        {err && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{err}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={ldg}
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <Save className="mr-2 h-4 w-4" />
            {ldg ? 'Saving...' : 'Save changes'}
          </button>
          
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-500" />
            Delete account
          </button>
        </div>
      </form>
    </div>
  );
}