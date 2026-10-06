import { Caveat } from "next/font/google"
import localFont from "next/font/local"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"

import { cn } from "@/lib/utils"

const fontSans = GeistSans
const fontMono = GeistMono

const fontSerif = localFont({
  src: "../assets/fonts/charter_regular.woff2",
  weight: "400",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "serif"],
  variable: "--font-serif",
})

const fontHandwritten = Caveat({
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
  preload: false,
  // Distinct from the Tailwind theme token so `@theme` is not circular.
  variable: "--font-caveat",
})

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontSerif.variable,
  fontHandwritten.variable,
  "[--font-sans:var(--font-geist-sans)]",
  "[--font-mono:var(--font-geist-mono)]",
  "[--font-handwritten:var(--font-caveat)]"
)
