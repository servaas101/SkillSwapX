import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Connection retry configuration
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // ms

export class Db {
  private static instance: Db;
  private client: ReturnType<typeof createClient<Database>>;
  private env: {
    url: string;
    key: string;
    status: 'connecting' | 'connected' | 'error';
    lastError?: Error;
  };

  private constructor() {
    this.env = this.loadConfig();
    this.env.status = 'connecting';
    
    this.client = createClient<Database>(this.env.url, this.env.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: {
          // Use secure storage based on environment
          getItem: (key) => {
            try {
              const storage = this.isSecureContext() ? localStorage : sessionStorage;
              return JSON.parse(storage.getItem(key) || '');
            } catch {
              return null;
            }
          },
          setItem: (key, value) => {
            const storage = this.isSecureContext() ? localStorage : sessionStorage;
            storage.setItem(key, JSON.stringify(value));
          },
          removeItem: (key) => {
            const storage = this.isSecureContext() ? localStorage : sessionStorage;
            storage.removeItem(key);
          }
        }
      },
      global: {
        headers: {
          'x-client-info': 'skillswapx-identity@0.1.0'
        }
      }
    });
    
    this.validateConnection();
  }

  private async validateConnection() {
    let attempts = 0;
    
    while (attempts < RETRY_ATTEMPTS) {
      try {
        // Test connection with a simple query
        const { error } = await this.client
          .from('profiles')
          .select('id')
          .limit(1);
          
        if (error) throw error;
        
        this.env.status = 'connected';
        return;
      } catch (e) {
        attempts++;
        this.env.lastError = e as Error;
        
        if (attempts < RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        }
      }
    }
    
    this.env.status = 'error';
    console.error('Failed to connect to Supabase:', this.env.lastError);
  }

  private isSecureContext(): boolean {
    return typeof window !== 'undefined' && window.isSecureContext;
  }

  private loadConfig() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing Supabase configuration. Check your environment variables.'
      );
    }

    // Validate URL format
    try {
      const parsedUrl = new URL(url);
      if (!parsedUrl.hostname.includes('supabase.co')) {
        throw new Error('Invalid Supabase URL domain');
      }
    } catch {
      throw new Error('Invalid Supabase URL format');
    }

    // Validate key format (should be a JWT-like string)
    if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(key)) {
      throw new Error('Invalid Supabase anon key format');
    }

    return { url, key, status: 'connecting' as const };
  }

  public static getInstance(): Db {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }

  public getClient() {
    if (this.env.status === 'error') {
      throw new Error('Supabase client not available: Connection failed');
    }
    return this.client;
  }

  public getStatus() {
    return {
      status: this.env.status,
      error: this.env.lastError?.message
    };
  }
}

// Export singleton instance
const db = Db.getInstance();
export const sb = db.getClient();
export const getDbStatus = () => db.getStatus();