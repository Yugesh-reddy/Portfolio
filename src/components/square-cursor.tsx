"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  stepTrail,
  type CursorPoint,
} from "@/features/portfolio/lib/cursor-trail"

/** More samples = smoother continuous streak. */
const TRAIL_COUNT = 12
const LERP = 0.55
/** Lead square size (px). */
const LEAD_SIZE = 7
/** Stroke width at the tip (px). */
const HEAD_WIDTH = 2.75
/** Stroke width at the tail (px). */
const TAIL_WIDTH = 0.2

export function SquareCursor() {
  const reduceMotion = useReducedMotion()
  const isFinePointer = useMediaQuery("(pointer: fine)")
  const enabled = isFinePointer === true && reduceMotion === false

  const pointsRef = useRef<CursorPoint[]>(
    Array.from({ length: TRAIL_COUNT }, () => ({ x: 0, y: 0 }))
  )
  const targetRef = useRef<CursorPoint>({ x: 0, y: 0 })
  const visibleRef = useRef(false)
  const seededRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const dprRef = useRef(1)

  useEffect(() => {
    if (!enabled) return

    // Keep the native cursor visible; the square + trail follow with lerp lag.
    document.documentElement.removeAttribute("data-custom-cursor")
    visibleRef.current = false
    seededRef.current = false
    pointsRef.current = Array.from({ length: TRAIL_COUNT }, () => ({
      x: 0,
      y: 0,
    }))
    targetRef.current = { x: 0, y: 0 }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      dprRef.current = dpr
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const onMove = (event: PointerEvent) => {
      const point = { x: event.clientX, y: event.clientY }
      targetRef.current = point
      if (!seededRef.current) {
        pointsRef.current = Array.from({ length: TRAIL_COUNT }, () => ({
          ...point,
        }))
        seededRef.current = true
      }
      visibleRef.current = true
    }
    const onLeave = () => {
      visibleRef.current = false
    }
    const onEnter = () => {
      visibleRef.current = true
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("resize", resize, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    document.documentElement.addEventListener("pointerenter", onEnter)

    const tick = () => {
      pointsRef.current = stepTrail(pointsRef.current, targetRef.current, LERP)
      const points = pointsRef.current
      const show = visibleRef.current
      const { innerWidth: w, innerHeight: h } = window

      ctx.clearRect(0, 0, w, h)

      if (show && seededRef.current) {
        const accent = getComputedStyle(document.documentElement)
          .getPropertyValue("--cursor-accent")
          .trim()

        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.strokeStyle = accent
        ctx.fillStyle = accent

        // Continuous tapering streak: head (i=0) → thin tail.
        for (let i = 0; i < points.length - 1; i++) {
          const a = points[i]
          const b = points[i + 1]
          if (!a || !b) continue
          const t = i / (points.length - 1)
          const width = HEAD_WIDTH + (TAIL_WIDTH - HEAD_WIDTH) * t
          const alpha = 1 - t * 0.88
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.globalAlpha = alpha
          ctx.lineWidth = width
          ctx.stroke()
        }

        // Small square tip (pencil mark).
        const head = points[0]
        if (head) {
          ctx.globalAlpha = 1
          const half = LEAD_SIZE / 2
          ctx.fillRect(head.x - half, head.y - half, LEAD_SIZE, LEAD_SIZE)
        }

        ctx.globalAlpha = 1
      }

      rafRef.current = window.requestAnimationFrame(tick)
    }
    rafRef.current = window.requestAnimationFrame(tick)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("resize", resize)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      document.documentElement.removeEventListener("pointerenter", onEnter)
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      visibleRef.current = false
      seededRef.current = false
      pointsRef.current = Array.from({ length: TRAIL_COUNT }, () => ({
        x: 0,
        y: 0,
      }))
      targetRef.current = { x: 0, y: 0 }
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
    />
  )
}
