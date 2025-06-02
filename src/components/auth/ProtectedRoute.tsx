import { Navigate } from 'react-router-dom';
import { useAuthContext } from './AuthProvider';

type Props = {
  children: React.ReactNode;
  requireGdpr?: boolean;
};

export function ProtectedRoute({ children, requireGdpr = true }: Props) {
  const { usr, gdp } = useAuthContext();

  if (!usr) {
    return <Navigate to="/signin" replace />;
  }

  if (requireGdpr && !gdp) {
    return <Navigate to="/privacy-settings" replace />;
  }

  return <>{children}</>;
}