"use client"

import { useId } from "react"
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

const VIEW_W = 1200
const VIEW_H = 300
const BLOB_RADIUS = 160

const TEXT_STYLE: React.CSSProperties = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: VIEW_H,
  fontWeight: 700,
}

export function InkFillLogotype({
  text = "YUGESH",
  className,
}: {
  text?: string
  className?: string
}) {
  const reactId = useId()
  const maskId = `ink-fill-mask-${reactId.replace(/:/g, "")}`
  const reduceMotion = useReducedMotion()
  const isFinePointer = useMediaQuery("(pointer: fine)")
  const track = isFinePointer === true && reduceMotion === false

  const rawX = useMotionValue(VIEW_W / 2)
  const rawY = useMotionValue(VIEW_H / 2)
  const rawOpacity = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 220, damping: 32, mass: 0.45 })
  const y = useSpring(rawY, { stiffness: 220, damping: 32, mass: 0.45 })
  const opacity = useSpring(rawOpacity, {
    stiffness: 180,
    damping: 28,
    mass: 0.4,
  })

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!track) return
    const rect = event.currentTarget.getBoundingClientRect()
    const nx = ((event.clientX - rect.left) / rect.width) * VIEW_W
    const ny = ((event.clientY - rect.top) / rect.height) * VIEW_H
    rawX.set(Math.max(0, Math.min(VIEW_W, nx)))
    rawY.set(Math.max(0, Math.min(VIEW_H, ny)))
    rawOpacity.set(1)
  }

  const onLeave = () => {
    rawOpacity.set(0)
  }

  return (
    <div
      className={cn(
        "relative aspect-[4/1] w-full overflow-hidden after:absolute after:bottom-0 after:h-px after:w-full after:bg-current/15",
        className
      )}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <svg
        className="size-full translate-y-[28%] select-none"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <motion.radialGradient
            id={`${maskId}-grad`}
            cx={x}
            cy={y}
            r={BLOB_RADIUS}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="55%" stopColor="white" stopOpacity="0.85" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </motion.radialGradient>
          <mask id={maskId}>
            <motion.rect
              x="0"
              y="0"
              width={VIEW_W}
              height={VIEW_H}
              fill={`url(#${maskId}-grad)`}
              style={{ opacity }}
            />
          </mask>
        </defs>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.45}
          strokeWidth={2.25}
          style={TEXT_STYLE}
        >
          {text}
        </text>

        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fill="currentColor"
          mask={`url(#${maskId})`}
          style={TEXT_STYLE}
        >
          {text}
        </text>
      </svg>
    </div>
  )
}
