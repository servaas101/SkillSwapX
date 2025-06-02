import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const CONN_CFG = {
  maxRetries: 5,
  retryDelay: 2000,
  timeout: 10000
} as const;

export class DatabaseClient {
  public supabase: SupabaseClient;

  constructor() {
    const supaUrl = import.meta.env.VITE_SUPABASE_URL;
    const supaKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supaUrl || !supaKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Validate URL format
    try {
      new URL(supaUrl);
    } catch (e) {
      throw new Error('Invalid Supabase URL format');
    }

    this.supabase = createClient<Database>(
      supaUrl,
      supaKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'supabase.session',
          flowType: 'pkce',
          debug: import.meta.env.DEV
        },
        global: {
          headers: {
            'x-client-info': 'skillswapx',
            'Accept': 'application/json',
            'X-Client-Version': '1.0.0'
          }
        },
        realtime: {
          params: { 
            eventsPerSecond: 2,
            heartbeat: true,
            heartbeatIntervalMs: 1000 * 30
          }
        }
      }
    );
    
    this.initConn();
    this.setupError();
  }

  private async initConn() {
    let retries = 0;
    let lastErr = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONN_CFG.timeout);

    while (retries < CONN_CFG.maxRetries) {
      try {
        const { error } = await this.supabase
          .from('auth_events')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);

        if (!error) return;
        throw error;
      } catch (err) {
        lastErr = err;
        retries++;
        console.warn(`Supabase connection attempt ${retries} failed:`, err);
        
        if (retries === CONN_CFG.maxRetries) break;
        
        await new Promise(resolve => setTimeout(resolve, CONN_CFG.retryDelay));
      }
    }
    clearTimeout(timeoutId);
    
    throw new Error(
      `Failed to connect to Supabase after ${CONN_CFG.maxRetries} attempts. ` +
      `Last error: ${lastErr?.message || 'Unknown error'}`
    );
  }

  private setupError() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.clear();
        sessionStorage.clear();
      } else if (event === 'TOKEN_REFRESHED') {
        const storage = localStorage.getItem('supabase.session') ? localStorage : sessionStorage;
        if (session) {
          storage.setItem('supabase.session.expires', session.expires_at);
        }
      }
    });
  }
}

// Export single instance of Supabase client with the name 'sb'
export const sb = new DatabaseClient().supabase;