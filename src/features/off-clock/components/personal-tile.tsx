import type { ReactNode } from "react"
import { ArrowUpRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

type ShelfCardProps = {
  /** Two-digit shelf number, e.g. "01" — same mono treatment as TechStack. */
  index: string
  label: string
  href?: string
  live?: boolean
  linkLabel?: string
  bodyClassName?: string
  className?: string
  children: ReactNode
}

export function ShelfCard({
  index,
  label,
  href,
  live = false,
  linkLabel,
  bodyClassName,
  className,
  children,
}: ShelfCardProps) {
  const header = (
    <>
      <div className="flex items-center gap-2 px-4 pt-3.5">
        <span
          aria-hidden
          className="font-mono text-[11px] text-muted-foreground/50 select-none"
        >
          {index}
        </span>
        <span className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <span className="ml-auto flex shrink-0 items-center">
          {live ? (
            <span className="relative flex size-2" aria-label="Live">
              <span className="absolute inline-flex size-full rounded-full bg-foreground opacity-40 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-foreground" />
            </span>
          ) : null}
          {href ? (
            <ArrowUpRightIcon
              aria-hidden
              className={cn(
                "size-3.5 text-muted-foreground transition-[transform,color] duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground",
                live && "ml-2"
              )}
            />
          ) : null}
        </span>
      </div>
      <div
        aria-hidden
        className="mx-4 mt-3 border-t border-dashed border-line"
      />
    </>
  )

  const body = (
    <div className={cn("flex flex-1 flex-col p-4", bodyClassName)}>
      {children}
    </div>
  )

  if (href) {
    return (
      <a
        className={cn(
          "group relative flex h-full flex-col bg-background transition-colors duration-200 ease-out hover:bg-accent-muted",
          "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
          className
        )}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${linkLabel || label} (opens in a new tab)`}
      >
        {header}
        {body}
      </a>
    )
  }

  return (
    <article
      aria-label={label}
      className={cn(
        "group relative flex h-full flex-col bg-background transition-colors duration-200 ease-out hover:bg-accent-muted",
        className
      )}
    >
      {header}
      {body}
    </article>
  )
}

/** Small icon badge — same tokens as bookmark / certification / intro rows. */
export function ShelfBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-6 shrink-0 items-center justify-center rounded-lg border border-muted-foreground/15 bg-muted text-muted-foreground ring-1 ring-line ring-offset-1 ring-offset-background select-none [&_svg]:size-4",
        className
      )}
      {...props}
    />
  )
}

/** Artwork thumb with the post-image ring treatment. */
export function ShelfArt({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative size-14 shrink-0 overflow-hidden rounded-md bg-muted text-muted-foreground inset-ring-1 inset-ring-black/10 select-none",
        "dark:inset-ring-white/10",
        "[&_img]:size-full [&_img]:object-cover",
        className
      )}
      {...props}
    />
  )
}
