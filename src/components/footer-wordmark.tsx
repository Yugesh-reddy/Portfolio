"use client"

import { useId } from "react"
import { motion, useReducedMotion, useSpring } from "motion/react"

import {
  FOOTER_WORDMARK_VIEWBOX,
  footerLetters,
} from "@/features/portfolio/data/footer-wordmark"

import styles from "./site-footer.module.css"

export function FooterWordmark() {
  const id = useId()
  const reduceMotion = useReducedMotion()
  const gradientId = `footer-gradient-${id}`
  const clipId = `footer-clip-${id}`
  const letterId = `footer-lettering-${id}`
  // Chanh Dai's footer gradient: the top endpoint follows the pointer while
  // the bottom stays centered, sweeping the fill toward the opposite side.
  const gradientX = useSpring(1000, { stiffness: 150, damping: 25 })

  function moveGradient(event: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || event.pointerType !== "mouse") return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width) return
    gradientX.set(
      Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width)) *
        2000
    )
  }

  return (
    <div
      className={styles.wordmark}
      onPointerMove={moveGradient}
      onPointerLeave={() => gradientX.set(1000)}
    >
      <svg
        className={styles.wordmarkSvg}
        viewBox={FOOTER_WORDMARK_VIEWBOX}
        role="img"
        aria-label="YUGESH, architectural outline lettering"
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
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            {footerLetters.map(({ letter, x: offset, outline }) => (
              <path
                key={letter}
                transform={`translate(${offset} 77)`}
                d={outline}
              />
            ))}
          </clipPath>
          <motion.linearGradient
            id={gradientId}
            x1={reduceMotion ? 1000 : gradientX}
            y1="77"
            x2="1000"
            y2="363"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0.625"
              stopColor="var(--foreground)"
              stopOpacity="0"
            />
            <stop offset="1" stopColor="var(--foreground)" />
          </motion.linearGradient>
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
        {/* Paint in the wordmark's coordinate space. Filling the translated
            letter paths directly would restart the gradient for each letter. */}
        <rect
          x="0"
          y="24"
          width="2000"
          height="392"
          clipPath={`url(#${clipId})`}
          fill={`url(#${gradientId})`}
          pointerEvents="none"
        />
      </svg>
    </div>
  )
}
