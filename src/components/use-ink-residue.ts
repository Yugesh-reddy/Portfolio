"use client"

import { useEffect, useRef } from "react"
import type { MotionValue } from "motion/react"

export const INK_RESIDUE_SAMPLES = 8
const RESIDUE_LIFETIME = 320
const MEMBRANE_WIDTH = 16

type InkSample = { x: number; y: number; radius: number; time: number }

/** Keeps a short memory of edges the ink has actually passed over. */
export function useInkResidue(
  x: MotionValue<number>,
  y: MotionValue<number>,
  radius: MotionValue<number>
) {
  const residueRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const group = residueRef.current
    const svg = group?.ownerSVGElement
    if (!group || !svg) return

    const circles = Array.from(group.children)
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let history: InkSample[] = []
    let previous = { x: x.get(), y: y.get(), radius: radius.get() }
    let lastSampleTime = 0
    let frame = 0
    let inView = true

    function clear() {
      cancelAnimationFrame(frame)
      frame = 0
      history = []
      circles.forEach((circle) => circle.setAttribute("opacity", "0"))
      previous = { x: x.get(), y: y.get(), radius: radius.get() }
    }

    function tick(time: number) {
      frame = 0
      const current = { x: x.get(), y: y.get(), radius: radius.get() }
      const distance = Math.hypot(
        current.x - previous.x,
        current.y - previous.y
      )
      const receding = previous.radius - current.radius > 0.5

      // Only moving or receding ink leaves residue. Growing ink never gets
      // a separate gray front ahead of it.
      if (
        previous.radius > MEMBRANE_WIDTH &&
        (distance > 0.5 || receding) &&
        time - lastSampleTime >= 32
      ) {
        history.unshift({ ...previous, time })
        lastSampleTime = time
      }
      previous = current
      history = history
        .filter((sample) => time - sample.time < RESIDUE_LIFETIME)
        .slice(0, INK_RESIDUE_SAMPLES)

      circles.forEach((circle, index) => {
        const sample = history[index]
        if (!sample) {
          circle.setAttribute("opacity", "0")
          return
        }

        const age = (time - sample.time) / RESIDUE_LIFETIME
        // Keep the residue close to the moving boundary, even on fast sweeps.
        const distanceFromInk = Math.hypot(
          sample.x - current.x,
          sample.y - current.y
        )
        const proximity = Math.max(0, 1 - distanceFromInk / 90)
        circle.setAttribute("cx", String(sample.x))
        circle.setAttribute("cy", String(sample.y))
        circle.setAttribute(
          "r",
          String(Math.max(0, sample.radius - MEMBRANE_WIDTH / 2))
        )
        circle.setAttribute("opacity", String((1 - age) ** 2 * proximity))
      })

      if (history.length) frame = requestAnimationFrame(tick)
    }

    function schedule() {
      if (!frame && inView && !document.hidden && !reducedMotion.matches) {
        frame = requestAnimationFrame(tick)
      }
    }

    function checkMotion() {
      if (reducedMotion.matches) clear()
    }

    function checkVisibility() {
      if (document.hidden) clear()
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (!inView) clear()
    })
    observer.observe(svg)
    const unsubscribe = [
      x.on("change", schedule),
      y.on("change", schedule),
      radius.on("change", schedule),
    ]
    reducedMotion.addEventListener("change", checkMotion)
    document.addEventListener("visibilitychange", checkVisibility)

    return () => {
      clear()
      observer.disconnect()
      unsubscribe.forEach((stop) => stop())
      reducedMotion.removeEventListener("change", checkMotion)
      document.removeEventListener("visibilitychange", checkVisibility)
    }
  }, [x, y, radius])

  return residueRef
}
