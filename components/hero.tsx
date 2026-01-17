"use client"

import Link from "next/link"
import { GL } from "./gl"
import { Pill } from "./pill"
import { Button } from "./ui/button"
import { useState } from "react"

export function Hero() {
  const [hovering, setHovering] = useState(false)
  return (
    <div className="flex flex-col h-svh justify-center items-center">
      <GL hovering={hovering} />

      <div className="text-center relative z-10">
        <Pill className="mb-6">BUILT ON POLYMARKET</Pill>
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-sentient">
          Predict the <br />
          <i className="font-light">future,</i> risk nothing
        </h1>
        <p className="font-mono text-sm sm:text-base text-foreground/60 text-balance mt-8 max-w-[500px] mx-auto">
          No-lose prediction markets where your principal is always protected. Winners earn yield, losers get their
          deposit back.
        </p>

        <Link className="contents max-sm:hidden" href="/#markets">
          <Button className="mt-14" onMouseEnter={() => setHovering(true)} onMouseLeave={() => setHovering(false)}>
            [Explore Markets]
          </Button>
        </Link>
        <Link className="contents sm:hidden" href="/#markets">
          <Button
            size="sm"
            className="mt-14"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            [Explore Markets]
          </Button>
        </Link>
      </div>
    </div>
  )
}
