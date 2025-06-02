import { Navigate, useLocation } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireGdpr?: boolean;
  redirectPath?: string;
  redirectState?: Record<string, unknown>;
}

export function ProtectedRoute({ 
  children, 
  requireGdpr = true,
  redirectPath = '/signin',
  redirectState = {}
}: ProtectedRouteProps) {
  const { usr, gdp, ldg, init } = useAuthContext();
  const location = useLocation();

  // Show loading spinner while auth state is initializing
  if (!init || ldg) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!usr) {
    return (
      <Navigate 
        to={redirectPath} 
        state={{ from: location, ...redirectState }} 
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