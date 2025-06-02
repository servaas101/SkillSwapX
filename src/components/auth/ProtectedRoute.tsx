import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireGdpr?: boolean;
  redirectPath?: string;
}

export function ProtectedRoute({ 
  children, 
  requireGdpr = true,
  redirectPath = '/signin'
}: ProtectedRouteProps) {
  const { usr, gdp, ldg, init } = useAuthContext();
  const location = useLocation();
  const state = { from: location };

  // Show loading spinner while auth state is initializing
  if (!init || ldg) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!usr) {
    return (
      <Navigate 
        to={redirectPath} 
        state={state}
        replace 
      />
    );
  }

  // Redirect to privacy settings if GDPR consent required
  if (requireGdpr && !gdp) {
    return (
      <Navigate 
        to="/privacy-settings" 
        state={{ from: location, requireConsent: true }} 
        replace 
      />
    );
  }

  // Render protected content
  return <>{children}</>;
}