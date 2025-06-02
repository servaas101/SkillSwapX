import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class Db {
  public c: SupabaseClient;

  constructor() {
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    this.c = createClient<Database>(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        global: {
          headers: { 'x-client-info': 'skillswapx' }
        }
      }
    );
    this.initConnection();
  }

  private async initConnection() {
    let retries = 0;
    while (retries < MAX_RETRIES) {
      try {
        const { data, error } = await this.c.from('profiles').select('id').limit(1);
        if (!error) {
          console.log('Supabase connection established');
          return;
        }
        throw error;
      } catch (e) {
        retries++;
        if (retries === MAX_RETRIES) {
          throw new Error('Failed to connect to Supabase after retries');
        }
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
}

// Export Supabase client instance
const db = new Db();
export const sb = db.c;