"use client"

import { useState, useEffect } from "react"
import { X, Loader2, CheckCircle, ExternalLink, AlertCircle, Wallet, Shield, TrendingUp, RefreshCw } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useDeposit } from "@/hooks/use-deposit"
import { usePositions } from "@/hooks/use-positions"
import { Position } from "@/lib/solana/constants"
import { Button } from "./ui/button"

interface DepositModalProps {
  isOpen: boolean
  onClose: () => void
  marketId: string
  marketQuestion: string
  marketExpiry: string
  position: "yes" | "no"
  currentOdds: number
}

export function DepositModal({
  isOpen,
  onClose,
  marketId,
  marketQuestion,
  marketExpiry,
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
  const { addPosition } = usePositions()

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

    // Parse expiry string to timestamp, fallback to 30 days from now
    const expiryTimestamp = marketExpiry
      ? new Date(marketExpiry).getTime()
      : Date.now() + (30 * 24 * 60 * 60 * 1000)

    const signature = await deposit(
      numericAmount,
      marketId,
      positionEnum,
      marketQuestion,
      expiryTimestamp
    )

    if (signature) {
      // If using localStorage fallback, also add to local state
      addPosition(marketId, marketQuestion, positionEnum, numericAmount, expiryTimestamp, signature)
    }
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
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`font-mono text-sm uppercase px-2 py-0.5 border ${position === "yes"
                ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                : "text-rose-400 border-rose-500/30 bg-rose-500/10"
              }`}>
              Predict {position} @ {currentOdds}%
            </span>
            <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 border border-amber-500/30 bg-amber-500/10 text-amber-400 flex items-center gap-1 ml-auto">
              <Shield className="w-2.5 h-2.5" />
              No-Loss
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
              <div className="relative mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-400" />
                <Shield className="w-5 h-5 text-emerald-400 absolute -bottom-1 -right-1 bg-[#0a0a0a] rounded-full p-0.5" />
              </div>
              <h4 className="font-mono text-lg text-emerald-400 mb-2">
                Position Secured!
              </h4>
              <p className="text-foreground/60 text-sm mb-2">
                {numericAmount.toFixed(2)} USDC deposited on {position.toUpperCase()}
              </p>
              <div className="flex items-center gap-1.5 text-emerald-400/80 text-xs font-mono mb-4">
                <Shield className="w-3.5 h-3.5" />
                Your principal is protected
              </div>
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

                {/* No-Loss Guarantee Banner */}
                <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 px-3 py-2">
                  <Shield className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <p className="text-xs font-mono text-emerald-400/90">
                    Principal Protected — You cannot lose your stake
                  </p>
                </div>

                {/* Potential Outcomes */}
                {numericAmount > 0 && (
                  <div className="bg-[#1a1a1a] border border-border/30 p-4 space-y-3">
                    {/* Your Stake */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground/60 font-mono flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
                        Your Stake (Protected)
                      </span>
                      <span className="font-mono">{numericAmount.toFixed(2)} USDC</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-border/30" />

                    {/* If You Win */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground/60 font-mono flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500/60" />
                        If {position.toUpperCase()} wins
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 font-medium">
                          +{potentialProfit.toFixed(2)} USDC
                        </span>
                        <p className="text-[10px] text-foreground/40 font-mono">yield profit</p>
                      </div>
                    </div>

                    {/* If You Lose */}
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-foreground/60 font-mono flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500/60" />
                        If {position.toUpperCase()} loses
                      </span>
                      <div className="text-right">
                        <span className="font-mono text-amber-400">
                          {numericAmount.toFixed(2)} USDC
                        </span>
                        <p className="text-[10px] text-foreground/40 font-mono">full refund</p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-border/30 pt-3 mt-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground/60 font-mono">Max Payout</span>
                        <span className="font-mono text-foreground font-medium">
                          {potentialPayout.toFixed(2)} USDC
                        </span>
                      </div>
                      <p className="text-[10px] text-foreground/40 font-mono mt-1">
                        Stake + Yield if your prediction is correct
                      </p>
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
