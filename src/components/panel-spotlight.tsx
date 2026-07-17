"use client"

import { useRef } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Wraps a panel region with a faint, theme-aware radial glow that follows the
 * cursor — reusing the `testimonial-spotlight` technique to add quiet life to
 * otherwise-plain panels (Tech Stack, Social Links). The glow color is derived
 * from `--foreground` so it adapts to light/dark automatically. Disabled under
 * reduced motion.
 */
export function PanelSpotlight({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null)
  const shouldReduceMotion = useReducedMotion()

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (shouldReduceMotion || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    ref.current.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`)
    ref.current.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      className={cn("group/panel-spotlight relative", className)}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {!shouldReduceMotion && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-1 opacity-0 transition-opacity duration-500 ease-out group-hover/panel-spotlight:opacity-100"
          style={{
            background:
              "radial-gradient(220px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), color-mix(in oklab, var(--foreground) 7%, transparent), transparent 72%)",
          }}
        />
      )}
      {children}
    </div>
  )
}
