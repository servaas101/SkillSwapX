// lib/supabase.js (or .ts)
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const CONFIG = {
  maxRetries: 5,
  retryDelay: 2000,
  timeout: 10000
} as const;

export class DatabaseClient {
  public supabase: SupabaseClient<Database>;

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
          detectSessionInUrl: true,    // <-- parse #access_token=… automatically
          storageKey: 'supabase.session',
          flowType: 'pkce',
          debug: import.meta.env.DEV
        },
        global: {
          headers: {
            // Leaving apikey/header is optional; the client does this by default:
            apikey: supaKey,
            Authorization: `Bearer ${supaKey}`,
            Accept: 'application/json',            // <-- MUST be plain JSON
            'x-client-info': 'skillswapx',
            'X-Client-Version': '1.0.0'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 2,
            heartbeat: true,
            heartbeatIntervalMs: 30_000
          }
        }
      }
    );

    this.initConn();
    this.setupErrorListener();
  }

  private async initConn() {
    let retries = 0;
    let lastErr: any = null;

    while (retries < CONFIG.maxRetries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

      try {
        const { error } = await this.supabase
          .from('profiles')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);

        clearTimeout(timeoutId);
        if (!error) return;
        throw error;
      } catch (err: any) {
        lastErr = err;
        retries++;
        console.warn(`Supabase connection attempt ${retries} failed:`, err);

        if (retries === CONFIG.maxRetries) break;
        await new Promise((r) => setTimeout(r, CONFIG.retryDelay));
      }
    }

    throw new Error(
      `Failed to connect to Supabase after ${CONFIG.maxRetries} attempts. ` +
      `Last error: ${lastErr?.message || 'Unknown error'}`
    );
  }

  private setupErrorListener() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('supabase.session');
        localStorage.removeItem('supabase.session.expires');
        sessionStorage.clear();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        const storage = localStorage.getItem('supabase.session')
          ? localStorage
          : sessionStorage;
        storage.setItem(
          'supabase.session.expires',
          session.expires_at?.toString() || ''
        );
      }
    });
  }
}

// Export a singleton Supabase client:
export const sb = new DatabaseClient().supabase;