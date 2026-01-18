import type React from "react"
import type { Metadata } from "next"
import { Geist_Mono } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import AppWalletProvider from "@/components/AppWalletProvider"
import { SupabaseStatus } from "@/components/supabase-status"

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PolyYield",
  description: "No-Lose Prediction Markets - Your principal is always protected",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} antialiased`} suppressHydrationWarning>
        <AppWalletProvider>
          <Header />
          {children}
          <SupabaseStatus />
        </AppWalletProvider>
      </body>
    </html>
  )
}
