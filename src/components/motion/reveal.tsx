"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

/**
 * Once a hidden section's top is this far up the viewport, the scroll-driven
 * hold in globals.css (`entry 35vh`) has already shown it.
 */
const HOLD_ENDS_AT = 0.65

let observer: IntersectionObserver | undefined

/** One observer for every section, shared across the page. */
function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        observer?.unobserve(element)
        // A busy page delivered this late and the section already shows, so
        // fading it out to fade it back in would only flash it.
        element.dataset.reveal =
          entry.boundingClientRect.top < window.innerHeight * HOLD_ENDS_AT
            ? "shown"
            : "in"
      }
    },
    { rootMargin: "0px 0px -8% 0px" }
  )
  return observer
}

/**
 * Shared scroll reveal for the portfolio.
 *
 * Sections fade and lift a short distance as they scroll into view. They are
 * server-rendered visible, so content never waits on JavaScript. After
 * hydration, sections still below the fold are hidden (`data-reveal`, styled
 * in globals.css) and play a timed fade once they scroll into view. Visitors
 * who prefer reduced motion see the content as is.
 */
export function Reveal({
  delay,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Seconds to wait before fading in on page load. For hero sections that are
   * already on screen, where there's no scroll to drive the reveal.
   */
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const onLoad = delay !== undefined

  useEffect(() => {
    const element = ref.current
    if (
      onLoad ||
      !element ||
      matchMedia("(prefers-reduced-motion: reduce)").matches ||
      // Already on screen or scrolled past: leave it as the visitor sees it.
      element.getBoundingClientRect().top < window.innerHeight
    ) {
      return
    }

    element.dataset.reveal = "pending"
    const sections = getObserver()
    sections.observe(element)
    return () => sections.unobserve(element)
  }, [onLoad])

  if (!onLoad) {
    return <div ref={ref} className={className} style={style} {...props} />
  }

  return (
    <div
      className={cn("reveal-on-load", className)}
      style={{ "--reveal-delay": `${delay}s`, ...style } as React.CSSProperties}
      {...props}
    />
  )
}
