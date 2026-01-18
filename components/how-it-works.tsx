"use client"

import { ArrowRight, CircleDollarSign, PiggyBank, Trophy, Wallet, Users, Repeat } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import { useRouter } from "next/navigation"
import { Button } from "./ui/button"

const steps = [
  {
    number: "01",
    title: "Deposit USDC",
    description:
      "Connect your wallet and deposit funds into any prediction market. Your principal is locked and protected.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Make Your Prediction",
    description: "Choose your position on the market outcome. Will the Fed cut rates? Will Bitcoin hit $100K?",
    icon: CircleDollarSign,
  },
  {
    number: "03",
    title: "Yield Generation",
    description: "While the market is active, your deposit earns yield through DeFi lending protocols.",
    icon: PiggyBank,
  },
  {
    number: "04",
    title: "Collect Rewards",
    description:
      "Winners receive the yield. Losers get their full deposit back. Everyone wins (or at least doesn't lose).",
    icon: Trophy,
  },
]

export function HowItWorks() {
  const { connected } = useWallet()
  const { setVisible } = useWalletModal()
  const router = useRouter()

  const handleGetStarted = () => {
    if (connected) {
      router.push("/markets")
    } else {
      setVisible(true)
    }
  }

  return (
    <section id="how-it-works" className="py-24 border-t border-border/50 relative z-10">
      <div className="container">
        <div className="text-center mb-16">
          <span className="font-mono text-sm text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="text-4xl md:text-5xl font-sentient mt-4">
            Predict without <i className="font-light">risk</i>
          </h2>
          <p className="text-foreground/60 font-mono mt-4 max-w-xl mx-auto">
            Our no-lose mechanism ensures your principal is always safe while giving you the thrill of prediction
            markets.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {steps.map((step, index) => (
            <div key={step.number} className="relative group">
              <div className="bg-[#111]/80 border border-border/50 p-6 h-full hover:border-primary/50 transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-primary font-mono text-sm">{step.number}</span>
                  <step.icon className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-xl font-sentient mb-3">{step.title}</h3>
                <p className="text-sm text-foreground/50 font-mono leading-relaxed">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 w-4 h-4 text-border -translate-y-1/2" />
              )}
            </div>
          ))}
        </div>

        {/* The Flywheel Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="font-mono text-sm text-primary uppercase tracking-wider">The Flywheel Effect</span>
            <h3 className="text-3xl md:text-4xl font-sentient mt-4">
              Prizes scale with <i className="font-light">participation</i>
            </h3>
            <p className="text-foreground/60 font-mono mt-4 max-w-2xl mx-auto">
              More volume doesn't increase risk — it increases rewards. Popular markets automatically become more valuable.
            </p>
          </div>

          {/* Flywheel Visualization */}
          <div className="relative">
            <div className="bg-[#111]/80 border border-primary/30 p-8 md:p-12">
              {/* The Flywheel Title */}
              <div className="text-center mb-8">
                <h4 className="text-2xl font-sentient text-primary/90">The Flywheel</h4>
              </div>

              {/* Center Icon */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <Repeat className="w-12 h-12 text-primary animate-spin-slow" />
                  <div className="absolute inset-0 bg-primary/20 blur-xl" />
                </div>
              </div>

              {/* Flywheel Steps */}
              <div className="space-y-4">
                {[
                  { label: "More users", icon: Users },
                  { label: "More deposits", icon: Wallet },
                  { label: "More yield", icon: PiggyBank },
                  { label: "Bigger prizes", icon: Trophy },
                  { label: "More incentive to join", icon: ArrowRight },
                  { label: "More users", icon: Users, highlight: true },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 border border-border/50 flex items-center justify-center bg-background/50">
                      <item.icon className={`w-5 h-5 ${item.highlight ? 'text-primary' : 'text-foreground/60'}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-mono text-sm ${item.highlight ? 'text-primary font-medium' : 'text-foreground/80'}`}>
                        {item.label}
                      </p>
                    </div>
                    {index < 5 && (
                      <ArrowRight className="w-4 h-4 text-primary/40 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>

              {/* Yield Explanation */}
              <div className="mt-12 pt-8 border-t border-border/30">
                <div className="text-center mb-6">
                  <p className="font-mono text-xs text-foreground/60 uppercase tracking-wider mb-3">
                    How Yield is Generated
                  </p>
                  <div className="max-w-xl mx-auto bg-primary/5 border border-primary/20 p-4">
                    <p className="font-mono text-sm text-foreground/80 mb-2">
                      Pooled USDC deposits are lent on Solana DeFi protocols
                    </p>
                    <div className="flex items-center justify-center gap-2 text-emerald-400">
                      <PiggyBank className="w-4 h-4" />
                      <span className="font-mono text-lg font-medium">~12% APY</span>
                    </div>
                    <p className="font-mono text-xs text-foreground/50 mt-2">
                      (≈1% per month on pooled capital)
                    </p>
                  </div>
                </div>
              </div>

              {/* Example Comparison */}
              <div className="mt-8">
                <p className="font-mono text-xs text-foreground/60 uppercase tracking-wider mb-6 text-center">
                  Real Example: 30-Day Market
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Small Pool */}
                  <div className="bg-background/30 border border-border/30 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-foreground/40" />
                      <span className="font-mono text-xs text-foreground/60">10 users × $100</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="font-mono text-foreground/60">Pool Size</span>
                        <span className="font-mono text-foreground font-medium">$1,000</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 -mx-1">
                        <div className="flex justify-between items-baseline text-sm mb-1">
                          <span className="font-mono text-foreground/60">Yield Generated</span>
                          <span className="font-mono text-emerald-400">~$10</span>
                        </div>
                        <p className="text-[10px] text-foreground/40 font-mono">
                          $1,000 × 12% APY × (30/365) days
                        </p>
                      </div>
                      <div className="pt-2 border-t border-border/20">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-mono text-xs text-foreground/50">If You Win</span>
                          <div className="text-right">
                            <span className="font-mono text-emerald-400 text-base font-medium">+$2</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-foreground/40 font-mono text-right">
                          $10 yield ÷ 5 winners = $2 each
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Large Pool */}
                  <div className="bg-primary/5 border border-primary/30 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="font-mono text-xs text-primary">1,000 users × $100</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-baseline text-sm">
                        <span className="font-mono text-foreground/60">Pool Size</span>
                        <span className="font-mono text-foreground font-medium">$100,000</span>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 -mx-1">
                        <div className="flex justify-between items-baseline text-sm mb-1">
                          <span className="font-mono text-foreground/60">Yield Generated</span>
                          <span className="font-mono text-emerald-400 font-medium">~$1,000</span>
                        </div>
                        <p className="text-[10px] text-primary/60 font-mono">
                          $100,000 × 12% APY × (30/365) days
                        </p>
                      </div>
                      <div className="pt-2 border-t border-primary/20">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-mono text-xs text-foreground/50">If You Win</span>
                          <div className="text-right">
                            <span className="font-mono text-emerald-400 text-base font-medium">+$2</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-primary/60 font-mono text-right">
                          $1,000 yield ÷ 500 winners = $2 each
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 text-center space-y-2">
                  <p className="font-mono text-xs text-primary/80">
                    100x more users = 100x larger prize pool · Same zero risk
                  </p>
                  <p className="font-mono text-xs text-foreground/50 italic">
                    Longer markets = more time earning yield = bigger prizes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Insight */}
          <div className="mt-8 text-center">
            <p className="text-foreground/70 font-mono text-sm italic max-w-2xl mx-auto">
              "Markets that matter most automatically become the most rewarding — without anyone taking on more risk."
            </p>
          </div>

          {/* CTA Button */}
          <div className="mt-12 text-center">
            <Button
              onClick={handleGetStarted}
              className="font-mono px-8 py-6 text-base"
            >
              {connected ? "Start Predicting" : "Connect Wallet to Get Started"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
