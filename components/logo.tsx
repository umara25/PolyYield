import type React from "react"
export const Logo = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {/* PolyYield text */}
      <text x="0" y="26" fill="currentColor" fontFamily="monospace" fontSize="16" fontWeight="600">
        PolyYield
      </text>
    </svg>
  )
}
