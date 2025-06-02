import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireGdpr?: boolean;
  redirectPath?: string;
  requireRoles?: string[];
}

export function ProtectedRoute({ 
  children, 
  requireGdpr = true,
  redirectPath = '/signin',
  requireRoles = []
}: ProtectedRouteProps) {
  const { usr, gdp, ldg, init } = useAuthContext();
  const location = useLocation();
  const returnPath = location.state?.returnTo || location.pathname;
  const state = { returnTo: returnPath };

  // Show loading spinner while auth state is initializing
  if (!init || ldg) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" aria-hidden="true" />
          <span className="sr-only">Loading...</span>
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

  // Check role requirements if specified
  if (requireRoles.length > 0 && !requireRoles.includes(usr.role)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h2>
          <p className="mt-1 text-sm text-gray-500">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to privacy settings if GDPR consent required
  if (requireGdpr && !gdp) {
    return (
      <Navigate 
        to="/privacy-settings" 
        state={{ returnTo: returnPath, requireConsent: true }} 
        replace 
      />
    );
  }

  // Render protected content
  return <>{children}</>;
}