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
      const { data: { session } } = await sb.auth.getSession();
      
      if (session) {
        // Get user profile if session exists
        const { data, error } = await sb
          .from('profiles')
          .select('*')
          .eq('uid', session.user.id)
          .single();
          
        if (error) throw error;
        
        set({ 
          usr: session.user,
          ses: session,
          gdp: data?.gdp || false,
          init: true
        });
      } else {
        set({ usr: null, ses: null, init: true });
      }
    } catch (e) {
      console.error('Auth load error:', e);
    } finally {
      set({ ldg: false });
    }
  },

  // Sign up a new user
  signUp: async (em, pwd) => {
    try {
      set({ ldg: true });
      
      const { data, error } = await sb.auth.signUp({
        email: em,
        password: pwd,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Create profile for new user
        const { error: profErr } = await sb
          .from('profiles')
          .insert([
            {
              uid: data.user.id,
              em: data.user.email,
              cdt: new Date().toISOString(),
              udt: new Date().toISOString(),
              gdp: false
            }
          ]);
          
        if (profErr) throw profErr;
      }
      
      return {};
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
        
      if (error) throw error;
      
      // Log an update to profile if it contains significant changes
      if (data.fn || data.ln || data.em || data.ph) {
        await sb.rpc('log_consent', {
          p_uid: usr.id,
          p_typ: 'profile_update',
          p_dat: { fields: Object.keys(data) },
          p_ip: ''
        });
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
      
      // Update GDPR consent status
      const { error } = await sb
        .from('profiles')
        .update({
          gdp: val,
          gdl: new Date().toISOString()
        })
        .eq('uid', usr.id);
        
      if (error) throw error;
      
      // Log consent
      await sb.rpc('log_consent', {
        p_uid: usr.id,
        p_typ: 'gdpr_consent',
        p_dat: { consent: val },
        p_ip: ''
      });
      
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
      
      // Log data access request
      await sb.rpc('log_consent', {
        p_uid: usr.id,
        p_typ: 'data_access',
        p_dat: { requested: new Date().toISOString() },
        p_ip: ''
      });
      
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
      
      // Call data deletion RPC
      const { error } = await sb.rpc('delete_user_data', {
        p_uid: usr.id
      });
      
      if (error) throw error;
      
      // Log deletion request
      await sb.rpc('log_consent', {
        p_uid: usr.id,
        p_typ: 'data_deletion',
        p_dat: { deleted: new Date().toISOString() },
        p_ip: ''
      });
      
      // Sign out after data deletion
      await sb.auth.signOut();
      set({ usr: null, ses: null });
      
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
  sb.auth.onAuthStateChange((_event, session) => {
    useAuth.setState({ ses: session, usr: session?.user || null });
    
    // If session exists but we don't have profile data, load it
    if (session && !useAuth.getState().init) {
      loadUsr();
    }
  });
};