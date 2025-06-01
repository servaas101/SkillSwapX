import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export class Db {
  public c: SupabaseClient;

  constructor() {
    console.log("Creating Supabase client with URL:", import.meta.env.VITE_SUPABASE_URL);
    this.c = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      }
    );
  }
}

// Export Supabase client instance
const db = new Db();
export const sb = db.c;