"use client"

import { Watch } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/tag"
import { ShelfCard } from "@/features/off-clock/components/personal-tile"
import { useVisibleResource } from "@/features/off-clock/lib/use-visible-resource"

import type { ActivityView } from "../lib/activity"
import { ActivityWatch, RINGS } from "./activity-watch"
import styles from "./watch.module.css"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
})

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  month: "2-digit",
  day: "2-digit",
})

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
})

/** Same clock as the Listening tile: Chicago time, dated when not today. */
function syncedLabel(iso: string) {
  const synced = new Date(iso)
  const day = dayFormatter.format(synced)
  const prefix = day === dayFormatter.format(new Date()) ? "" : `${day} · `
  return `Synced ${prefix}${timeFormatter.format(synced)} CT`
}

export function ActivityTile({ className }: { className?: string }) {
  // The phone uploads within seconds of a change; poll often enough to show it.
  const { ref, data, failed } = useVisibleResource<ActivityView>(
    "/api/activity",
    20_000
  )
  const snapshot = data && "snapshot" in data ? data.snapshot : null
  const isStale = data?.status === "stale"
  const state = snapshot
    ? isStale
      ? "Last activity"
      : "Today"
    : data || failed
      ? "Off wrist"
      : "Checking"
  const closed = snapshot
    ? RINGS.filter(({ key }) => snapshot[key] >= 100).length
    : 0
  const title = !snapshot
    ? "A little every day"
    : isStale
      ? `${weekdayFormatter.format(new Date(`${snapshot.date}T12:00:00Z`))}'s rings`
      : closed === 3
        ? "All three rings closed"
        : closed
          ? `${closed} of 3 rings closed`
          : "No rings closed yet"
  const caption =
    failed || data?.status === "unavailable"
      ? "Sync temporarily unavailable"
      : !data
        ? "Checking activity…"
        : data.status === "unconfigured"
          ? "Watch not connected yet"
          : "Awaiting the first sync"

  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <ShelfCard
        index="02"
        label="Moving"
        dividerBadge={<Tag>{state}</Tag>}
        bodyClassName="min-h-56 gap-5 pt-5"
      >
        <div className="flex flex-1 items-center gap-5">
          <ActivityWatch
            progress={snapshot || undefined}
            updatedAt={snapshot?.updatedAt}
            stale={isStale}
            className="[--case:--spacing(22)] [--paper:var(--color-zinc-50)] sm:[--case:--spacing(20)] md:[--case:--spacing(22)] dark:[--paper:var(--color-zinc-900)]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg leading-snug font-medium text-balance">
              {title}
            </p>
            <dl className="mt-2 grid gap-1.5 text-sm">
              {RINGS.map(({ key, label, tone, hue }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-2"
                >
                  <dt className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                    <span
                      aria-hidden
                      className={cn(
                        styles.dot,
                        "size-1.5 shrink-0 rounded-full"
                      )}
                      style={
                        { "--tone": tone, "--hue": hue } as React.CSSProperties
                      }
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
        </div>

        <div className="mt-auto flex items-center gap-1.5 border-t border-dashed border-line pt-3 text-xs text-muted-foreground">
          <Watch aria-hidden className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">
            {snapshot ? (
              <time
                dateTime={snapshot.updatedAt}
                title={`Activity for ${snapshot.date}`}
                className="font-mono tabular-nums"
              >
                {syncedLabel(snapshot.updatedAt)}
              </time>
            ) : (
              caption
            )}
          </span>
        </div>
      </ShelfCard>
    </div>
  )
}
