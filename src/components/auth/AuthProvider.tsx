import { useEffect, createContext, useContext } from 'react';
import { useAuth, initAuth } from '../../store/auth';
import { sb } from '../../lib/supabase';

// Create context with descriptive type names
type AuthContextType = {
  usr: any;
  ses: any;
  ldg: boolean;
  gdp: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { usr, ses, ldg, gdp } = useAuth();
  
  useEffect(() => {
    let refreshInterval: NodeJS.Timeout | null = null;
    
    const initializeAuth = async () => {
      try {
        // Initialize auth and wait for it to complete
        await initAuth();
        
        // Set up session refresh interval
        refreshInterval = setInterval(async () => {
          const { data: { session } } = await sb.auth.getSession();
          if (session) {
            // Refresh session only if it's about to expire
            const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : new Date();
            const now = new Date();
            const timeLeft = expiresAt.getTime() - now.getTime();
            
            // Refresh if token expires within 5 minutes
            if (timeLeft < 5 * 60 * 1000) {
              console.log("Refreshing expiring session");
              const { error } = await sb.auth.refreshSession();
              if (error) console.error("Session refresh failed:", error);
            }
          }
        }, 1 * 60 * 1000); // Check every minute
      } catch (err) {
        console.error("Auth initialization error:", err);
      }
    };

    initializeAuth();

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []); // Empty dependency array to run only once

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