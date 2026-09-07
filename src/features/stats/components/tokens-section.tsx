import { formatCompactNumber } from "@/utils/format"
import { IconInfoCircle } from "@tabler/icons-react"
import { format, parseISO } from "date-fns"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

import { getModelLogoUrl } from "../lib/provider-logo"
import { getTokscaleInsights, TOKSCALE_PROFILE_URL } from "../lib/tokscale"
import { getActiveTokscaleSeries } from "../lib/tokscale-parser"
import { ProviderLogo } from "./provider-logo"
import { TokenMetricValue } from "./token-metric-value"
import { TokensChart, type TokensChartPoint } from "./tokens-chart"

const USD_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
})

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className="size-2 shrink-0 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  )
}

function Metric({
  label,
  value,
  valueFormat,
  detail,
}: {
  label: string
  value: number
  valueFormat?: "compact" | "currency" | "number"
  detail?: string
}) {
  return (
    <div className="min-w-0 bg-background p-3 sm:p-4">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono text-xl font-medium tracking-tight sm:text-2xl">
        <TokenMetricValue value={value} format={valueFormat} />
      </dd>
      {detail ? (
        <span className="mt-1 block text-xs text-muted-foreground">
          {detail}
        </span>
      ) : null}
    </div>
  )
}

export async function TokensSection() {
  const data = await getTokscaleInsights()

  if (!data) {
    return (
      <section className="screen-line-top screen-line-bottom p-4">
        <Alert>
          <AlertTitle>Token data is temporarily unavailable</AlertTitle>
          <AlertDescription>
            Tokscale could not be reached. You can still view the public profile
            at{" "}
            <a
              href={TOKSCALE_PROFILE_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              Tokscale
            </a>
            .
          </AlertDescription>
        </Alert>
      </section>
    )
  }

  const { stats, models, series, biggestDay } = data
  const activeSeries = getActiveTokscaleSeries(series)
  const hasDailyUsage = activeSeries.length > 0
  const maxTokens = Math.max(...activeSeries.map((point) => point.tokens), 0)
  const maxCost = Math.max(...activeSeries.map((point) => point.cost), 0)

  const chartData: TokensChartPoint[] = activeSeries.map((point) => ({
    date: parseISO(point.date.slice(0, 10)),
    tokens: point.tokens,
    cost: point.cost,
    tokensPercent: maxTokens > 0 ? (point.tokens / maxTokens) * 100 : 0,
    costPercent: maxCost > 0 ? (point.cost / maxCost) * 100 : 0,
    agents: point.agents,
    models: point.models,
  }))

  return (
    <section className="screen-line-top screen-line-bottom space-y-4 p-4">
      <div>
        <h2 className="font-heading text-lg font-medium tracking-tight">
          AI Token Usage
        </h2>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Usage from the coding agents and models I build with, synced from{" "}
          <a
            className="text-foreground link-underline"
            href={TOKSCALE_PROFILE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Tokscale
          </a>
          .
        </p>
      </div>

      <div className="flex flex-col gap-1 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="flex min-w-0 items-center gap-1.5">
          <span className="shrink-0">Top model</span>
          {models[0] ? (
            <>
              <ProviderLogo url={getModelLogoUrl(models[0].model)} />
              <span className="truncate font-medium text-foreground">
                {models[0].model}
              </span>
            </>
          ) : (
            <span className="font-medium text-foreground">Not available</span>
          )}
        </p>
        <p className="shrink-0 tabular-nums">
          {format(parseISO(data.startDate), "dd MMM")} -{" "}
          {format(parseISO(data.endDate), "dd MMM yyyy")}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-line ring-1 ring-line sm:grid-cols-3">
        <Metric
          label="Total Tokens"
          value={stats.totalTokens}
          valueFormat="compact"
        />
        <Metric
          label="Input Tokens"
          value={stats.inputTokens}
          valueFormat="compact"
        />
        <Metric
          label="Output Tokens"
          value={stats.outputTokens}
          valueFormat="compact"
        />
        <Metric
          label="Total Cost"
          value={stats.totalCost}
          valueFormat="currency"
        />
        <Metric label="Active Days" value={stats.activeDays} />
        <Metric
          detail={
            biggestDay
              ? format(parseISO(biggestDay.date.slice(0, 10)), "dd MMM yyyy")
              : undefined
          }
          label="Highest Cost Day"
          value={biggestDay?.cost ?? 0}
          valueFormat="currency"
        />
      </dl>

      {hasDailyUsage ? (
        <div className="rounded-xl bg-background p-3 ring-1 ring-line sm:p-4">
          <p className="sr-only" id="token-usage-chart-description">
            Daily token and estimated cost lines for recorded usage days. Data
            from January to June 2026 is incomplete because local Claude Code
            history was lost. Detailed data for active days follows the chart.
          </p>
          <div
            aria-describedby="token-usage-chart-description"
            aria-label={`Daily AI token usage from ${format(parseISO(data.startDate), "dd MMM yyyy")} to ${format(parseISO(data.endDate), "dd MMM yyyy")}`}
            role="img"
          >
            <TokensChart data={chartData} />
          </div>
          <div className="mt-3 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <LegendItem color="var(--chart-line-primary)" label="Tokens" />
              <LegendItem color="var(--chart-line-secondary)" label="Cost" />
            </div>
            <p className="flex items-start gap-1.5 text-left sm:whitespace-nowrap">
              <IconInfoCircle
                aria-hidden="true"
                className="mt-px size-3.5 shrink-0"
                stroke={1.75}
              />
              <span>
                Jan to Jun 2026 is incomplete due to lost local Claude Code
                history.
              </span>
            </p>
          </div>
          <div className="sr-only">
            <table>
              <caption>
                AI token usage for recorded active days. Dates without available
                usage are omitted from the chart.
              </caption>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Tokens</th>
                  <th>Estimated cost</th>
                  <th>Agents</th>
                  <th>Models</th>
                </tr>
              </thead>
              <tbody>
                {activeSeries.map((point) => (
                  <tr key={point.date}>
                    <td>
                      {format(parseISO(point.date.slice(0, 10)), "dd MMM yyyy")}
                    </td>
                    <td>{point.tokens}</td>
                    <td>{USD_FORMATTER.format(point.cost)}</td>
                    <td>
                      {point.agents
                        .map(
                          (entry) =>
                            `${entry.name}: ${formatCompactNumber(entry.tokens)} tokens, ${USD_FORMATTER.format(entry.cost)}`
                        )
                        .join("; ") || "None"}
                    </td>
                    <td>
                      {point.models
                        .map(
                          (entry) =>
                            `${entry.name}: ${formatCompactNumber(entry.tokens)} tokens, ${USD_FORMATTER.format(entry.cost)}`
                        )
                        .join("; ") || "None"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <Alert>
          <AlertTitle>No token usage yet</AlertTitle>
          <AlertDescription>
            New Tokscale activity will appear here after the next daily sync.
          </AlertDescription>
        </Alert>
      )}

      {models.length > 0 ? (
        <div className="overflow-x-auto rounded-xl bg-background ring-1 ring-line">
          <table className="w-full min-w-md text-sm">
            <caption className="sr-only">Most used AI models</caption>
            <thead>
              <tr className="text-xs text-muted-foreground">
                <th className="px-3 py-2.5 text-left font-normal sm:px-4">
                  Model
                </th>
                <th className="px-3 py-2.5 text-right font-normal sm:px-4">
                  Tokens
                </th>
                <th className="px-3 py-2.5 text-right font-normal sm:px-4">
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr className="border-t border-line" key={model.model}>
                  <td className="px-3 py-2.5 font-medium sm:px-4">
                    <span className="flex items-center gap-2">
                      <ProviderLogo url={getModelLogoUrl(model.model)} />
                      <span className="whitespace-nowrap">{model.model}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-right tabular-nums sm:px-4">
                    {formatCompactNumber(model.tokens)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-muted-foreground tabular-nums sm:px-4">
                    {USD_FORMATTER.format(model.cost)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
