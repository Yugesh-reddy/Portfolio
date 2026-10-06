"use client"

import { ProgressProvider } from "@bprogress/next/app"
import { Provider as JotaiProvider } from "jotai"
import { domAnimation, LazyMotion } from "motion/react"
import { ThemeProvider } from "next-themes"

import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider as BaseTooltipProvider } from "@/components/base/ui/tooltip"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <JotaiProvider>
      <ThemeProvider
        enableSystem
        disableTransitionOnChange
        enableColorScheme
        storageKey="theme"
        defaultTheme="system"
        attribute="class"
      >
        <LazyMotion features={domAnimation}>
          <ProgressProvider
            color="var(--foreground)"
            height="2px"
            delay={500}
            options={{ showSpinner: false }}
          >
            <BaseTooltipProvider>{children}</BaseTooltipProvider>

            <KeyboardShortcuts />
          </ProgressProvider>
        </LazyMotion>

        <Toaster position="top-center" />
      </ThemeProvider>
    </JotaiProvider>
  )
}
