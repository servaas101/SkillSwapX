import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const TIMEOUT = 30000;

export class Db {
  private static instance: Db;
  private client: ReturnType<typeof createClient<Database>>;
  private status: 'connecting' | 'connected' | 'error' = 'connecting';
  private lastError?: Error;
  private retryCount = 0;
  private retryTimeout?: NodeJS.Timeout;

  private constructor() {
    const config = this.loadConfig();
    
    this.client = createClient<Database>(config.url, config.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: import.meta.env.DEV,
        storage: {
          getItem: (key) => {
            try {
              const storage = this.isSecureContext() ? localStorage : sessionStorage;
              const value = storage.getItem(key);
              return value ? JSON.parse(value) : null;
            } catch {
              return null;
            }
          },
          setItem: (key, value) => {
            try {
              const storage = this.isSecureContext() ? localStorage : sessionStorage;
              storage.setItem(key, JSON.stringify(value));
            } catch (e) {
              console.error('Storage error:', e);
            }
          },
          removeItem: (key) => {
            try {
              const storage = this.isSecureContext() ? localStorage : sessionStorage;
              storage.removeItem(key);
            } catch (e) {
              console.error('Storage error:', e);
            }
          }
        }
      },
      global: {
        headers: {
          'x-client-info': `skillswapx@${import.meta.env.VITE_APP_VERSION || '0.1.0'}`,
          'x-client-env': import.meta.env.MODE
        }
      },
      db: {
        schema: 'public'
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    
    this.validateConnection();
  }

  private async validateConnection() {
    if (this.retryCount >= MAX_RETRIES) {
      this.status = 'error';
      return;
    }

    try {
      const { error } = await Promise.race([
        this.client.from('profiles').select('id').limit(1),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), TIMEOUT)
        )
      ]);

      if (error) throw error;
      
      this.status = 'connected';
      this.retryCount = 0;
      this.lastError = undefined;
      
      if (this.retryTimeout) {
        clearTimeout(this.retryTimeout);
        this.retryTimeout = undefined;
      }
    } catch (e) {
      this.lastError = e as Error;
      this.retryCount++;

      if (this.retryCount < MAX_RETRIES) {
        this.retryTimeout = setTimeout(() => {
          this.validateConnection();
        }, RETRY_DELAY * Math.pow(2, this.retryCount - 1));
      } else {
        this.status = 'error';
        console.error('Failed to connect to Supabase after retries:', this.lastError);
      }
    }
  }

  private loadConfig() {
    const url = import.meta.env.VITE_SUPABASE_URL?.trim();
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

    if (!url || !key) {
      try {
        throw new Error(
          'Missing Supabase configuration. Check environment variables:\n' +
          'VITE_SUPABASE_URL: ' + (url ? '✓' : '✗') + '\n' +
          'VITE_SUPABASE_ANON_KEY: ' + (key ? '✓' : '✗')
        );
      } catch (e) {
        console.error(e);
        throw e;
      }
    }

    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.hostname.includes('supabase.co')) {
        throw new Error('Invalid Supabase URL domain');
      }
    } catch {
      throw new Error('Invalid Supabase URL format');
    }

    if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(key)) {
      throw new Error('Invalid Supabase anon key format');
    }

    return { url, key };
  }

  private isSecureContext(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.isSecureContext;
  }

  public getClient() {
    if (this.status === 'error') {
      throw new Error('Supabase client not available: ' + this.lastError?.message);
    }
    return this.client;
  }

  public getStatus() {
    return {
      status: this.status,
      error: this.lastError?.message,
      retries: this.retryCount
    };
  }

  public async reconnect() {
    try {
      if (this.status === 'error') {
        this.retryCount = 0;
        this.status = 'connecting';
        await this.validateConnection();
      }
    } catch (e) {
      console.error('Reconnection failed:', e);
      throw e;
    }
  }

  public static getInstance(): Db {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }
}

// Export singleton instance
const db = Db.getInstance();
export const sb = db.getClient();
export const getDbStatus = () => db.getStatus();
export const reconnectDb = () => db.reconnect();