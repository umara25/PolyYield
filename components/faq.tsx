"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
    {
        question: "What is PolyYield?",
        answer:
            "PolyYield is a no-lose prediction market platform built on Solana. You deposit USDC to predict market outcomes, and your principal is always protected. Winners earn yield from DeFi lending, while losers get their full deposit back.",
    },
    {
        question: "How can I not lose my money?",
        answer:
            "Your deposited USDC is held in a secure vault and lent to Solana DeFi protocols to generate yield. The yield is the prize pool. When the market resolves, winners share the yield, and losers get their full principal back. You literally cannot lose your initial deposit.",
    },
    {
        question: "Where does the yield come from?",
        answer:
            "All deposits are pooled and lent on Solana DeFi lending protocols like Solend or Marginfi, earning approximately 12% APY. This yield becomes the prize pool that winners share. Currently, we simulate this at 12% APY for demonstration.",
    },
    {
        question: "How do I get started?",
        answer:
            "Connect your Solana wallet (like Phantom), get some devnet USDC from a faucet, browse available markets, choose YES or NO on a prediction, deposit your USDC, and wait for the market to resolve. If you win, you get your deposit + share of yield. If you lose, you get your full deposit back.",
    },
    {
        question: "What happens if I predict wrong?",
        answer:
            "You get 100% of your deposit back. The only thing you \"lose\" is the opportunity to earn yield. Your principal is never at risk, which is why we call it \"no-loss\" prediction markets.",
    },
    {
        question: "How is the yield distributed?",
        answer:
            "The total yield generated from all deposits is split proportionally among winners based on their stake size. For example: if a market generates $1,000 in yield and 500 people predicted correctly, each winner gets approximately $2 (assuming equal stakes).",
    },
    {
        question: "What is the flywheel effect?",
        answer:
            "More users → more deposits → more yield → bigger prizes → more incentive to join → more users. Popular markets automatically have larger prize pools because more capital generates more yield. Your risk stays zero while rewards scale with participation.",
    },
    {
        question: "How long do markets last?",
        answer:
            "Markets have different durations based on the prediction timeline. Longer markets generate more yield because deposits earn interest for more days. A 30-day market generates about 1% yield (12% APY × 30/365 days), while a 6-month market generates about 6%.",
    },
    {
        question: "Is this on mainnet?",
        answer:
            "Currently, PolyYield is on Solana Devnet for testing and demonstration. You can use devnet USDC (test tokens) to try the platform risk-free. We plan to launch on mainnet after thorough testing and audits.",
    },
    {
        question: "Can I withdraw my deposit early?",
        answer:
            "Once you deposit into a market, your funds are locked until the market resolves. This ensures the yield generation period completes and maintains fairness for all participants. Markets show their end date before you deposit.",
    },
    {
        question: "Where can I see my positions?",
        answer:
            "Click on \"Positions\" in the navigation menu. All your active and past predictions are stored in our database (Supabase), so you can access them from any device by connecting your wallet. Your positions sync across browsers automatically.",
    },
    {
        question: "How do you make money?",
        answer:
            "PolyYield is designed as a public good to onboard users to prediction markets. Potential revenue models include small platform fees, integration partnerships with Polymarket, or keeping a portion of generated yield. Currently focused on building the best user experience.",
    },
]

export function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggleQuestion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <section id="faq" className="py-24 border-t border-border/50 relative z-10">
            <div className="container">
                <div className="text-center mb-16">
                    <span className="font-mono text-sm text-primary uppercase tracking-wider">FAQ</span>
                    <h2 className="text-4xl md:text-5xl font-sentient mt-4">
                        Common <i className="font-light">questions</i>
                    </h2>
                    <p className="text-foreground/60 font-mono mt-4 max-w-2xl mx-auto">
                        Everything you need to know about no-loss prediction markets
                    </p>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-[#111]/80 border border-border/50 hover:border-primary/30 transition-colors"
                            >
                                <button
                                    onClick={() => toggleQuestion(index)}
                                    className="w-full text-left p-6 flex items-center justify-between gap-4"
                                >
                                    <h3 className="font-sentient text-lg text-foreground pr-4">
                                        {faq.question}
                                    </h3>
                                    <ChevronDown
                                        className={`w-5 h-5 text-primary flex-shrink-0 transition-transform duration-200 ${openIndex === index ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {openIndex === index && (
                                    <div className="px-6 pb-6 pt-0">
                                        <p className="text-foreground/70 font-mono text-sm leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </a>
        </p>
        </div >
      </div >
    </section >
  )
}
