"use client"

import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"

import { useMediaQuery } from "@/hooks/use-media-query"
import {
  isTrailSettled,
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!enabled) return

    // Keep the native cursor visible; the square + trail follow with lerp lag.
    document.documentElement.removeAttribute("data-custom-cursor")

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let points: CursorPoint[] = []
    let target: CursorPoint = { x: 0, y: 0 }
    let visible = false
    let frame: number | null = null

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      if (!visible || points.length === 0) return

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
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.globalAlpha = 1 - t * 0.88
        ctx.lineWidth = HEAD_WIDTH + (TAIL_WIDTH - HEAD_WIDTH) * t
        ctx.stroke()
      }

      // Small square tip (pencil mark).
      const head = points[0]
      if (head) {
        ctx.globalAlpha = 1
        const half = LEAD_SIZE / 2
        ctx.fillRect(head.x - half, head.y - half, LEAD_SIZE, LEAD_SIZE)
      }
    }

    // Animate only while the trail is catching up. A resting pointer, or a
    // page scrolling under it, leaves the last frame on the canvas instead of
    // repainting a full-screen layer 60 times a second.
    const tick = () => {
      points = stepTrail(points, target, LERP)
      draw()
      frame = isTrailSettled(points, target)
        ? null
        : window.requestAnimationFrame(tick)
    }
    const wake = () => {
      frame ??= window.requestAnimationFrame(tick)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { innerWidth: w, innerHeight: h } = window
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      wake()
    }
    resize()

    const onMove = (event: PointerEvent) => {
      target = { x: event.clientX, y: event.clientY }
      if (points.length === 0) {
        points = Array.from({ length: TRAIL_COUNT }, () => ({ ...target }))
      }
      visible = true
      wake()
    }
    const onLeave = () => {
      visible = false
      wake()
    }
    const onEnter = () => {
      visible = true
      wake()
    }

    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("resize", resize, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    document.documentElement.addEventListener("pointerenter", onEnter)

    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("resize", resize)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      document.documentElement.removeEventListener("pointerenter", onEnter)
      if (frame !== null) window.cancelAnimationFrame(frame)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
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
