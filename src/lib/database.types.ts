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
      projects: {
        Row: {
          id: string
          uid: string
          org: string
          ttl: string
          dsc: string | null
          img: string | null
          skl: Json | null
          bgt: Json | null
          sts: string
          str: string
          edt: string | null
          loc: string | null
          typ: string
          cdt: string
          udt: string
          met: Json | null
        }
        Insert: {
          id?: string
          uid: string
          org: string
          ttl: string
          dsc?: string | null
          img?: string | null
          skl?: Json | null
          bgt?: Json | null
          sts?: string
          str: string
          edt?: string | null
          loc?: string | null
          typ: string
          cdt?: string
          udt?: string
          met?: Json | null
        }
        Update: {
          id?: string
          uid?: string
          org?: string
          ttl?: string
          dsc?: string | null
          img?: string | null
          skl?: Json | null
          bgt?: Json | null
          sts?: string
          str?: string
          edt?: string | null
          loc?: string | null
          typ?: string
          cdt?: string
          udt?: string
          met?: Json | null
        }
      }
      applications: {
        Row: {
          id: string
          pid: string
          uid: string
          msg: string | null
          exp: Json | null
          sts: string
          cdt: string
          udt: string
        }
        Insert: {
          id?: string
          pid: string
          uid: string
          msg?: string | null
          exp?: Json | null
          sts?: string
          cdt?: string
          udt?: string
        }
        Update: {
          id?: string
          pid?: string
          uid?: string
          msg?: string | null
          exp?: Json | null
          sts?: string
          cdt?: string
          udt?: string
        }
      }
      mentorships: {
        Row: {
          id: string
          uid: string
          skl: string[]
          exp: number
          cap: number
          cur: number
          bio: string | null
          rte: Json | null
          avl: Json | null
          sts: string
          cdt: string
          udt: string
        }
        Insert: {
          id?: string
          uid: string
          skl: string[]
          exp: number
          cap: number
          cur?: number
          bio?: string | null
          rte?: Json | null
          avl?: Json | null
          sts?: string
          cdt?: string
          udt?: string
        }
        Update: {
          id?: string
          uid?: string
          skl?: string[]
          exp?: number
          cap?: number
          cur?: number
          bio?: string | null
          rte?: Json | null
          avl?: Json | null
          sts?: string
          cdt?: string
          udt?: string
        }
      }
      matches: {
        Row: {
          id: string
          mid: string
          uid: string
          gls: string[]
          dur: number
          sts: string
          cdt: string
          udt: string
        }
        Insert: {
          id?: string
          mid: string
          uid: string
          gls: string[]
          dur: number
          sts?: string
          cdt?: string
          udt?: string
        }
        Update: {
          id?: string
          mid?: string
          uid?: string
          gls?: string[]
          dur?: number
          sts?: string
          cdt?: string
          udt?: string
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
      create_project: {
        Args: {
          p_ttl: string
          p_dsc: string
          p_skl: Json
          p_bgt: Json
          p_str: string
          p_edt: string
          p_loc: string
          p_typ: string
          p_met?: Json
        }
        Returns: string
      }
      apply_project: {
        Args: {
          p_pid: string
          p_msg: string
          p_exp: Json
        }
        Returns: string
      }
      create_mentorship: {
        Args: {
          p_skl: string[]
          p_exp: number
          p_cap: number
          p_bio: string
          p_rte: Json
          p_avl: Json
        }
        Returns: string
      }
      request_mentorship: {
        Args: {
          p_mid: string
          p_gls: string[]
          p_dur: number
        }
        Returns: string
      }
      update_match_status: {
        Args: {
          p_id: string
          p_sts: string
        }
        Returns: void
      }
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
      store_encrypted: {
        Args: {
          p_typ: string
          p_dat: string
          p_iv: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}