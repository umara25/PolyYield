"use client"

import Link from "next/link"
import { Logo } from "./logo"
import { MobileMenu } from "./mobile-menu"
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui"

export const Header = () => {
  return (
    <div className="fixed z-50 pt-8 md:pt-14 top-0 left-0 w-full">
      <header className="flex items-center justify-between container">
        <Link href="/">
          <Logo className="w-[160px] md:w-[180px]" />
        </Link>
        <nav className="flex max-lg:hidden absolute left-1/2 -translate-x-1/2 items-center justify-center gap-x-10">
          <Link
            className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
            href="/markets"
          >
            Markets
          </Link>
          <Link
            className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
            href="/positions"
          >
            Positions
          </Link>
          {["How It Works", "FAQ"].map((item) => (
            <Link
              className="uppercase inline-block font-mono text-foreground/60 hover:text-foreground/100 duration-150 transition-colors ease-out"
              href={`/#${item.toLowerCase().replace(/\s+/g, "-")}`}
              key={item}
            >
              {item}
            </Link>
          ))}
        </nav>
        <div className="max-lg:hidden">
          <WalletMultiButton style={{ backgroundColor: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", fontFamily: "var(--font-mono)", fontSize: "0.875rem", height: "auto", padding: "0.5rem 1rem", borderRadius: "0" }} />
        </div>
        <MobileMenu />
      </header>
    </div>
  )
}
