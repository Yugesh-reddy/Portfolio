import React from "react"

import { cn } from "@/lib/utils"

export function EveeIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" aria-hidden {...props}>
      <path d="M28 15h57v18H46a18 18 0 0 1-18-18ZM15 41h39a18 18 0 0 1 18 18H15ZM28 67h57v18H46a18 18 0 0 1-18-18Z" />
    </svg>
  )
}

export function EveeAvatar({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "size-6 rounded-lg",
    md: "size-8 rounded-xl",
    lg: "size-11 rounded-2xl",
  }

  const iconSizes = {
    sm: "size-3.5",
    md: "size-5",
    lg: "size-7",
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-border/80 bg-muted/60 text-foreground shadow-xs select-none dark:bg-neutral-800/80",
        sizeClasses[size],
        className
      )}
      aria-label="Evee AI"
    >
      <EveeIcon className={iconSizes[size]} />
    </div>
  )
}
