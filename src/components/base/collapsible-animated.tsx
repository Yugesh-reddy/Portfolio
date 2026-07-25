"use client"

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import type {
  ChevronDownIconHandle,
  ChevronDownIconProps,
} from "@/components/animated-icons/chevron-down-icon"
import { ChevronDownIcon } from "@/components/animated-icons/chevron-down-icon"
import { Collapsible as CollapsibleRoot } from "@/components/base/ui/collapsible"
import type {
  ChevronsUpDownIconHandle,
  ChevronsUpDownIconProps,
} from "@/registry/components/chevrons-up-down-icon"
import { ChevronsUpDownIcon } from "@/registry/components/chevrons-up-down-icon"

type CollapsibleContextType = {
  open: boolean
}

const CollapsibleContext = createContext<CollapsibleContextType | null>(null)

const useCollapsible = () => {
  const context = useContext(CollapsibleContext)

  if (!context) {
    throw new Error(
      "Collapsible components must be used within a CollapsibleWithContext"
    )
  }

  return context
}

function CollapsibleWithContext({
  defaultOpen,
  open: controlledOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof CollapsibleRoot>) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false)
  const open = controlledOpen ?? uncontrolledOpen

  return (
    <CollapsibleContext.Provider value={{ open }}>
      <CollapsibleRoot
        open={open}
        onOpenChange={(open, eventDetails) => {
          if (controlledOpen === undefined) {
            setUncontrolledOpen(open)
          }
          onOpenChange?.(open, eventDetails)
        }}
        {...props}
      />
    </CollapsibleContext.Provider>
  )
}

function useCollapsibleAnimation<
  T extends { startAnimation: () => void; stopAnimation: () => void },
>(ref: React.RefObject<T | null>) {
  const { open } = useCollapsible()

  useEffect(() => {
    const controls = ref.current
    if (!controls) return

    if (open) {
      controls.startAnimation()
    } else {
      controls.stopAnimation()
    }
  }, [open, ref])
}

function CollapsibleChevronsIcon(props: Omit<ChevronsUpDownIconProps, "ref">) {
  const ref = useRef<ChevronsUpDownIconHandle>(null)
  useCollapsibleAnimation(ref)
  return <ChevronsUpDownIcon ref={ref} {...props} />
}

function CollapsibleChevronDownIcon(props: Omit<ChevronDownIconProps, "ref">) {
  const ref = useRef<ChevronDownIconHandle>(null)
  useCollapsibleAnimation(ref)
  return <ChevronDownIcon ref={ref} {...props} />
}

/**
 * Animated replacement for Base UI's `CollapsibleContent`. Base UI mounts its
 * panel already-expanded on open, which CSS can't transition from, so we drive
 * the expand/collapse with Motion's reliable `height: auto` animation instead.
 *
 * The panel stays mounted and animates between height 0 and auto based on the
 * open state from the surrounding collapsible context. `initial={false}` means
 * the correct state is shown instantly on first paint (no load-time jank); only
 * user toggles animate. When collapsed it's made inert + aria-hidden so the
 * hidden content isn't focusable. Honors `prefers-reduced-motion`.
 */
function CollapsiblePanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { open } = useCollapsible()
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      data-slot="collapsible-panel"
      className={cn("overflow-hidden", className)}
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              height: { duration: 0.3, ease: [0.33, 1, 0.68, 1] },
              opacity: { duration: 0.22, ease: "easeOut" },
            }
      }
      inert={!open}
      aria-hidden={!open}
    >
      {children}
    </motion.div>
  )
}

export {
  CollapsibleWithContext as Collapsible,
  CollapsibleChevronDownIcon,
  CollapsibleChevronsIcon,
  CollapsiblePanel,
  useCollapsible,
  useCollapsibleAnimation,
}
