"use client"

import { useEffect, useId, useRef } from "react"
import type { Transition } from "motion/react"
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react"

import { metalClickSound } from "@/lib/soundcn/metal-click"
import { cn } from "@/lib/utils"
import { useSound } from "@/hooks/soundcn/use-sound"
import {
  YS_MARK_PRESS,
  YS_MARK_VIEW_HEIGHT,
  YS_MARK_VIEW_WIDTH,
  YS_MARK_VIEWBOX,
  ysMarkPaths,
} from "@/features/portfolio/data/ys-mark-paths"
import { getIsometricParityMetrics } from "@/features/portfolio/lib/isometric-detail-scale"

const parityMetrics = getIsometricParityMetrics(YS_MARK_VIEW_WIDTH)
const guideDasharray = parityMetrics.guideDasharray.join(" ")

const transition: Transition = {
  type: "spring",
  mass: 0.5,
  damping: 18,
  stiffness: 200,
}

/**
 * @ncdai/spotlight-logo, with the CD demo artwork swapped for the isometric
 * YS mark (the Y + S letterforms). The cursor-tracking gradient stroke, springy
 * press, and tactile click sound are unchanged; the paths come from the
 * generated `ys-mark-paths.ts` so occlusion (strokesUnder vs strokesTop) stays
 * correct.
 */
export function SpotlightLogo({ className }: { className?: string }) {
  const id = useId()
  const ids = {
    facePattern: `spotlight-logo-face-pattern-${id}`,
    faceFill: `spotlight-logo-face-fill-${id}`,
    strokeTop: `spotlight-logo-stroke-top-${id}`,
    strokeUnder: `spotlight-logo-stroke-under-${id}`,
    radialGradient: `spotlight-logo-radial-gradient-${id}`,
  }

  const ref = useRef<SVGSVGElement>(null)
  const shouldReduceMotion = useReducedMotion()
  const isInView = useInView(ref, { margin: "80px" })
  const [play] = useSound(metalClickSound)

  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const cx = useSpring(useTransform(mouseX, [0, 1], [0, YS_MARK_VIEW_WIDTH]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  const cy = useSpring(useTransform(mouseY, [0, 1], [0, YS_MARK_VIEW_HEIGHT]), {
    stiffness: 300,
    damping: 30,
    mass: 0.1,
  })

  useEffect(() => {
    if (shouldReduceMotion || !isInView) return
    if (window.matchMedia("(hover: none)").matches) return

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth)
      mouseY.set(e.clientY / window.innerHeight)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [shouldReduceMotion, isInView, mouseX, mouseY])

  return (
    <motion.svg
      ref={ref}
      className={cn(
        "h-auto w-full touch-manipulation overflow-visible [--pattern:color-mix(in_oklab,var(--foreground)_12%,var(--background))] [--stroke:color-mix(in_oklab,var(--foreground)_16%,var(--background))] dark:[--pattern:color-mix(in_oklab,var(--foreground)_22%,var(--background))] dark:[--stroke:color-mix(in_oklab,var(--foreground)_28%,var(--background))]",
        className
      )}
      viewBox={YS_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      initial="normal"
      whileTap="pressed"
      onTap={() => play()}
    >
      <defs>
        <pattern
          id={ids.facePattern}
          x="0"
          y="0"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform={`scale(${parityMetrics.patternScale})`}
        >
          <path
            d="M-1 1l2 -2M0 10l10 -10M9 11l2 -2"
            stroke="var(--pattern)"
            strokeWidth="1"
          />
        </pattern>

        <motion.g
          id={ids.faceFill}
          variants={{
            normal: { transform: "translate(0px, 0px)" },
            pressed: { transform: `translate(0px, ${YS_MARK_PRESS}px)` },
          }}
          transition={transition}
        >
          {ysMarkPaths.topFaces.map((d) => (
            <path key={d} d={d} />
          ))}
        </motion.g>

        <motion.path
          id={ids.strokeUnder}
          d={ysMarkPaths.strokesUnder.normal}
          variants={{
            normal: { d: ysMarkPaths.strokesUnder.normal },
            pressed: { d: ysMarkPaths.strokesUnder.pressed },
          }}
          transition={transition}
        />

        <motion.path
          id={ids.strokeTop}
          d={ysMarkPaths.strokesTop.normal}
          variants={{
            normal: { d: ysMarkPaths.strokesTop.normal },
            pressed: { d: ysMarkPaths.strokesTop.pressed },
          }}
          transition={transition}
        />

        <motion.radialGradient
          id={ids.radialGradient}
          cx={cx}
          cy={cy}
          r={parityMetrics.spotlightRadius}
          gradientUnits="userSpaceOnUse"
        >
          <stop
            className="dark:[stop-color:#fff]"
            stopColor="var(--color-zinc-700)"
          />
          <stop
            className="dark:[stop-color:var(--color-zinc-600)]"
            offset="1"
            stopColor="var(--color-zinc-400)"
            stopOpacity="0"
          />
        </motion.radialGradient>
      </defs>

      {/* Iso-axis construction guides — same dash recipe as CD */}
      <g
        className="stroke-line"
        strokeWidth={parityMetrics.strokeWidth}
        strokeDasharray={guideDasharray}
      >
        {ysMarkPaths.guideLines.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>

      <g className="fill-background" fillRule="evenodd" clipRule="evenodd">
        {ysMarkPaths.sideFaces.normal.map((d, index) => (
          <motion.path
            key={d}
            d={d}
            variants={{
              normal: { d },
              pressed: { d: ysMarkPaths.sideFaces.pressed[index] },
            }}
            transition={transition}
          />
        ))}
      </g>

      {/* Verticals + floor under tops so overlapping prisms occlude correctly */}
      <use
        href={`#${ids.strokeUnder}`}
        stroke="var(--stroke)"
        strokeWidth={parityMetrics.strokeWidth}
      />
      <use
        href={`#${ids.strokeUnder}`}
        stroke={`url(#${ids.radialGradient})`}
        strokeWidth={parityMetrics.strokeWidth}
      />

      <use href={`#${ids.faceFill}`} className="fill-background" />
      <use href={`#${ids.faceFill}`} fill={`url(#${ids.facePattern})`} />

      <use
        href={`#${ids.strokeTop}`}
        stroke="var(--stroke)"
        strokeWidth={parityMetrics.strokeWidth}
      />
      <use
        href={`#${ids.strokeTop}`}
        stroke={`url(#${ids.radialGradient})`}
        strokeWidth={parityMetrics.strokeWidth}
      />
    </motion.svg>
  )
}
