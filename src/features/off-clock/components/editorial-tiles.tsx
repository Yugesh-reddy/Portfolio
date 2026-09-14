import Image from "next/image"
import { Clapperboard, MapPinned } from "lucide-react"

import { Tag } from "@/components/ui/tag"

import { INTERESTS } from "../data/interests"
import { ShelfBadge, ShelfCard } from "./personal-tile"
import styles from "./watching-tile.module.css"

export function WatchingTile({ className }: { className?: string }) {
  const feature = INTERESTS.watching.feature
  return (
    <ShelfCard
      index="03"
      label="Recently watched"
      href={feature?.href}
      linkLabel={
        feature
          ? [feature.title, feature.note].filter(Boolean).join(" · ")
          : undefined
      }
      dividerBadge={<Tag>Admit one</Tag>}
      bodyClassName="pt-5"
      className={className}
    >
      {feature?.image ? (
        <div className="relative mb-3 w-full max-w-44 self-center overflow-hidden rounded-lg bg-muted inset-ring-1 inset-ring-black/10 select-none dark:inset-ring-white/10">
          <Image
            src={feature.image}
            alt={feature.imageAlt || feature.title}
            width={528}
            height={776}
            sizes="176px"
            className={`${styles.poster} block h-auto w-full`}
          />
        </div>
      ) : null}

      <div className="flex items-center gap-2.5">
        {!feature?.image ? (
          <ShelfBadge>
            <Clapperboard />
          </ShelfBadge>
        ) : null}
        <div className="min-w-0">
          <p
            className="leading-snug font-medium text-balance"
            title={feature?.title || "Movies & anime"}
          >
            {feature?.title || "Movies & anime"}
          </p>
          {feature?.note || !feature ? (
            <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
              {feature?.note || "Always up for a good story."}
            </p>
          ) : null}
        </div>
      </div>
    </ShelfCard>
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
