"use client"

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Shared scroll reveal for the portfolio.
 *
 * Sections fade and lift a short distance as they scroll into view. The fade is
 * a CSS scroll-driven animation (`reveal` in globals.css), so the browser runs
 * it off the main thread and content never waits on JavaScript: a busy page
 * can't leave a section blank. Browsers without scroll timelines, and visitors
 * who prefer reduced motion, see the content as is.
 */
export function Reveal({
  delay,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * Seconds to wait before fading in on page load. For hero sections that are
   * already on screen, where there's no scroll to drive the reveal.
   */
  delay?: number
}) {
  if (delay === undefined) {
    return <div className={cn("reveal", className)} style={style} {...props} />
  }

  return (
    <div
      className={cn("reveal-on-load", className)}
      style={{ "--reveal-delay": `${delay}s`, ...style } as React.CSSProperties}
      {...props}
    />
  )
}

// easeOutCubic — gentle, even deceleration. Smoother than expo, no snap.
const EASE = [0.33, 1, 0.68, 1] as const
const DURATION = 0.6
const DEFAULT_Y = 14
// Begin revealing just as a section enters from the bottom, so there's no
// blank gap before it fades in (what reads as a "delay" when scrolling).
const VIEWPORT_MARGIN = "0px 0px -2% 0px"
const VIEWPORT_AMOUNT = 0.08

const listVariants: Variants = {
  hidden: {},
  show: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
}

const itemVariants: Variants = {
  hidden: (y: number) => ({ opacity: 0, y }),
  show: { opacity: 1, y: 0, transition: { duration: DURATION, ease: EASE } },
}

type RevealListProps = HTMLMotionProps<"ul"> & {
  /** Seconds between each child's reveal. */
  stagger?: number
  once?: boolean
  amount?: number
}

/**
 * Container `<ul>` that staggers the reveal of its `RevealItem` children. Use
 * for grids/lists of discrete items (tech pills, social links).
 */
export function RevealList({
  children,
  className,
  stagger = 0.05,
  once = true,
  amount = VIEWPORT_AMOUNT,
  ...props
}: RevealListProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.ul
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: VIEWPORT_MARGIN }}
      variants={listVariants}
      custom={reduceMotion ? 0 : stagger}
      {...props}
    >
      {children}
    </motion.ul>
  )
}

type RevealItemProps = HTMLMotionProps<"li"> & {
  y?: number
}

export function RevealItem({
  children,
  className,
  y = DEFAULT_Y,
  ...props
}: RevealItemProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.li
      className={cn(className)}
      variants={itemVariants}
      // `custom` feeds the `hidden` variant's y, which is part of the SSR
      // output — keep it identical across server/client to avoid a hydration
      // mismatch. Reduced-motion users snap instantly via the transition below.
      custom={y}
      transition={reduceMotion ? { duration: 0 } : undefined}
      {...props}
    >
      {children}
    </motion.li>
  )
}
