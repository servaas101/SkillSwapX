import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const CONFIG = {
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
      console.error('Missing required environment variables:');
      if (!supaUrl) console.error('- VITE_SUPABASE_URL is not set');
      if (!supaKey) console.error('- VITE_SUPABASE_ANON_KEY is not set');
      throw new Error('Missing Supabase configuration');
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
          storageKey: 'supabase.session', // Match storage key used in auth store
          flowType: 'pkce',
          debug: import.meta.env.DEV
        },
        global: {
          headers: {
            'apikey': supaKey,
            'Accept': 'application/vnd.pgrst.object+json',
            'x-client-info': 'skillswapx',
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
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    while (retries < CONFIG.maxRetries) {
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
        
        if (retries === CONFIG.maxRetries) break;
        
        await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
      }
    }
    clearTimeout(timeoutId);
    
    throw new Error(
      `Failed to connect to Supabase after ${CONFIG.maxRetries} attempts. ` +
      `Last error: ${lastErr?.message || 'Unknown error'}`
    );
  }

  private setupError() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase.session');
        localStorage.removeItem('supabase.session.expires');
        sessionStorage.clear();
      } else if (event === 'TOKEN_REFRESHED') {
        const storage = localStorage.getItem('supabase.session') ? 
          localStorage : sessionStorage;
        if (session) {
          storage.setItem('supabase.session.expires', 
            session.expires_at?.toString() || '');
        }
      }
    });
  }
}

// Export single instance of Supabase client with the name 'sb'
export const sb = new DatabaseClient().supabase;