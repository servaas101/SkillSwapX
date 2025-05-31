import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignUpForm() {
  const [em, setEm] = useState('');
  const [pwd, setPwd] = useState('');
  const [cpw, setCpw] = useState('');
  const [gdp, setGdp] = useState(false);
  const [err, setErr] = useState('');
  const [suc, setSuc] = useState(false);
  
  const { signUp, ldg } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    
    if (!em || !pwd || !cpw) {
      setErr('Please fill in all required fields');
      return;
    }
    
    if (pwd !== cpw) {
      setErr('Passwords do not match');
      return;
    }
    
    if (pwd.length < 8) {
      setErr('Password must be at least 8 characters');
      return;
    }
    
    if (!gdp) {
      setErr('You must accept the privacy policy');
      return;
    }
    
    const { err: signUpErr } = await signUp(em, pwd);
    
    if (signUpErr) {
      setErr(signUpErr);
    } else {
      setSuc(true);
    }
  };

  if (suc) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to <span className="font-medium">{em}</span>
          </p>
        </div>
        <div className="mt-6">
          <Link
            to="/signin"
            className="block w-full rounded-md bg-blue-600 py-3 px-4 text-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6 px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="mt-2 text-gray-600">Join SkillSwapX talent ecosystem</p>
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
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Min. 8 characters</p>
        </div>
        
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              type="password"
              value={cpw}
              onChange={(e) => setCpw(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>
        
        <div className="flex items-start">
          <div className="flex h-5 items-center">
            <input
              id="gdpr"
              type="checkbox"
              checked={gdp}
              onChange={(e) => setGdp(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              required
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="gdpr" className="text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="font-medium text-blue-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="font-medium text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
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
          {ldg ? 'Creating account...' : 'Create account'}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Already have an account? </span>
          <Link to="/signin" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
}