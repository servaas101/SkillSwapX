import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ResetPassword() {
  const [em, setEm] = useState('');
  const [err, setErr] = useState('');
  const [suc, setSuc] = useState(false);
  
  const { resetPwd, ldg } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    
    if (!em) {
      setErr('Please enter your email');
      return;
    }
    
    const { err: resetErr } = await resetPwd(em);
    
    if (resetErr) {
      setErr(resetErr);
    } else {
      setSuc(true);
    }
  };

  if (suc) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a password reset link to <span className="font-medium">{em}</span>
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
        <h1 className="text-3xl font-bold text-gray-900">Reset Password</h1>
        <p className="mt-2 text-gray-600">We'll send you a link to reset your password</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="name@example.com"
              required
            />
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
          {ldg ? 'Sending...' : 'Send reset link'}
        </button>
        
        <div className="mt-4 text-center text-sm text-gray-600">
          <span>Remember your password? </span>
          <Link to="/signin" className="font-medium text-blue-600 hover:underline">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}