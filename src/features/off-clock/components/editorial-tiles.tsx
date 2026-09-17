import Image from "next/image"
import { Clapperboard, MapPinned } from "lucide-react"

import { cn } from "@/lib/utils"

import { INTERESTS } from "../data/interests"
import styles from "./artwork.module.css"
import { ShelfCard } from "./personal-tile"
import prints from "./prints.module.css"
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
      {/* Paper is the Tag material, so "Admit one" grows into the ticket.
          Stacked on mobile, it is a fixed 18rem tall to match the Chicago
          prints (prints.module.css); the poster takes what the stub leaves. */}
      <div
        className={cn(
          ticket.ticket,
          "w-full max-w-60 self-center select-none [--paper:var(--color-zinc-50)] max-sm:h-72 max-sm:max-w-48 dark:[--paper:var(--color-zinc-900)]"
        )}
      >
        <div
          className={cn(
            ticket.admission,
            "p-1.5 max-sm:flex max-sm:min-h-0 max-sm:flex-1 max-sm:flex-col"
          )}
        >
          <div className="relative aspect-6/7 overflow-hidden rounded-sm bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring-1 after:inset-ring-black/10 max-sm:aspect-auto max-sm:flex-1 dark:after:inset-ring-white/10">
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

/** Resting and fanned poses, cycled across the prints. */
const PRINT_POSES = [
  { tilt: "-3deg", drop: "0px", fanTilt: "-6deg", fanX: "-14px" },
  { tilt: "2.5deg", drop: "14px", fanTilt: "5deg", fanX: "14px" },
  { tilt: "-1deg", drop: "6px", fanTilt: "1deg", fanX: "0px" },
]

export function ChicagoTile({ className }: { className?: string }) {
  const feature = INTERESTS.chicago.feature
  const photos = feature?.photos ?? []
  return (
    <ShelfCard
      index="04"
      label="Last stop"
      href={feature?.href}
      linkLabel={feature?.place}
      className={className}
    >
      {/* Paper is the Tag material, like the Credits rolled ticket. */}
      <div
        className={cn(
          prints.table,
          "select-none [--paper:var(--color-zinc-50)] dark:[--paper:var(--color-zinc-900)]"
        )}
      >
        {photos.length ? (
          photos.map((photo, index) => {
            const pose = PRINT_POSES[index % PRINT_POSES.length]
            const { focalLength, aperture, shutter, iso } = photo.exposure
            return (
              <figure
                key={photo.src}
                className={prints.print}
                style={
                  {
                    "--tilt": pose.tilt,
                    "--drop": pose.drop,
                    "--fan-tilt": pose.fanTilt,
                    "--fan-x": pose.fanX,
                  } as React.CSSProperties
                }
              >
                <div className="relative aspect-3/4 overflow-hidden rounded-[2px] bg-muted after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:inset-ring-1 after:inset-ring-black/10 dark:after:inset-ring-white/10">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width: 640px) 240px, 45vw"
                    className={cn(styles.artwork, "object-cover")}
                  />
                </div>
                <figcaption
                  className={cn(
                    prints.strip,
                    "flex min-w-0 flex-col justify-center gap-1.5 px-0.5 py-2"
                  )}
                >
                  <span className="font-handwritten text-lg/none text-foreground/85 sm:text-xl/none">
                    {photo.caption}
                  </span>
                  <span className="font-mono text-[10px] leading-tight text-muted-foreground">
                    {focalLength}mm ƒ/{aperture} {shutter}s ISO&nbsp;{iso}
                  </span>
                </figcaption>
              </figure>
            )
          })
        ) : (
          <div
            className={prints.print}
            style={
              {
                "--tilt": "-2deg",
                "--drop": "0px",
                "--fan-tilt": "-4deg",
                "--fan-x": "0px",
              } as React.CSSProperties
            }
          >
            <div className="flex aspect-3/4 items-center justify-center rounded-[2px] bg-muted text-muted-foreground">
              <MapPinned aria-hidden strokeWidth={1} className="size-10" />
            </div>
            <p
              className={cn(
                prints.strip,
                "flex items-center px-0.5 font-handwritten text-xl/none text-foreground/85"
              )}
            >
              Out in Chicago
            </p>
          </div>
        )}
      </div>
    </ShelfCard>
  )
}
