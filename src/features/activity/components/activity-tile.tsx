"use client"

import { Activity } from "lucide-react"

import { cn } from "@/lib/utils"
import { Tag } from "@/components/ui/tag"
import {
  ShelfBadge,
  ShelfCard,
} from "@/features/off-clock/components/personal-tile"
import { useVisibleResource } from "@/features/off-clock/lib/use-visible-resource"

import type { ActivityView } from "../lib/activity"
import { ActivityRings } from "./activity-rings"

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
})

export function ActivityTile({ className }: { className?: string }) {
  const { ref, data, failed } = useVisibleResource<ActivityView>(
    "/api/activity",
    60_000
  )
  const snapshot = data && "snapshot" in data ? data.snapshot : null
  const isStale = data?.status === "stale"
  const title = snapshot
    ? isStale
      ? "Last activity"
      : "Today's rings"
    : "A little every day"
  const fallback =
    failed || data?.status === "unavailable"
      ? "Activity sync is unavailable."
      : !data
        ? "Checking activity…"
        : data.status === "unconfigured"
          ? "Daily movement. Watch sync coming soon."
          : "Waiting for the first Watch sync."
  return (
    <div ref={ref} className={cn("min-w-0", className)}>
      <ShelfCard index="02" label="Moving" live={Boolean(snapshot && !isStale)}>
        <div className="flex flex-1 flex-col items-center justify-center gap-2.5 py-1 text-center">
          <ActivityRings progress={snapshot || undefined} className="size-20" />

          <p className="flex items-center gap-2 leading-snug font-medium text-balance">
            <ShelfBadge>
              <Activity />
            </ShelfBadge>
            {title}
          </p>

          {snapshot ? (
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              <span className="sr-only">
                Move {snapshot.move}%, exercise {snapshot.exercise}%, stand{" "}
                {snapshot.stand}%.{" "}
              </span>
              <time
                dateTime={snapshot.updatedAt}
                title={`Activity for ${snapshot.date}. Last synced ${snapshot.updatedAt}`}
              >
                {isStale
                  ? `${snapshot.date.slice(5).replace("-", "/")} // `
                  : "Synced "}
                {timeFormatter.format(new Date(snapshot.updatedAt))} CT
              </time>
              {isStale ? (
                <>
                  {" // "}
                  <Tag className="align-middle">stale</Tag>
                </>
              ) : null}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{fallback}</p>
          )}
        </div>
      </ShelfCard>
    </div>
  )
}
