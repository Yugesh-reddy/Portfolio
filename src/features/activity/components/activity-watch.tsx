"use client"

import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import styles from "./watch.module.css"

type Progress = { move: number; exercise: number; stand: number }

/** Grays at rest, Apple's ring colors once the watch wakes. */
export const RINGS = [
  {
    key: "move",
    label: "Move",
    radius: 44,
    gray: 0.92,
    tone: "100%",
    hue: "#fa114f",
  },
  {
    key: "exercise",
    label: "Exercise",
    radius: 31.5,
    gray: 0.62,
    tone: "65%",
    hue: "#92e82a",
  },
  {
    key: "stand",
    label: "Stand",
    radius: 19,
    gray: 0.4,
    tone: "40%",
    hue: "#1eeaef",
  },
] as const

/** A short double buzz, like the haptic for a new notification. */
const BUZZ = [
  { transform: "translateX(0)" },
  { transform: "translateX(-1.5px)" },
  { transform: "translateX(1.5px)" },
  { transform: "translateX(-1px)" },
  { transform: "translateX(0)" },
]

/**
 * The watch is decorative; the tile's legend carries the numbers. Rings sweep
 * to each new snapshot, and a sync that lands while the tile is open buzzes
 * the watch.
 */
export function ActivityWatch({
  progress,
  updatedAt,
  stale = false,
  className,
}: {
  progress?: Progress
  updatedAt?: string
  stale?: boolean
  className?: string
}) {
  const watch = useRef<HTMLDivElement>(null)
  const previous = useRef(updatedAt)
  useEffect(() => {
    const was = previous.current
    previous.current = updatedAt
    if (!was || !updatedAt || was === updatedAt) return
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return
    watch.current?.animate(BUZZ, { duration: 360, iterations: 2 })
  }, [updatedAt])

  return (
    <div
      ref={watch}
      aria-hidden
      className={cn(styles.watch, stale && styles.stale, className)}
    >
      <span className={styles.band} />
      <span className={styles.case}>
        <span className={styles.screen}>
          <svg viewBox="0 0 100 100" className={styles.rings}>
            {RINGS.map(({ key, radius, gray, hue }) => {
              const value = Math.min(100, Math.max(0, progress?.[key] ?? 0))
              return (
                <g
                  key={key}
                  fill="none"
                  strokeWidth="11"
                  strokeLinecap="round"
                  style={
                    {
                      "--gray": `rgb(255 255 255 / ${gray})`,
                      "--hue": hue,
                    } as React.CSSProperties
                  }
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    className={styles.track}
                    strokeDasharray={progress ? undefined : "1 3"}
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    pathLength="100"
                    strokeDasharray="100 100"
                    transform="rotate(-90 50 50)"
                    className={styles.progress}
                    style={{
                      strokeDashoffset: 100 - value,
                      opacity: value > 0 ? 1 : 0,
                    }}
                  />
                </g>
              )
            })}
          </svg>
        </span>
      </span>
    </div>
  )
}
