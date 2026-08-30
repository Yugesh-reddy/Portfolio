"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  stepTrail,
  type CursorPoint,
} from "@/features/portfolio/lib/cursor-trail"

const TRAIL_COUNT = 10
const LERP = 0.35
const SIZE_PX = 9

export function SquareCursor() {
  const reduceMotion = useReducedMotion()
  const isFinePointer = useMediaQuery("(pointer: fine)")
  const enabled = isFinePointer === true && reduceMotion !== true

  const pointsRef = useRef<CursorPoint[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
  )
  const targetRef = useRef<CursorPoint>({ x: 0, y: 0 })
  const visibleRef = useRef(false)
  const nodesRef = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) {
      document.documentElement.removeAttribute("data-custom-cursor")
      return
    }

    document.documentElement.setAttribute("data-custom-cursor", "")

    const onMove = (event: PointerEvent) => {
      targetRef.current = { x: event.clientX, y: event.clientY }
      visibleRef.current = true
    }
    const onLeave = () => {
      visibleRef.current = false
    }
    const onEnter = () => {
      visibleRef.current = true
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    document.documentElement.addEventListener("pointerenter", onEnter)

    const tick = () => {
      pointsRef.current = stepTrail(pointsRef.current, targetRef.current, LERP)
      const half = SIZE_PX / 2
      const show = visibleRef.current
      for (let i = 0; i < TRAIL_COUNT; i++) {
        const node = nodesRef.current[i]
        const p = pointsRef.current[i]
        if (!node || !p) continue
        const t = i / (TRAIL_COUNT - 1)
        const opacity = show ? 1 - t * 0.92 : 0
        const scale = 1 - t * 0.35
        node.style.transform = `translate3d(${p.x - half}px, ${p.y - half}px, 0) scale(${scale})`
        node.style.opacity = String(opacity)
      }
      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      document.documentElement.removeAttribute("data-custom-cursor")
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      document.documentElement.removeEventListener("pointerenter", onEnter)
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {Array.from({ length: TRAIL_COUNT }, (_, i) => (
        <div
          key={i}
          ref={(el) => {
            nodesRef.current[i] = el
          }}
          className="absolute top-0 left-0 will-change-transform"
          style={{
            width: SIZE_PX,
            height: SIZE_PX,
            background: "var(--cursor-accent)",
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}
