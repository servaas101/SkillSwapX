import { useState } from 'react';
import { useAuth } from '../../store/auth';
import { Mail, Lock, User, ArrowRight, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function SignUpForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gdpr, setGdpr] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { signUp, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    if (!gdpr) {
      setError('You must accept the privacy policy');
      return;
    }

    try {
      // Pass metadata to signUp function
      const { err: signUpError, details } = await signUp(email, password, {
        full_name: fullName,
        phone_number: phoneNumber
      });
      
      if (signUpError) {
        setError(`${signUpError}${details ? ` (${details})` : ''}`);
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'An unexpected error occurred');
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6 rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <User className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-gray-600">
            We've sent a verification link to <span className="font-medium">{email}</span>
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Please check your inbox and verify your email to complete registration.
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
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>
        </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="name@example.com"
              required
            />
          </div>
        </div>
        
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
            Phone Number (Optional)
          </label>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phoneNumber"
              type="tel"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-3 pl-10 pr-3 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              placeholder="+1 (555) 123-4567"
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              checked={gdpr}
              onChange={(e) => setGdpr(e.target.checked)}
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
        
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">
              {error}
              <p className="mt-2 text-xs">
                If this persists, please contact support with the details
              </p>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="group relative flex w-full justify-center rounded-md bg-blue-600 py-3 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
            </span>
          ) : (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <ArrowRight className="h-5 w-5 text-blue-500 group-hover:text-blue-400" />
            </span>
          )}
          {loading ? 'Creating account...' : 'Create account'}
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