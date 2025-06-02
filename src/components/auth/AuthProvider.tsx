import { useEffect, createContext, useContext } from 'react';
import { useAuth, initAuth } from '../../store/auth';

// Create context with minimal type names
type AuthCtx = {
  usr: any;
  ses: any;
  ldg: boolean;
  gdp: boolean;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { usr, ses, ldg, init, gdp } = useAuth();
  
  // Initialize auth on component mount
  useEffect(() => {
    try {
      initAuth();
      
      // Set up session refresh interval
      const refreshInterval = setInterval(() => {
        const session = sb.auth.session();
        if (session) {
          sb.auth.refreshSession();
        }
      }, 4 * 60 * 1000); // Refresh every 4 minutes
      
      return () => clearInterval(refreshInterval);
    } catch (err) {
      console.error("Auth initialization error:", err);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usr, ses, ldg, gdp }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook for accessing auth context
export function useAuthContext() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
}