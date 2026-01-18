"use client"

import { Shield, TrendingUp, Users, Wallet } from "lucide-react"

const stats = [
  {
    label: "Total Value Locked",
    value: "$12.4M",
    icon: Wallet,
  },
  {
    label: "Active Markets",
    value: "47",
    icon: TrendingUp,
  },
  {
    label: "Total Predictors",
    value: "8,234",
    icon: Users,
  },
  {
    label: "Principal Protected",
    value: "100%",
    icon: Shield,
  },
]

export function Stats() {
  return (
    <section className="py-20 border-t border-border/50 relative z-10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-6 h-6 mx-auto mb-3 text-primary" />
              <p className="text-3xl md:text-4xl font-sentient mb-1">{stat.value}</p>
              <p className="text-sm font-mono text-foreground/50 uppercase tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
