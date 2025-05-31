export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          uid: string
          em: string | null
          fn: string | null
          ln: string | null
          bio: string | null
          img: string | null
          ph: string | null
          loc: string | null
          cdt: string
          udt: string
          set: Json | null
          gdp: boolean
          gdl: string | null
        }
        Insert: {
          id?: string
          uid: string
          em?: string | null
          fn?: string | null
          ln?: string | null
          bio?: string | null
          img?: string | null
          ph?: string | null
          loc?: string | null
          cdt?: string
          udt?: string
          set?: Json | null
          gdp?: boolean
          gdl?: string | null
        }
        Update: {
          id?: string
          uid?: string
          em?: string | null
          fn?: string | null
          ln?: string | null
          bio?: string | null
          img?: string | null
          ph?: string | null
          loc?: string | null
          cdt?: string
          udt?: string
          set?: Json | null
          gdp?: boolean
          gdl?: string | null
        }
      }
      consent_logs: {
        Row: {
          id: string
          uid: string
          typ: string
          dat: Json
          ts: string
          ip: string | null
        }
        Insert: {
          id?: string
          uid: string
          typ: string
          dat: Json
          ts?: string
          ip?: string | null
        }
        Update: {
          id?: string
          uid?: string
          typ?: string
          dat?: Json
          ts?: string
          ip?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile: {
        Args: {
          p_uid: string
        }
        Returns: {
          id: string
          uid: string
          em: string | null
          fn: string | null
          ln: string | null
          bio: string | null
          img: string | null
          ph: string | null
          loc: string | null
          cdt: string
          udt: string
          set: Json | null
          gdp: boolean
        }[]
      }
      log_consent: {
        Args: {
          p_uid: string
          p_typ: string
          p_dat: Json
          p_ip: string
        }
        Returns: string
      }
      delete_user_data: {
        Args: {
          p_uid: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}