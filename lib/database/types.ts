// Database types for Supabase tables
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
      user_positions: {
        Row: {
          id: string
          wallet_address: string
          market_id: string
          market_question: string
          position: "YES" | "NO"
          amount: number
          transaction_signature: string | null
          timestamp: string
          expiry_timestamp: string
          status: "active" | "claimed" | "refunded"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          wallet_address: string
          market_id: string
          market_question: string
          position: "YES" | "NO"
          amount: number
          transaction_signature?: string | null
          timestamp: string
          expiry_timestamp: string
          status?: "active" | "claimed" | "refunded"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          wallet_address?: string
          market_id?: string
          market_question?: string
          position?: "YES" | "NO"
          amount?: number
          transaction_signature?: string | null
          timestamp?: string
          expiry_timestamp?: string
          status?: "active" | "claimed" | "refunded"
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Type aliases for easier use
export type UserPosition = Database["public"]["Tables"]["user_positions"]["Row"]
export type UserPositionInsert = Database["public"]["Tables"]["user_positions"]["Insert"]
export type UserPositionUpdate = Database["public"]["Tables"]["user_positions"]["Update"]
