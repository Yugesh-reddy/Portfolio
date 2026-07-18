import { cn } from "@/lib/utils"

// Diagonal hatch: thin lines of near-black (light) / near-white
// (dark) at low opacity, so the band reads as a clear gray hatch instead of
// the near-invisible `--color-line`. 1px line every 6px at 315deg.
const HATCH =
  "bg-[repeating-linear-gradient(315deg,rgba(9,9,11,0.08)_0,rgba(9,9,11,0.08)_1px,transparent_1px,transparent_6px)] " +
  "dark:bg-[repeating-linear-gradient(315deg,rgba(250,250,250,0.09)_0,rgba(250,250,250,0.09)_1px,transparent_1px,transparent_6px)]"

/**
 * The diagonal-hatch band that separates page sections.
 *
 * The hatch bleeds the full viewport width (`left-[-100vw]`, `w-[200vw]`) so
 * the stripes run edge to edge, so the parent must NOT clip overflow. Kept
 * static and always-visible — no scroll/opacity animation — so the stripes
 * never end up hidden.
 */
export function SeparatorHatch({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative flex h-8 w-full border-x border-line", className)}
    >
      <div
        aria-hidden
        className={cn("absolute inset-y-0 left-[-100vw] w-[200vw]", HATCH)}
      />
    </div>
  )
}
