import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export class Db {
  private c: SupabaseClient;

  constructor() {
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