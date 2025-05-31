import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase client configuration
// Using short variable names as per requirements (≤3 chars)
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Initialize the Supabase client
export const sb = createClient<Database>(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});