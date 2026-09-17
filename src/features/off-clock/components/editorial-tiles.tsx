import Image from "next/image"
import { Clapperboard, MapPinned } from "lucide-react"

import { cn } from "@/lib/utils"

import { INTERESTS } from "../data/interests"
import styles from "./artwork.module.css"
import { ShelfBadge, ShelfCard } from "./personal-tile"
import ticket from "./ticket.module.css"

export function WatchingTile({ className }: { className?: string }) {
  const feature = INTERESTS.watching.feature
  const title = feature?.title || "Movies & anime"
  return (
    <ShelfCard
      index="03"
      label="Credits rolled"
      href={feature?.href}
      linkLabel={
        feature
          ? [feature.title, feature.note].filter(Boolean).join(" · ")
          : undefined
      }
      className={className}
    >
      {/* Paper is the Tag material, so "Admit one" grows into the ticket. */}
      <div
        className={cn(
          ticket.ticket,
          "w-full max-w-60 self-center select-none [--paper:var(--color-zinc-50)] dark:[--paper:var(--color-zinc-900)]"
        )}
      >
        <div className={cn(ticket.admission, "p-1.5")}>
          <div className="relative aspect-6/7 overflow-hidden rounded-sm bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring-1 after:inset-ring-black/10 dark:after:inset-ring-white/10">
            {feature?.image ? (
              <Image
                src={feature.image}
                alt={feature.imageAlt || feature.title}
                fill
                sizes="240px"
                className={cn(styles.artwork, "object-cover object-top")}
              />
            ) : (
              <span className="flex size-full items-center justify-center text-muted-foreground">
                <Clapperboard aria-hidden strokeWidth={1} className="size-10" />
              </span>
            )}
          </div>
        </div>

        <div className={cn(ticket.stub, "px-3 pt-3 pb-3")}>
          <span aria-hidden className={ticket.perforation} />
          <p className="flex justify-between gap-3 font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            <span>Admit one</span>
            {feature?.note ? (
              <span className="truncate">{feature.note}</span>
            ) : null}
          </p>
          <p className="mt-1.5 leading-snug font-medium text-balance">
            {title}
          </p>
          {!feature ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              Always up for a good story.
            </p>
          ) : null}
          <Barcode
            value={title}
            className="mt-3 h-4 w-full text-muted-foreground/50"
          />
        </div>
      </div>
    </ShelfCard>
  )
}

/** Decorative stub barcode, derived from the title so it never changes. */
function Barcode({ value, className }: { value: string; className?: string }) {
  let x = 0
  let end = 0
  let path = ""
  for (const char of value) {
    const code = char.charCodeAt(0)
    for (const bits of [code & 3, (code >> 2) & 3]) {
      const width = (bits % 3) + 1
      path += `M${x} 0h${width}v1h-${width}z`
      end = x + width
      x = end + ((code >> 4) & 1) + 1
    }
  }
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${end} 1`}
      preserveAspectRatio="none"
      shapeRendering="crispEdges"
      className={className}
    >
      <path d={path} fill="currentColor" />
    </svg>
  )
}

export function ChicagoTile({ className }: { className?: string }) {
  const feature = INTERESTS.chicago.feature
  return (
    <ShelfCard
      index="04"
      label="Around Chicago"
      href={feature?.href}
      className={className}
    >
      <figure className="flex flex-col">
        {feature?.image ? (
          <span className="relative block aspect-[16/10] w-full overflow-hidden rounded-xl inset-ring-1 inset-ring-black/10 select-none dark:inset-ring-white/10">
            <Image
              src={feature.image}
              alt={feature.imageAlt || feature.title}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
            />
          </span>
        ) : (
          <span className="flex min-h-36 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line text-muted-foreground select-none">
            <ShelfBadge>
              <MapPinned />
            </ShelfBadge>
            <span className="font-mono text-xs tabular-nums">
              41.8781°N 87.6298°W
            </span>
          </span>
        )}
        <figcaption className="mt-2 flex items-center gap-2 font-mono text-xs text-zinc-400 select-none dark:text-zinc-700">
          <span aria-hidden>FIG_003</span>
          <span className="truncate text-muted-foreground">
            {feature?.title || "Out in Chicago"} —{" "}
            {feature?.note || "City walks. Learning photography."}
          </span>
        </figcaption>
      </figure>
    </ShelfCard>
  )
}
