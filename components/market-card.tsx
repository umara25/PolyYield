"use client"

import { useState } from "react"
import { Calendar, TrendingUp, ExternalLink } from "lucide-react"
import { Button } from "./ui/button"
import { DepositModal } from "./deposit-modal"
import Image from "next/image"

import type { Market } from "@/lib/types/polymarket"

interface MarketCardProps {
  market: Market
}

export function MarketCard({ market }: MarketCardProps) {
  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no" | null>(null)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)

  // Use actual prices if available, otherwise calculate from pools
  const yesPercentage = market.yesPrice 
    ? Math.round(market.yesPrice * 100) 
    : Math.round((market.yesPool / market.totalPool) * 100)
  const noPercentage = market.noPrice 
    ? Math.round(market.noPrice * 100) 
    : 100 - yesPercentage

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value}`
  }

  const polymarketUrl = market.slug 
    ? `https://polymarket.com/event/${market.slug}` 
    : "https://polymarket.com"

  const handleDepositClick = () => {
    if (selectedPosition) {
      setIsDepositModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsDepositModalOpen(false)
  }

  // Get current odds for the selected position
  const getCurrentOdds = () => {
    if (selectedPosition === "yes") return yesPercentage
    if (selectedPosition === "no") return noPercentage
    return 0
  }

  return (
    <>
      <div className="bg-[#0a0a0a] border border-border/50 p-6 hover:border-primary/30 transition-all duration-300 group relative">
        {/* Market image */}
        {market.image && (
          <div className="absolute top-4 right-4 w-10 h-10 rounded-full overflow-hidden border border-border/30 opacity-60 group-hover:opacity-100 transition-opacity">
            <Image
              src={market.image}
              alt=""
              width={40}
              height={40}
              className="object-cover"
              unoptimized
            />
          </div>
        )}
        
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-xs text-primary uppercase tracking-wider px-2 py-1 bg-primary/10 border border-primary/20">
            {market.category}
          </span>
          <a 
            href={polymarketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-foreground/40 hover:text-primary"
            title="View on Polymarket"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        <h3 className="text-lg font-sentient mb-6 leading-tight min-h-[56px] pr-12">{market.question}</h3>

        {/* Prediction bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono mb-2">
            <span className="text-emerald-400">Yes {yesPercentage}%</span>
            <span className="text-rose-400">No {noPercentage}%</span>
          </div>
          <div className="h-2 bg-[#1a1a1a] flex overflow-hidden">
            <div className="bg-emerald-500/80 transition-all duration-500" style={{ width: `${yesPercentage}%` }} />
            <div className="bg-rose-500/80 transition-all duration-500" style={{ width: `${noPercentage}%` }} />
          </div>
        </div>

        {/* Position buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => setSelectedPosition("yes")}
            className={`py-3 font-mono text-sm uppercase transition-all duration-200 border ${
              selectedPosition === "yes"
                ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                : "border-border/50 text-foreground/60 hover:border-emerald-500/50 hover:text-emerald-400"
            }`}
          >
            Predict Yes
          </button>
          <button
            onClick={() => setSelectedPosition("no")}
            className={`py-3 font-mono text-sm uppercase transition-all duration-200 border ${
              selectedPosition === "no"
                ? "bg-rose-500/20 border-rose-500 text-rose-400"
                : "border-border/50 text-foreground/60 hover:border-rose-500/50 hover:text-rose-400"
            }`}
          >
            Predict No
          </button>
        </div>

        {/* Market info */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-foreground/40">
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="font-mono text-xs">{formatCurrency(market.totalPool)}</span>
            </div>
            {market.volume && market.volume > 0 && (
              <div className="flex items-center gap-1.5 text-foreground/40">
                <span className="font-mono text-xs text-emerald-500/70">{formatCurrency(market.volume)} vol</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-foreground/40">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{market.endDate}</span>
          </div>
        </div>

        {/* Deposit button (appears when position selected) */}
        {selectedPosition && (
          <Button 
            className="w-full mt-4" 
            size="sm"
            onClick={handleDepositClick}
          >
            [Deposit to {selectedPosition === "yes" ? "Yes" : "No"}]
          </Button>
        )}
      </div>

      {/* Deposit Modal */}
      {selectedPosition && (
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={handleCloseModal}
          marketId={market.id}
          marketQuestion={market.question}
          position={selectedPosition}
          currentOdds={getCurrentOdds()}
        />
      )}
    </>
  )
}
