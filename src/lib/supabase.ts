import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000;
const TIMEOUT = 10000;

export class Db {
  public c: SupabaseClient;

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) throw new Error('Missing Supabase environment variables');

    this.c = createClient<Database>(
      url,
      key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'sb.session',
          storage: window.localStorage
        },
        global: {
          headers: {
            'x-client-info': 'skillswapx',
            'Accept': 'application/json'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 2
          }
        }
      }
    );
    
    this.initConnection();
  }

  private async initConnection() {
    let retries = 0;
    let lastError = null;

    while (retries < MAX_RETRIES) {
      try {
        // Try a simple health check query with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const { error } = await this.c
          .from('auth_events')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);

        if (!error) return; // Connection successful
        throw error;
      } catch (e) {
        lastError = e;
        retries++;
        console.warn(`Supabase connection attempt ${retries} failed:`, e);
        
        if (retries === MAX_RETRIES) break;
        
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      }
    }
    
    throw new Error(
      `Failed to connect to Supabase after ${MAX_RETRIES} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }
}

const db = new Db();
export const sb = db.c;