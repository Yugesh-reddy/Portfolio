"use client"

import { use, useCallback, useState } from "react"
import { LoaderIcon } from "lucide-react"

import { formatDate } from "@/lib/format-date"
import { Tooltip, TooltipContent } from "@/components/base/ui/tooltip"
import type { Activity } from "@/registry/components/contribution-graph"
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/registry/components/contribution-graph"

type HoveredBlock = {
  element: SVGRectElement
  date: string
  count: number
}

export function GitHubContributionGraph({
  contributions,
}: {
  contributions: Promise<Activity[]>
}) {
  const data = use(contributions)
  const [hovered, setHovered] = useState<HoveredBlock | null>(null)

  const handlePointerOver = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const target = event.target
      if (!(target instanceof SVGRectElement)) return
      const date = target.dataset.date
      const count = Number(target.dataset.count)
      if (!date || Number.isNaN(count)) return
      setHovered((prev) =>
        prev?.element === target ? prev : { element: target, date, count }
      )
    },
    []
  )

  const handlePointerLeave = useCallback(() => {
    setHovered(null)
  }, [])

  return (
    <ContributionGraph
      className="mx-auto gap-4 py-4"
      data={data}
      blockSize={12}
      blockMargin={2}
      blockRadius={0}
      aria-label="GitHub Contributions Graph"
    >
      <ContributionGraphCalendar
        className="px-4 **:data-[slot=month-labels]:text-muted-foreground min-[800px]:no-scrollbar"
        title="GitHub Contributions"
        aria-hidden
        onPointerOver={handlePointerOver}
        onPointerLeave={handlePointerLeave}
      >
        {({ activity, dayIndex, weekIndex }) => (
          <ContributionGraphBlock
            activity={activity}
            dayIndex={dayIndex}
            weekIndex={weekIndex}
          />
        )}
      </ContributionGraphCalendar>

      <Tooltip open={Boolean(hovered)}>
        {hovered ? (
          <TooltipContent anchor={hovered.element} className="font-sans">
            <p>
              {hovered.count} contribution{hovered.count > 1 ? "s" : null} on{" "}
              {formatDate(hovered.date)}
            </p>
          </TooltipContent>
        ) : null}
      </Tooltip>

      <ContributionGraphFooter className="gap-4 px-4 leading-none">
        <ContributionGraphTotalCount>
          {({ totalCount }) => (
            <div className="flex min-w-0 items-baseline gap-3 text-muted-foreground">
              <span className="pointer-events-none shrink-0 font-mono text-xs leading-none text-zinc-400 select-none dark:text-zinc-700">
                FIG_002
              </span>
              <span className="whitespace-normal">
                {totalCount.toLocaleString("en")} contributions in the past 365
                days.
              </span>
            </div>
          )}
        </ContributionGraphTotalCount>

        <ContributionGraphLegend aria-hidden />
      </ContributionGraphFooter>
    </ContributionGraph>
  )
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-45 w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  )
}
