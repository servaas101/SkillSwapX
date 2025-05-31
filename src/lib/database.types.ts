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
      badges: {
        Row: {
          id: string
          nam: string
          dsc: string | null
          img: string | null
          typ: string
          lvl: number
          exp: string | null
          cdt: string
          udt: string
          met: Json | null
        }
        Insert: {
          id?: string
          nam: string
          dsc?: string | null
          img?: string | null
          typ: string
          lvl?: number
          exp?: string | null
          cdt?: string
          udt?: string
          met?: Json | null
        }
        Update: {
          id?: string
          nam?: string
          dsc?: string | null
          img?: string | null
          typ?: string
          lvl?: number
          exp?: string | null
          cdt?: string
          udt?: string
          met?: Json | null
        }
      }
      user_badges: {
        Row: {
          id: string
          uid: string
          bid: string
          iss: string
          sta: string
          prf: Json | null
          cdt: string
          udt: string
          vrf: string | null
          exp: string | null
          hsh: string | null
          pub: boolean
        }
        Insert: {
          id?: string
          uid: string
          bid: string
          iss: string
          sta?: string
          prf?: Json | null
          cdt?: string
          udt?: string
          vrf?: string | null
          exp?: string | null
          hsh?: string | null
          pub?: boolean
        }
        Update: {
          id?: string
          uid?: string
          bid?: string
          iss?: string
          sta?: string
          prf?: Json | null
          cdt?: string
          udt?: string
          vrf?: string | null
          exp?: string | null
          hsh?: string | null
          pub?: boolean
        }
      }
      verifications: {
        Row: {
          id: string
          ubg: string
          vby: string
          typ: string
          sta: string
          prf: Json | null
          cdt: string
          met: Json | null
        }
        Insert: {
          id?: string
          ubg: string
          vby: string
          typ: string
          sta: string
          prf?: Json | null
          cdt?: string
          met?: Json | null
        }
        Update: {
          id?: string
          ubg?: string
          vby?: string
          typ?: string
          sta?: string
          prf?: Json | null
          cdt?: string
          met?: Json | null
        }
      }
      achievements: {
        Row: {
          id: string
          hsh: string
          typ: string
          lvl: number
          dat: Json
          cdt: string
          exp: string | null
        }
        Insert: {
          id?: string
          hsh: string
          typ: string
          lvl?: number
          dat: Json
          cdt?: string
          exp?: string | null
        }
        Update: {
          id?: string
          hsh?: string
          typ?: string
          lvl?: number
          dat?: Json
          cdt?: string
          exp?: string | null
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
      create_badge: {
        Args: {
          p_nam: string
          p_dsc: string
          p_img: string
          p_typ: string
          p_lvl?: number
          p_exp?: string
          p_met?: Json
        }
        Returns: string
      }
      issue_badge: {
        Args: {
          p_uid: string
          p_bid: string
          p_prf?: Json
          p_exp?: string
          p_pub?: boolean
        }
        Returns: string
      }
      verify_badge: {
        Args: {
          p_ubg: string
          p_typ: string
          p_sta: string
          p_prf?: Json
          p_met?: Json
        }
        Returns: string
      }
      create_achievement: {
        Args: {
          p_typ: string
          p_lvl: number
          p_dat: Json
          p_exp?: string
        }
        Returns: string
      }
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