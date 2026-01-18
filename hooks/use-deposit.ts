"use client"

import { useState, useCallback } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { 
  buildDepositTransaction, 
  buildInitializeTransaction,
  getUserUsdcBalance,
  isVaultInitialized,
  Position,
} from "@/lib/solana/deposit"
import { 
  createPosition, 
  isSupabaseConfigured 
} from "@/lib/database/positions-service"

export interface DepositState {
  isLoading: boolean
  error: string | null
  txSignature: string | null
  usdcBalance: number
}

export interface UseDepositReturn extends DepositState {
  deposit: (amount: number, marketId: string, position: Position, marketQuestion: string, expiryTimestamp: number) => Promise<string | null>
  refreshBalance: () => Promise<void>
  clearError: () => void
  clearTx: () => void
}

export function useDeposit(): UseDepositReturn {
  const { connection } = useConnection()
  const { publicKey, signTransaction, connected } = useWallet()
  
  const [state, setState] = useState<DepositState>({
    isLoading: false,
    error: null,
    txSignature: null,
    usdcBalance: 0,
  })

  const refreshBalance = useCallback(async () => {
    if (!publicKey) {
      setState(prev => ({ ...prev, usdcBalance: 0 }))
      return
    }

    try {
      const balance = await getUserUsdcBalance(connection, publicKey)
      setState(prev => ({ ...prev, usdcBalance: balance }))
    } catch (err) {
      console.error("Failed to fetch USDC balance:", err)
    }
  }, [connection, publicKey])

  const deposit = useCallback(async (
    amount: number,
    marketId: string,
    position: Position,
    marketQuestion: string,
    expiryTimestamp: number
  ): Promise<string | null> => {
    if (!publicKey || !signTransaction || !connected) {
      setState(prev => ({ 
        ...prev, 
        error: "Please connect your wallet first" 
      }))
      return null
    }

    if (amount <= 0) {
      setState(prev => ({ 
        ...prev, 
        error: "Amount must be greater than 0" 
      }))
      return null
    }

    if (amount > state.usdcBalance) {
      setState(prev => ({ 
        ...prev, 
        error: `Insufficient USDC balance. You have ${state.usdcBalance.toFixed(2)} USDC` 
      }))
      return null
    }

    setState(prev => ({ 
      ...prev, 
      isLoading: true, 
      error: null, 
      txSignature: null 
    }))

    try {
      // Check if vault is initialized
      const vaultReady = await isVaultInitialized(connection)
      
      if (!vaultReady) {
        // Initialize the vault first
        console.log("Vault not initialized, initializing...")
        try {
          const initTx = await buildInitializeTransaction(connection, publicKey)
          const signedInitTx = await signTransaction(initTx)
          
          const initSignature = await connection.sendRawTransaction(
            signedInitTx.serialize(),
            { skipPreflight: true, preflightCommitment: "confirmed" }
          )
          
          await connection.confirmTransaction(initSignature, "confirmed")
          console.log("Vault initialized:", initSignature)
        } catch (initError) {
          console.error("Vault initialization failed:", initError)
          throw new Error(`Vault initialization failed: ${initError instanceof Error ? initError.message : 'Unknown error'}`)
        }
      }

      // Build the deposit transaction
      const { transaction } = await buildDepositTransaction({
        connection,
        userPublicKey: publicKey,
        amount,
        marketId,
        position,
      })

      // Sign the transaction with user's wallet (Phantom)
      const signedTransaction = await signTransaction(transaction)

      // Send the transaction
      const signature = await connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        }
      )

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      )

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`)
      }

      // Save position to database if Supabase is configured
      const supabaseConfigured = isSupabaseConfigured()
      if (supabaseConfigured) {
        try {
          await createPosition({
            walletAddress: publicKey.toBase58(),
            marketId,
            marketQuestion,
            position,
            amount,
            transactionSignature: signature,
            timestamp: Date.now(),
            expiryTimestamp,
          })
          console.log("Position saved to database successfully")
        } catch (dbError) {
          console.error("Failed to save position to database:", dbError)
          // Don't fail the whole transaction if database save fails
          // User can still see their transaction on-chain
        }
      } else {
        console.warn("Supabase not configured. Position not saved to database. Please set up .env.local")
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        txSignature: signature 
      }))

      // Refresh balance after successful deposit
      await refreshBalance()

      return signature
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Deposit failed"
      console.error("Deposit error:", err)
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }))
      return null
    }
  }, [connection, publicKey, signTransaction, connected, state.usdcBalance, refreshBalance])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const clearTx = useCallback(() => {
    setState(prev => ({ ...prev, txSignature: null }))
  }, [])

  return {
    ...state,
    deposit,
    refreshBalance,
    clearError,
    clearTx,
  }
}
