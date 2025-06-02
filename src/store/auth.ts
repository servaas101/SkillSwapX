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
  signUp: (em: string, pwd: string) => Promise<{ err?: string }>;
  signIn: (em: string, pwd: string) => Promise<{ err?: string }>;
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
            .select('*')
            .eq('uid', session.user.id)
            .single();
            
          if (error) {
            console.error("Profile fetch error:", error);
            // If profile fetch fails due to JWT expiration, reset auth state
            if (error.message.includes('JWT expired')) {
              await sb.auth.signOut(); // Sign out to clear invalid session
              set({ usr: null, ses: null, gdp: false });
              throw error;
            }
            throw error;
          }
          
          set({ 
            usr: session.user,
            ses: session,
            gdp: data?.gdp || false
          });
        } catch (profileError) {
          // Reset auth state on profile fetch error
          console.error('Profile fetch error:', profileError);
          set({ usr: null, ses: null, gdp: false });
          throw profileError;
        }
      } else {
        set({ usr: null, ses: null, gdp: false });
      }
    } catch (e) {
      console.error('Auth load error:', e);
      // Ensure auth state is reset on any error
      set({ usr: null, ses: null, gdp: false });
    } finally {
      // Always set init to true to prevent infinite loading
      set({ ldg: false, init: true });
    }
  },

  // Sign up a new user
  signUp: async (em, pwd) => {
    try {
      set({ ldg: true });
      const { data: authData, error: authError } = await sb.auth.signUp({
        email: em,
        password: pwd
      });
      
      if (authError) throw authError;
      
      if (authData.user) {
        const { error: profErr } = await sb
          .from('profiles')
          .insert({
            uid: authData.user.id,
            em: authData.user.email,
            cdt: new Date().toISOString(),
            udt: new Date().toISOString(),
            gdp: false
          });
          
        if (profErr) throw profErr;
      }
      
      return { err: undefined };
    } catch (e: any) {
      console.error('Sign up error:', e);
      return { err: e.message || 'Sign up failed' };
    } finally {
      set({ ldg: false });
    }
  },

  // Sign in existing user
  signIn: async (em, pwd) => {
    try {
      set({ ldg: true });
      
      const { data, error } = await sb.auth.signInWithPassword({
        email: em,
        password: pwd
      });
      
      if (error) throw error;
      
      // Get user profile data
      const { data: profile, error: profErr } = await sb
        .from('profiles')
        .select('*')
        .eq('uid', data.user.id)
        .single();
        
      if (profErr && profErr.code !== 'PGRST116') throw profErr;
      
      set({ 
        usr: data.user, 
        ses: data.session,
        gdp: profile?.gdp || false
      });
      
      return {};
    } catch (e: any) {
      console.error('Sign in error:', e);
      // Reset auth state on sign in error
      set({ usr: null, ses: null, gdp: false });
      return { err: e.message || 'Sign in failed' };
    } finally {
      set({ ldg: false });
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      set({ ldg: true });
      await sb.auth.signOut();
      set({ usr: null, ses: null, gdp: false });
    } catch (e) {
      console.error('Sign out error:', e);
      // Ensure auth state is reset even if sign out fails
      set({ usr: null, ses: null, gdp: false });
    } finally {
      set({ ldg: false });
    }
  },

  // Request password reset
  resetPwd: async (em) => {
    try {
      set({ ldg: true });
      
      const { error } = await sb.auth.resetPasswordForEmail(em, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      return {};
    } catch (e: any) {
      console.error('Password reset error:', e);
      return { err: e.message || 'Password reset failed' };
    } finally {
      set({ ldg: false });
    }
  },

  // Update user profile
  updatePrf: async (data) => {
    try {
      set({ ldg: true });
      
      const usr = get().usr;
      if (!usr) throw new Error('Not authenticated');

      const { error } = await sb
        .from('profiles')
        .update({
          ...data,
          udt: new Date().toISOString()
        })
        .eq('uid', usr.id);
        
      if (error) {
        // Handle JWT expiration during profile update
        if (error.message.includes('JWT expired')) {
          await sb.auth.signOut();
          set({ usr: null, ses: null, gdp: false });
        }
        throw error;
      }
      
      // Log an update to profile if it contains significant changes
      if (data.fn || data.ln || data.em || data.ph) {
        await sb.rpc('log_consent', {
          p_uid: usr.id,
          p_typ: 'profile_update',
          p_dat: { fields: Object.keys(data) },
          p_ip: ''
        }).catch(e => console.error('Failed to log consent:', e));
      }
      
      return {};
    } catch (e: any) {
      console.error('Profile update error:', e);
      return { err: e.message || 'Profile update failed' };
    } finally {
      set({ ldg: false });
    }
  },

  // Set GDPR consent
  setGdp: async (val) => {
    try {
      set({ ldg: true });
      const usr = get().usr;
      if (!usr) throw new Error('Not authenticated');
      
      const { data, error } = await sb.rpc('update_gdpr_consent', {
        p_consent: val,
        p_ip: ''
      });
        
      if (error) {
        // Handle JWT expiration during GDPR consent update
        if (error.message.includes('JWT expired')) {
          await sb.auth.signOut();
          set({ usr: null, ses: null, gdp: false });
        }
        throw error;
      }
      
      set({ gdp: val });
      return {};
    } catch (e: any) {
      console.error('GDPR consent error:', e);
      return { err: e.message || 'GDPR consent update failed' };
    } finally {
      set({ ldg: false });
    }
  },

  // Request user data export (GDPR right to access)
  reqData: async () => {
    try {
      set({ ldg: true });
      
      const usr = get().usr;
      if (!usr) throw new Error('Not authenticated');
      
      try {
        // Log data access request
        await sb.rpc('log_consent', {
          p_uid: usr.id,
          p_typ: 'data_access',
          p_dat: { requested: new Date().toISOString() },
          p_ip: ''
        });
      } catch (e) {
        console.error('Failed to log consent:', e);
      }
      
      // In a real implementation, this would generate and return a download URL
      // For demo purposes, we're just returning success
      return { url: '#data-export-url' };
    } catch (e: any) {
      console.error('Data request error:', e);
      return { err: e.message || 'Data request failed' };
    } finally {
      set({ ldg: false });
    }
  },

  // Delete user data (GDPR right to be forgotten)
  delData: async () => {
    try {
      set({ ldg: true });
      
      const usr = get().usr;
      if (!usr) throw new Error('Not authenticated');
      
      try {
        // Call data deletion RPC
        const { error } = await sb.rpc('delete_user_data', {
          p_uid: usr.id
        });
        
        if (error) {
          // Handle JWT expiration during data deletion
          if (error.message.includes('JWT expired')) {
            await sb.auth.signOut();
            set({ usr: null, ses: null, gdp: false });
          }
          throw error;
        }
        
        // Log deletion request
        await sb.rpc('log_consent', {
          p_uid: usr.id,
          p_typ: 'data_deletion',
          p_dat: { deleted: new Date().toISOString() },
          p_ip: ''
        });
      } catch (e) {
        console.error('RPC error:', e);
      }
      
      // Sign out after data deletion
      await sb.auth.signOut();
      set({ usr: null, ses: null, gdp: false });
      
      return {};
    } catch (e: any) {
      console.error('Data deletion error:', e);
      return { err: e.message || 'Data deletion failed' };
    } finally {
      set({ ldg: false });
    }
  }
}));

// Initialize auth listener
export const initAuth = () => {
  const { loadUsr } = useAuth.getState();
  
  // Load initial auth state
  loadUsr();
  
  // Set up auth state change listener
  sb.auth.onAuthStateChange(async (_event, session) => {
    if (session) {
      try {
        // Verify session is still valid by attempting to fetch profile
        const { error } = await sb
          .from('profiles')
          .select('gdp')
          .eq('uid', session.user.id)
          .single();
          
        if (error) {
          if (error.message.includes('JWT expired')) {
            await sb.auth.signOut();
            useAuth.setState({ ses: null, usr: null, gdp: false });
            return;
          }
          console.error('Profile check error:', error);
          throw error;
        }
        
        useAuth.setState({ ses: session, usr: session.user });
      } catch (e) {
        console.error('Auth state change error:', e);
        useAuth.setState({ ses: null, usr: null, gdp: false });
      }
    } else {
      useAuth.setState({ ses: null, usr: null, gdp: false });
    }
    
    // If session exists but we don't have profile data, load it
    if (session && !useAuth.getState().init) {
      loadUsr();
    }
  });
};