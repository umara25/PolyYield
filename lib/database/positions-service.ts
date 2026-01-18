"use client"

import { supabase } from "./supabase"
import type { UserPosition, UserPositionInsert } from "./types"
import { Position } from "../solana/constants"

/**
 * Service layer for managing user positions in Supabase
 * Replaces the localStorage-based approach with persistent database storage
 */

export interface CreatePositionParams {
  walletAddress: string
  marketId: string
  marketQuestion: string
  position: Position
  amount: number
  transactionSignature?: string
  timestamp: number
  expiryTimestamp: number
}

/**
 * Fetch all positions for a given wallet address
 */
export async function getPositionsByWallet(
  walletAddress: string
): Promise<UserPosition[]> {
  const { data, error } = await supabase
    .from("user_positions")
    .select("*")
    .eq("wallet_address", walletAddress)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching positions:", error)
    throw new Error(`Failed to fetch positions: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new position record
 */
export async function createPosition(
  params: CreatePositionParams
): Promise<UserPosition> {
  const positionData: UserPositionInsert = {
    wallet_address: params.walletAddress,
    market_id: params.marketId,
    market_question: params.marketQuestion,
    position: params.position === Position.Yes ? "YES" : "NO",
    amount: params.amount,
    transaction_signature: params.transactionSignature || null,
    timestamp: new Date(params.timestamp).toISOString(),
    expiry_timestamp: new Date(params.expiryTimestamp).toISOString(),
    status: "active",
  }

  const { data, error } = await supabase
    .from("user_positions")
    .insert(positionData)
    .select()
    .single()

  if (error) {
    console.error("Error creating position:", error)
    throw new Error(`Failed to create position: ${error.message}`)
  }

  return data
}

/**
 * Update a position status (e.g., when claimed or refunded)
 */
export async function updatePositionStatus(
  positionId: string,
  status: "active" | "claimed" | "refunded"
): Promise<UserPosition> {
  const { data, error } = await supabase
    .from("user_positions")
    .update({ status })
    .eq("id", positionId)
    .select()
    .single()

  if (error) {
    console.error("Error updating position status:", error)
    throw new Error(`Failed to update position: ${error.message}`)
  }

  return data
}

/**
 * Get active positions for a wallet (not claimed or refunded)
 */
export async function getActivePositions(
  walletAddress: string
): Promise<UserPosition[]> {
  const { data, error } = await supabase
    .from("user_positions")
    .select("*")
    .eq("wallet_address", walletAddress)
    .eq("status", "active")
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching active positions:", error)
    throw new Error(`Failed to fetch active positions: ${error.message}`)
  }

  return data || []
}

/**
 * Get positions for a specific market
 */
export async function getPositionsByMarket(
  marketId: string
): Promise<UserPosition[]> {
  const { data, error } = await supabase
    .from("user_positions")
    .select("*")
    .eq("market_id", marketId)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching market positions:", error)
    throw new Error(`Failed to fetch market positions: ${error.message}`)
  }

  return data || []
}

/**
 * Delete a position (use with caution)
 */
export async function deletePosition(positionId: string): Promise<void> {
  const { error } = await supabase
    .from("user_positions")
    .delete()
    .eq("id", positionId)

  if (error) {
    console.error("Error deleting position:", error)
    throw new Error(`Failed to delete position: ${error.message}`)
  }
}

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== "your_supabase_project_url_here" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== "your_supabase_anon_key_here"
  )
}
