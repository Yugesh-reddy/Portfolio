"use client"

import {
  type HTMLMotionProps,
  type Variants,
  motion,
  useReducedMotion,
} from "motion/react"

import { cn } from "@/lib/utils"

/**
 * Shared motion language for the portfolio.
 *
 * Subtle, tasteful scroll-reveals: content fades and lifts a short distance as
 * it enters the viewport, once. A single easing/duration set keeps every
 * section feeling like one cohesive system. All transforms are disabled when
 * the user prefers reduced motion (content simply appears).
 */

// easeOutCubic — gentle, even deceleration. Smoother than expo, no snap.
const EASE = [0.33, 1, 0.68, 1] as const
const DURATION = 0.6
const DEFAULT_Y = 14
// Begin revealing just as a section enters from the bottom, so there's no
// blank gap before it fades in (what reads as a "delay" when scrolling).
const VIEWPORT_MARGIN = "0px 0px -2% 0px"
const VIEWPORT_AMOUNT = 0.08

type RevealProps = HTMLMotionProps<"div"> & {
  /** Seconds to wait before animating in (used to stagger hero sections). */
  delay?: number
  /** Distance in px to lift from. */
  y?: number
  /** Only animate the first time it enters the viewport. */
  once?: boolean
  /** Fraction of the element that must be visible to trigger. */
  amount?: number
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = DEFAULT_Y,
  once = true,
  amount = VIEWPORT_AMOUNT,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      // `initial` must be identical on server and client (the server can't know
      // the user's motion preference), otherwise reduced-motion clients trigger
      // a hydration mismatch. We branch only the transition: reduced motion
      // snaps to the final state instantly (duration 0) — no movement, no offset.
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount, margin: VIEWPORT_MARGIN }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: DURATION, ease: EASE, delay }
      }
      {...props}
    >
      {children}
    </motion.div>
  )
}

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
