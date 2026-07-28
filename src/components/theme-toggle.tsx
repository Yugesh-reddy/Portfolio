"use client"

import { useReducedMotion } from "motion/react"
import { useTheme } from "next-themes"
import { useHotkeys } from "react-hotkeys-hook"

import { META_THEME_COLORS } from "@/config/site"
import { useClickSound } from "@/hooks/soundcn/use-click-sound"
import { useMetaColor } from "@/hooks/use-meta-color"

import { MoonIcon } from "./animated-icons/moon"
import { SunMediumIcon } from "./animated-icons/sun-medium"
import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip"
import { Button } from "./ui/button"
import { Kbd } from "./ui/kbd"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  const { setMetaColor } = useMetaColor()

  const [click] = useClickSound()

  const shouldReduceMotion = useReducedMotion()

  const switchTheme = () => {
    click()

    const applyTheme = () => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark")
      setMetaColor(
        resolvedTheme === "dark"
          ? META_THEME_COLORS.light
          : META_THEME_COLORS.dark
      )
    }

    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => unknown
    }

    // No View Transitions support or reduced motion → swap instantly.
    if (!doc.startViewTransition || shouldReduceMotion) {
      applyTheme()
      return
    }

    // Quick crossfade between the two themes.
    doc.startViewTransition(applyTheme)
  }

  useHotkeys("d", () => switchTheme())

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            className="border-none"
            variant="ghost"
            size="icon-sm"
            aria-label="Toggle Mode"
            onClick={() => switchTheme()}
          >
            <MoonIcon className="relative hidden after:absolute after:-inset-2 [html.dark_&]:block" />
            <SunMediumIcon className="relative hidden after:absolute after:-inset-2 [html.light_&]:block" />
          </Button>
        }
      />
      <TooltipContent className="pr-2 pl-3">
        <div className="flex items-center gap-3">
          Toggle Mode
          <Kbd>D</Kbd>
        </div>
      </TooltipContent>
    </Tooltip>
  )
}
