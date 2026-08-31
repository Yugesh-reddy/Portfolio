import React from "react"
import { SparklesIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function EveeAvatar({
  className,
  size = "md",
}: {
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "size-5 text-xs",
    md: "size-7 text-sm",
    lg: "size-9 text-base",
  }

  const iconSizes = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500/20 via-primary/20 to-indigo-500/20 text-primary ring-1 ring-primary/30 dark:from-amber-400/15 dark:via-primary/25 dark:to-indigo-400/20 dark:ring-primary/40",
        sizeClasses[size],
        className
      )}
      aria-label="Evee AI"
    >
      <SparklesIcon className={cn("fill-current/20", iconSizes[size])} />
    </div>
  )
}
