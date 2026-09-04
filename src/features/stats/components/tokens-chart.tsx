"use client"

import type { ReactNode } from "react"
import { formatCompactNumber } from "@/utils/format"
import { format } from "date-fns"
import { useReducedMotion } from "motion/react"

import { Grid } from "@/components/charts/grid"
import { Line } from "@/components/charts/line"
import { LineChart } from "@/components/charts/line-chart"
import { ChartTooltip } from "@/components/charts/tooltip"

import { getAgentLogoUrl, getModelLogoUrl } from "../lib/provider-logo"
import type { TokscaleUsageEntry } from "../lib/tokscale-parser"
import { ProviderLogo } from "./provider-logo"

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

export interface TokensChartPoint {
  date: Date
  tokens: number
  cost: number
  tokensPercent: number
  costPercent: number
  agents: TokscaleUsageEntry[]
  models: TokscaleUsageEntry[]
}

function Breakdown({
  entries,
  getLogoUrl,
}: {
  entries: TokscaleUsageEntry[]
  getLogoUrl: (name: string) => string
}): ReactNode {
  if (entries.length === 0) return null

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div
          className="flex items-center justify-between gap-4"
          key={entry.name}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            <ProviderLogo
              className="text-chart-tooltip-muted"
              url={getLogoUrl(entry.name)}
            />
            <span className="truncate text-xs text-chart-tooltip-muted">
              {entry.name}
            </span>
          </span>
          <span className="shrink-0 text-xs text-chart-tooltip-foreground tabular-nums">
            {formatCompactNumber(entry.tokens)} /{" "}
            {USD_FORMATTER.format(entry.cost)}
          </span>
        </div>
      ))}
    </div>
  )
}

function renderTokensTooltip({
  point,
}: {
  point: Record<string, unknown>
  index: number
}) {
  const data = point as unknown as TokensChartPoint

  return (
    <div className="min-w-52 px-3 py-2.5">
      <div className="mb-2 flex items-center justify-between gap-4 text-sm text-chart-tooltip-foreground">
        <span>{format(data.date, "EEE, MMM d")}</span>
        <span className="font-medium tabular-nums">
          {formatCompactNumber(data.tokens)} / {USD_FORMATTER.format(data.cost)}
        </span>
      </div>

      <Breakdown entries={data.agents} getLogoUrl={getAgentLogoUrl} />

      {data.agents.length > 0 && data.models.length > 0 ? (
        <div className="my-2 border-t border-chart-tooltip-muted/20" />
      ) : null}

      <Breakdown entries={data.models} getLogoUrl={getModelLogoUrl} />
    </div>
  )
}

export function TokensChart({ data }: { data: TokensChartPoint[] }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <LineChart
      animationDuration={shouldReduceMotion ? 0 : 700}
      aspectRatio="2 / 1"
      data={data as unknown as Record<string, unknown>[]}
      margin={{ bottom: 40, left: 20, right: 20, top: 20 }}
      xDataKey="date"
    >
      <Grid horizontal strokeDasharray="3,3" />
      <Line
        animate={!shouldReduceMotion}
        dataKey="tokensPercent"
        stroke="var(--chart-line-primary)"
        strokeWidth={2}
      />
      <Line
        animate={!shouldReduceMotion}
        dataKey="costPercent"
        stroke="var(--chart-line-secondary)"
        strokeWidth={2}
      />
      <ChartTooltip content={renderTokensTooltip} />
    </LineChart>
  )
}
