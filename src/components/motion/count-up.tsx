"use client"

import { useEffect, useRef, useState } from "react"
import { animate, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

function defaultFormat(n: number) {
  return Math.round(n).toLocaleString("en")
}

/**
 * Counts a number up from 0 to `value` the first time it scrolls into view.
 *
 * SSR-safe: the final value is rendered initially (so no-JS and crawlers see
 * the real number, no hydration mismatch). On the client, when motion is
 * allowed, it resets to 0 after mount and counts up on entering the viewport.
 * Under reduced motion it simply shows the final value.
 */
export function CountUp({
  value,
  duration = 1.1,
  className,
  format = defaultFormat,
}: {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const shouldReduceMotion = useReducedMotion()
  const startedRef = useRef(false)
  const [display, setDisplay] = useState(() => format(value))

  // On the client (motion allowed), prime to 0 so the count-up reads cleanly.
  useEffect(() => {
    if (shouldReduceMotion) return
    setDisplay(format(0))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldReduceMotion])

  useEffect(() => {
    if (!inView || shouldReduceMotion || startedRef.current) return
    startedRef.current = true
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v)),
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, shouldReduceMotion, value, duration])

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {display}
    </span>
  )
}
