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
    initAuth();
  }, []);

  // Show loading state until initialization completes
  if (!init) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

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