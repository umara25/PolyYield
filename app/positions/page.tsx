import { PositionsList } from "@/components/positions-list"
import { Pill } from "@/components/pill"

export default function PositionsPage() {
  return (
    <div className="container py-24 min-h-screen">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-sentient mb-4">
          Your <i className="font-light">Positions</i>
        </h1>
        <p className="text-foreground/60 font-mono max-w-xl">
          Track your active predictions and watch your no-loss yield grow in real-time.
        </p>
      </div>
      
      <PositionsList />
    </div>
  )
}
