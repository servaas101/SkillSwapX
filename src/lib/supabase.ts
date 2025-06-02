import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

export class Db {
  private static instance: Db;
  private client: ReturnType<typeof createClient<Database>>;
  private env: {
    url: string;
    key: string;
  };

  private constructor() {
    this.env = this.loadConfig();
    this.client = createClient<Database>(this.env.url, this.env.key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: {
          // Use secure cookie in production
          getItem: (key) => {
            try {
              return JSON.parse(sessionStorage.getItem(key) || '');
            } catch {
              return null;
            }
          },
          setItem: (key, value) => {
            sessionStorage.setItem(key, JSON.stringify(value));
          },
          removeItem: (key) => {
            sessionStorage.removeItem(key);
          }
        }
      }
    });
  }

  private loadConfig() {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      throw new Error(
        'Missing Supabase configuration. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.'
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new Error('Invalid Supabase URL format');
    }

    // Validate key format (should be a JWT-like string)
    if (!/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/.test(key)) {
      throw new Error('Invalid Supabase anon key format');
    }

    return { url, key };
  }

  public static getInstance(): Db {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }

  public getClient() {
    return this.client;
  }
}

// Export singleton instance
const db = Db.getInstance();
export const sb = db.getClient();