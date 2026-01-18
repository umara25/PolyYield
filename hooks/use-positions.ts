"use client"

import { useState, useEffect, useCallback } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Position } from "@/lib/solana/constants"
import { 
  getPositionsByWallet,
  isSupabaseConfigured 
} from "@/lib/database/positions-service"
import type { UserPosition as DbUserPosition } from "@/lib/database/types"

export interface UserPosition {
  id: string
  marketId: string
  marketQuestion: string
  position: Position
  amount: number
  timestamp: number
  expiryTimestamp: number
  status: "active" | "claimed" | "refunded"
}

// Mock APY for yield calculation (e.g., 12%)
const MOCK_APY = 0.12

// Convert database position to UI position format
function convertDbPositionToUi(dbPosition: DbUserPosition): UserPosition {
  return {
    id: dbPosition.id,
    marketId: dbPosition.market_id,
    marketQuestion: dbPosition.market_question,
    position: dbPosition.position === "YES" ? Position.Yes : Position.No,
    amount: Number(dbPosition.amount),
    timestamp: new Date(dbPosition.timestamp).getTime(),
    expiryTimestamp: new Date(dbPosition.expiry_timestamp).getTime(),
    status: dbPosition.status,
  }
}

export function usePositions() {
  const { publicKey } = useWallet()
  const [positions, setPositions] = useState<UserPosition[]>([])
  const [totalYield, setTotalYield] = useState(0)
  const [totalValue, setTotalValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useLocalStorage, setUseLocalStorage] = useState(false)

  // Check if Supabase is configured, otherwise fall back to localStorage
  useEffect(() => {
    const configured = isSupabaseConfigured()
    setUseLocalStorage(!configured)
    if (!configured) {
      console.warn("Supabase not configured. Falling back to localStorage. Please set up .env.local with Supabase credentials.")
    }
  }, [])

  // Load positions from Supabase or localStorage
  const loadPositions = useCallback(async () => {
    if (!publicKey) {
      setPositions([])
      setTotalYield(0)
      setTotalValue(0)
      return
    }

    setIsLoading(true)
    setError(null)

      try {
      if (useLocalStorage) {
        // Fallback to localStorage if Supabase not configured
        const stored = localStorage.getItem(`polyield_positions_${publicKey.toBase58()}`)
        if (stored) {
          const parsed = JSON.parse(stored)
          setPositions(parsed)
          calculateTotals(parsed)
        } else {
          setPositions([])
        }
      } else {
        // Use Supabase database
        const dbPositions = await getPositionsByWallet(publicKey.toBase58())
        const uiPositions = dbPositions.map(convertDbPositionToUi)
        setPositions(uiPositions)
        calculateTotals(uiPositions)
      }
    } catch (e) {
        console.error("Failed to load positions", e)
      setError(e instanceof Error ? e.message : "Failed to load positions")
      setPositions([])
    } finally {
      setIsLoading(false)
    }
  }, [publicKey, useLocalStorage])

  useEffect(() => {
    loadPositions()
  }, [loadPositions])

  const calculateTotals = (currentPositions: UserPosition[]) => {
    const now = Date.now()
    let yieldSum = 0
    let valueSum = 0

    currentPositions.forEach(pos => {
      // Calculate yield: Principal * APY * (TimeDelta in Years)
      const timeDiff = now - pos.timestamp
      const yearsElapsed = timeDiff / (1000 * 60 * 60 * 24 * 365)
      
      // In this model, assume yield is generated continuously
      // For winners, they get a share of total yield. 
      // For this demo, we'll simulate a projected yield based on the mock APY.
      const estimatedYield = pos.amount * MOCK_APY * yearsElapsed
      
      if (pos.status === "active") {
        yieldSum += estimatedYield
        valueSum += pos.amount
      }
    })

    setTotalYield(yieldSum)
    setTotalValue(valueSum)
  }

  const addPosition = async (
    marketId: string, 
    marketQuestion: string, 
    position: Position, 
    amount: number,
    expiryTimestamp: number,
    transactionSignature?: string
  ) => {
    if (!publicKey) return

    try {
      if (useLocalStorage) {
        // Fallback to localStorage
    const newPosition: UserPosition = {
      id: Math.random().toString(36).substring(7),
      marketId,
      marketQuestion,
      position,
      amount,
      timestamp: Date.now(),
      expiryTimestamp,
      status: "active"
    }

    const updated = [...positions, newPosition]
    setPositions(updated)
    calculateTotals(updated)
    
    localStorage.setItem(
      `polyield_positions_${publicKey.toBase58()}`, 
      JSON.stringify(updated)
    )
      } else {
        // Use Supabase database - will be added by use-deposit hook
        // This will trigger a refresh to load the newly added position
        await loadPositions()
      }
    } catch (e) {
      console.error("Failed to add position", e)
      setError(e instanceof Error ? e.message : "Failed to add position")
    }
  }

  return {
    positions,
    totalYield,
    totalValue,
    addPosition,
    isLoading,
    error,
    refreshPositions: loadPositions,
    apy: MOCK_APY
  }
}
