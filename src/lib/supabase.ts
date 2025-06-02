import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const CONNECTION_CONFIG = {
  maxRetries: 5,
  retryDelay: 2000,
  timeout: 10000
} as const;

export class DatabaseClient {
  public client: SupabaseClient;

  constructor() {
    const url = import.meta.env.VITE_SUPABASE_URL?.trim();
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
    
    // Use default values for public access
    const supaUrl = url || 'https://your-project.supabase.co';
    const supaKey = key || 'your-anon-key';

    // Validate URL format
    try {
      new URL(supaUrl);
    } catch (e) {
      throw new Error('Invalid Supabase URL format');
    }

    this.client = createClient<Database>(
      supaUrl,
      supaKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'sb.session',
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
            // Add heartbeat to detect connection issues
            heartbeat: true,
            heartbeatIntervalMs: 1000 * 30 // 30 seconds
          }
        }
      }
    );
    
    this.initConnection();
    this.setupErrorHandling();
  }

  private async initConnection() {
    let retries = 0;
    let lastError = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONNECTION_CONFIG.timeout);

    while (retries < CONNECTION_CONFIG.maxRetries) {
      try {
        const { error } = await this.client
          .from('auth_events')
          .select('id')
          .limit(1)
          .abortSignal(controller.signal);

        if (!error) return; // Connection successful
        throw error;
      } catch (e) {
        lastError = e;
        retries++;
        console.warn(`Supabase connection attempt ${retries} failed:`, e);
        
        if (retries === CONNECTION_CONFIG.maxRetries) break;
        
        await new Promise(resolve => setTimeout(resolve, CONNECTION_CONFIG.retryDelay));
      }
    }
    clearTimeout(timeoutId);
    
    throw new Error(
      `Failed to connect to Supabase after ${CONNECTION_CONFIG.maxRetries} attempts. ` +
      `Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  private setupErrorHandling() {
    // Handle auth errors
    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Clear all storage on sign out
        localStorage.clear();
        sessionStorage.clear();
      } else if (event === 'TOKEN_REFRESHED') {
        // Update session expiry
        const storage = localStorage.getItem('sb.session') ? localStorage : sessionStorage;
        if (session) {
          storage.setItem('sb.session.expires', session.expires_at);
        }
      }
    });
  }
}

// Export initialized Supabase client instance
export const sb = new DatabaseClient().client;

export { sb }