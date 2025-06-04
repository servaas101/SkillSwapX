import { create } from 'zustand';
import { sb } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

// Define the auth store types with short variable names
type AuthState = {
  usr: User | null;
  ses: Session | null;
  ldg: boolean;
  init: boolean;
  gdp: boolean;
  signUp: (em: string, pwd: string, metadata?: Record<string, any>) => Promise<{ err?: string }>;
  signIn: (em: string, pwd: string, remember?: boolean) => Promise<{ err?: string, usr?: User }>;
  signOut: () => Promise<void>;
  resetPwd: (em: string) => Promise<{ err?: string }>;
  loadUsr: () => Promise<void>;
  updatePrf: (data: any) => Promise<{ err?: string }>;
  setGdp: (val: boolean) => Promise<{ err?: string }>;
  reqData: () => Promise<{ err?: string, url?: string }>;
  delData: () => Promise<{ err?: string }>;
};

// Create the auth store
export const useAuth = create<AuthState>((set, get) => ({
  usr: null,
  ses: null,
  ldg: true,
  init: false,
  gdp: false,

  // Initialize and load user data
  loadUsr: async () => {
    try {
      set({ ldg: true });
      
      // Get current session
      const { data: { session }, error: sessionError } = await sb.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        throw sessionError;
      }
      
      if (session) {
        try {
          // Get user profile if session exists
          const { data, error } = await sb
            .from('profiles')
            .select('role, mentor_status, mentor_applied_at, gdp, username, full_name, avatar_url')
            .eq('id', session.user.id)
            .single();
            
          if (error) {
            console.error("Profile fetch error:", error);
            // If profile fetch fails due to JWT expiration, reset auth state
            if (error.message.includes('JWT expired')) {
              await sb.auth.signOut();
              set({ usr: null, ses: null, gdp: false });
              throw error;
            }
            throw error;
          }

          // Merge role & gdp into the user object
          const enrichedUser = {
            ...session.user,
            role: data.role,
            mentorStatus: data.mentor_status || 'none',
            mentorAppliedAt: data.mentor_applied_at || null,
          };
          
          set({ 
            usr: enrichedUser as any,
            ses: session,
            gdp: data.gdp || false
          });
        } catch (profileError) {
          console.error('Profile fetch error:', profileError);
          set({ usr: null, ses: null, gdp: false });
          throw profileError;
        }
      } else {
        set({ usr: null, ses: null, gdp: false });
      }
    } catch (e) {
      console.error('Auth load error:', e);
      set({ usr: null, ses: null, gdp: false });
    } finally {
      // Always set init to true to prevent infinite loading
      set({ ldg: false, init: true });
    }
  },

  // Sign up a new user
  signUp: async (em, pwd, metadata = {}) => {
    try {
      set({ ldg: true });
      
      // Sign up the user
      const { data, error } = await sb.auth.signUp({
        email: em,
        password: pwd,
        options: {
          emailRedirectTo: import.meta.env.PROD
            ? 'https://resilient-faloodeh-3065ca.netlify.app/Dashboard'
            : `${window.location.origin}/Dashboard`
        }
      });
      
      if (error) throw error;
      
      // Create profile manually if user was created
      if (data.user) {
        const { error: profileError } = await sb
          .from('profiles')
          .insert({
            id: data.user.id,
            username: em.split('@')[0], // Generate a username from email
            full_name: metadata.full_name || '',
            role: 'employee', // Default role
            gdp: false, // Default GDPR status
            mentor_status: 'none' // Default mentor status
          });
          
        if (profileError) {
          console.error('Profile creation error:', profileError);
          
          // Handle specific constraint violation errors
          if (profileError.code === '23505') {
            throw new Error('User with this email already exists');
          }
          
          throw new Error('Failed to create user profile');
        }
      }
      
      return {};
    } catch (e: any) {
      console.error('Sign up error:', e);
      return { 
        err: e.message || 'Sign up failed',
        details: e.status ? `Status: ${e.status}` : undefined
      };
    } finally {
      set({ ldg: false });
    }
  },

  // Rest of the code remains the same...
  // [Keep all other functions unchanged]
}));

// Initialize auth listener
export const initAuth = () => {
  useAuth.getState().loadUsr();
  sb.auth.onAuthStateChange(async (event, session) => {
    if (['SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED','USER_UPDATED'].includes(event)) {
      await useAuth.getState().loadUsr();
    }
  });
};