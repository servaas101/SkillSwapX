import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export function SignInForm() {
  const [em, setEm] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [rem, setRem] = useState(false);
  
  const { signIn, ldg } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    
    if (!em || !pwd) {
      setErr('Please fill in all fields');
      return;
    }
    
    const { err: signInErr } = await signIn(em, pwd, rem);
    
    if (signInErr) { 
      setErr(signInErr);
    } else {
      // Successful login - redirect to intended destination
      navigate(returnTo, { replace: true });
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
        <p className="mt-2 text-gray-600">Welcome back to SkillSwapX</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="username"
              value={em}
              onChange={(e) => setEm(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rem}
              onChange={(e) => setRem(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <div className="text-sm">
            <Link to="/reset-password" className="font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
        </div>
        
        {err && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{err}</div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={ldg}
          className="group relative flex w-full justify-center rounded-md bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {ldg ? (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            </span>
          ) : (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <ArrowRight className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
          )}
          {ldg ? 'Signing in...' : 'Sign in'}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Don't have an account? </span>
          <Link to="/signup" className="font-medium text-blue-600 hover:underline">
            Sign up now
          </Link>
        </div>
      </form>
    </div>
  );
}