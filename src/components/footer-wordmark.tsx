"use client"

import { useId, useRef } from "react"
import { motion, useReducedMotion, useSpring } from "motion/react"

import {
  FOOTER_WORDMARK_VIEWBOX,
  footerLetters,
} from "@/features/portfolio/data/footer-wordmark"

import styles from "./site-footer.module.css"
import { INK_RESIDUE_SAMPLES, useInkResidue } from "./use-ink-residue"

export function FooterWordmark() {
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const reduceMotion = useReducedMotion()
  const maskId = `footer-ink-${id}`
  const residueMaskId = `footer-ink-residue-${id}`
  const inkShapeId = `footer-ink-shape-${id}`
  const filterId = `footer-ink-edge-${id}`
  const letterId = `footer-lettering-${id}`
  const x = useSpring(1000, { stiffness: 170, damping: 28, mass: 0.3 })
  const y = useSpring(220, { stiffness: 170, damping: 28, mass: 0.3 })
  const radius = useSpring(0, { stiffness: 100, damping: 24, mass: 0.5 })
  const residueRef = useInkResidue(x, y, radius)

  function moveInk(event: React.PointerEvent<SVGSVGElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return
    const matrix = svgRef.current?.getScreenCTM()
    if (!matrix) return
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse()
    )

    if (event.type === "pointerenter") {
      x.jump(point.x)
      y.jump(point.y)
    } else {
      x.set(point.x)
      y.set(point.y)
    }
    radius.set(235)
  }

  return (
    <div className={styles.wordmark}>
      <svg
        ref={svgRef}
        className={styles.wordmarkSvg}
        viewBox={FOOTER_WORDMARK_VIEWBOX}
        role="img"
        aria-label="YUGESH, architectural outline lettering"
        onPointerEnter={moveInk}
        onPointerMove={moveInk}
        onPointerLeave={() => radius.set(0)}
      >
        <defs>
          <g id={letterId}>
            {footerLetters.map(({ letter, x: offset, outline }) => (
              <path
                key={letter}
                transform={`translate(${offset} 77)`}
                d={outline}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </g>
          <filter
            id={filterId}
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.028 0.04"
              numOctaves="3"
              seed="5"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="58"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="0.55" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="5" intercept="-2.15" />
            </feComponentTransfer>
          </filter>
          <motion.circle
            id={inkShapeId}
            cx={x}
            cy={y}
            r={reduceMotion ? 0 : radius}
            filter={`url(#${filterId})`}
          />
          <mask
            id={residueMaskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="2000"
            height="440"
          >
            <g
              ref={residueRef}
              fill="none"
              stroke="white"
              strokeWidth="16"
              filter={`url(#${filterId})`}
            >
              {Array.from({ length: INK_RESIDUE_SAMPLES }, (_, index) => (
                <circle key={index} r="0" opacity="0" />
              ))}
            </g>
            {/* Remove the current ink footprint: only its recently vacated
                edge can leave a gray membrane. */}
            <use href={`#${inkShapeId}`} fill="black" />
          </mask>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="2000"
            height="440"
          >
            <use href={`#${inkShapeId}`} fill="white" />
          </mask>
        </defs>

        <use href={`#${letterId}`} className={styles.letterOutlines} />
        <g className={styles.construction} fill="none">
          {footerLetters.map(({ letter, x: offset, guides, points }) => (
            <g key={letter} transform={`translate(${offset} 77)`}>
              <path d={guides} vectorEffect="non-scaling-stroke" />
              {points.map(([px, py]) => (
                <path
                  key={`${px}-${py}`}
                  d={`M${px - 5} ${py}h10M${px} ${py - 6}v12`}
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </g>
          ))}
        </g>
        <g mask={`url(#${residueMaskId})`} className={styles.inkResidue}>
          <use href={`#${letterId}`} />
        </g>
        <g mask={`url(#${maskId})`} className={styles.ink}>
          <use href={`#${letterId}`} />
        </g>
      </svg>
    </div>
  )
}
