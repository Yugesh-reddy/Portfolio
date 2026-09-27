"use client"

import { Watch } from "lucide-react"

import { cn } from "@/lib/utils"
import { ShelfCard } from "@/features/off-clock/components/personal-tile"
import { useVisibleResource } from "@/features/off-clock/lib/use-visible-resource"

import type { ActivityView } from "../lib/activity"
import { ActivityRings } from "./activity-rings"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
})

const metrics = [
  { key: "move", label: "Move", tone: "bg-foreground" },
  { key: "exercise", label: "Exercise", tone: "bg-foreground/65" },
  { key: "stand", label: "Stand", tone: "bg-foreground/40" },
] as const

export function ActivityTile({ className }: { className?: string }) {
  const { ref, data, failed } = useVisibleResource<ActivityView>(
    "/api/activity",
    60_000
  )
  const snapshot = data && "snapshot" in data ? data.snapshot : null
  const isStale = data?.status === "stale"
  const fallback =
    failed || data?.status === "unavailable"
      ? "Sync temporarily unavailable"
      : !data
        ? "Checking activity…"
        : data.status === "unconfigured"
          ? "Watch not connected yet"
          : "Awaiting the first sync"

  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <ShelfCard index="02" label="Moving" bodyClassName="min-h-56 gap-4">
        <p className="leading-snug font-medium">
          {snapshot
            ? isStale
              ? "Last activity"
              : "Today's rings"
            : "A little every day"}
        </p>
        <div className="flex flex-1 items-center justify-between gap-3">
          <ActivityRings
            progress={snapshot || undefined}
            className="size-24 shrink-0"
          />
          <dl className="grid min-w-0 flex-1 gap-2.5 text-xs">
            {metrics.map(({ key, label, tone }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    aria-hidden
                    className={cn("size-1.5 shrink-0 rounded-full", tone)}
                  />
                  {label}
                </dt>
                <dd className="font-mono tabular-nums">
                  {snapshot ? (
                    `${snapshot[key]}%`
                  ) : (
                    <span aria-label="Not synced">–</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="mt-auto border-t border-dashed border-line pt-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-1.5">
            <Watch aria-hidden className="size-3.5 shrink-0" />
            {snapshot ? (
              <time
                dateTime={snapshot.updatedAt}
                title={`Activity for ${snapshot.date}. Last synced ${snapshot.updatedAt}`}
                className="font-mono tabular-nums"
              >
                {isStale
                  ? `${snapshot.date.slice(5).replace("-", "/")} · `
                  : "Synced "}
                {timeFormatter.format(new Date(snapshot.updatedAt))} CT
              </time>
            ) : (
              fallback
            )}
          </p>
          {isStale ? <p className="mt-1">Waiting for a fresh update.</p> : null}
        </div>
      </ShelfCard>
    </div>
  )
}
