"use client"

import { useState, useEffect } from "react"
import { X, Loader2, CheckCircle, ExternalLink, AlertCircle, Wallet } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useDeposit } from "@/hooks/use-deposit"
import { Position } from "@/lib/solana/constants"
import { Button } from "./ui/button"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  marketId: string
  marketQuestion: string
  position: "yes" | "no"
  currentOdds: number
}

export function DepositModal({
  isOpen,
  onClose,
  marketId,
  marketQuestion,
  position,
  currentOdds,
}: DepositModalProps) {
  const [amount, setAmount] = useState("")
  const { connected, publicKey } = useWallet()
  const { setVisible } = useWalletModal()
  const {
    isLoading,
    error,
    txSignature,
    usdcBalance,
    deposit,
    refreshBalance,
    clearError,
    clearTx,
  } = useDeposit()

  // Refresh balance when modal opens or wallet connects
  useEffect(() => {
    if (isOpen && connected) {
      refreshBalance()
    }
  }, [isOpen, connected, refreshBalance])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setAmount("")
      clearError()
      clearTx()
    }
  }, [isOpen, clearError, clearTx])

  if (!isOpen) return null

  const numericAmount = parseFloat(amount) || 0
  const positionEnum = position === "yes" ? Position.Yes : Position.No
  const potentialPayout = numericAmount > 0 ? numericAmount / (currentOdds / 100) : 0
  const potentialProfit = potentialPayout - numericAmount

  const handleDeposit = async () => {
    if (numericAmount <= 0) return
    await deposit(numericAmount, marketId, positionEnum)
  }

  const handleConnectWallet = () => {
    setVisible(true)
  }

  const handleMaxClick = () => {
    setAmount(usdcBalance.toFixed(2))
  }

  const solscanUrl = txSignature
    ? `https://solscan.io/tx/${txSignature}?cluster=devnet`
    : null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0a0a0a] border border-border/50 w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground/40 hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`font-mono text-sm uppercase px-2 py-0.5 border ${
              position === "yes" 
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" 
                : "text-rose-400 border-rose-500/30 bg-rose-500/10"
            }`}>
              Predict {position}
            </span>
            <span className="font-mono text-xs text-foreground/40">
              @ {currentOdds}%
            </span>
          </div>
          <h3 className="text-lg font-sentient leading-tight line-clamp-2">
            {marketQuestion}
          </h3>
        </div>

        {/* Success State */}
        {txSignature && (
          <div className="space-y-4">
            <div className="flex flex-col items-center text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
              <h4 className="font-mono text-lg text-emerald-400 mb-2">
                Deposit Successful!
              </h4>
              <p className="text-foreground/60 text-sm mb-4">
                Your {numericAmount.toFixed(2)} USDC has been deposited to the {position.toUpperCase()} position.
              </p>
              {solscanUrl && (
                <a
                  href={solscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-primary hover:text-primary/80 font-mono text-sm"
                >
                  View on Solscan
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        )}

        {/* Main Form */}
        {!txSignature && (
          <>
            {/* Not Connected State */}
            {!connected && (
              <div className="flex flex-col items-center text-center py-8">
                <Wallet className="w-12 h-12 text-foreground/30 mb-4" />
                <p className="text-foreground/60 text-sm mb-4">
                  Connect your wallet to make a deposit
                </p>
                <Button onClick={handleConnectWallet}>
                  Connect Wallet
                </Button>
              </div>
            )}

            {/* Connected State */}
            {connected && (
              <div className="space-y-4">
                {/* Balance Display */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground/60 font-mono">Available Balance</span>
                  <span className="font-mono text-foreground">
                    {usdcBalance.toFixed(2)} USDC
                  </span>
                </div>

                {/* Amount Input */}
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full bg-[#1a1a1a] border border-border/50 px-4 py-3 pr-20 font-mono text-lg focus:outline-none focus:border-primary/50 transition-colors"
                    disabled={isLoading}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={handleMaxClick}
                      className="text-xs font-mono text-primary hover:text-primary/80 px-2 py-1 border border-primary/30 hover:border-primary/50 transition-colors"
                      disabled={isLoading}
                    >
                      MAX
                    </button>
                    <span className="font-mono text-foreground/40 text-sm">USDC</span>
                  </div>
                </div>

                {/* Potential Payout */}
                {numericAmount > 0 && (
                  <div className="bg-[#1a1a1a] border border-border/30 p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60 font-mono">Your Stake</span>
                      <span className="font-mono">{numericAmount.toFixed(2)} USDC</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/60 font-mono">If {position.toUpperCase()} wins</span>
                      <span className="font-mono text-emerald-400">
                        +{potentialProfit.toFixed(2)} USDC
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-border/30 pt-2">
                      <span className="text-foreground/60 font-mono">Potential Payout</span>
                      <span className="font-mono text-foreground font-medium">
                        {potentialPayout.toFixed(2)} USDC
                      </span>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/30 p-3 text-rose-400">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-mono">{error}</p>
                  </div>
                )}

                {/* Deposit Button */}
                <Button
                  onClick={handleDeposit}
                  disabled={isLoading || numericAmount <= 0 || numericAmount > usdcBalance}
                  className="w-full"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    `Deposit ${numericAmount > 0 ? numericAmount.toFixed(2) : ""} USDC`
                  )}
                </Button>

                {/* Devnet Notice */}
                <p className="text-xs text-foreground/40 font-mono text-center">
                  Connected to Devnet • Using test USDC
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
