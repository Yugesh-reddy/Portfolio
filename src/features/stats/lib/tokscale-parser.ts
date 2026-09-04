import { z } from "zod"

export interface TokscaleStats {
  totalTokens: number
  totalCost: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  reasoningTokens: number
  activeDays: number
  sessionCount: number
}

export interface TokscaleModelUsage {
  model: string
  tokens: number
  cost: number
  percentage: number
}

export interface TokscaleUsageEntry {
  name: string
  tokens: number
  cost: number
}

export interface TokscaleDailyPoint {
  date: string
  tokens: number
  cost: number
  agents: TokscaleUsageEntry[]
  models: TokscaleUsageEntry[]
}

export interface TokscaleBiggestDay {
  date: string
  tokens: number
  cost: number
}

export interface TokscaleInsights {
  stats: TokscaleStats
  models: TokscaleModelUsage[]
  series: TokscaleDailyPoint[]
  biggestDay: TokscaleBiggestDay | null
  startDate: string
  endDate: string
}

export interface RawModelUsage {
  tokens: number
  cost: number
}

export interface RawClient {
  client: string
  cost: number
  models: Record<string, RawModelUsage>
}

export interface RawContribution {
  date: string
  totals: { tokens: number; cost: number; messages: number }
  clients: RawClient[]
}

export interface RawInitialData {
  stats: TokscaleStats
  dateRange: { start: string; end: string }
  modelUsage: TokscaleModelUsage[]
  contributions: RawContribution[]
}

const TOP_MODELS_LIMIT = 8
const SYNTHETIC_MODEL = "<synthetic>"
const PUSH_CHUNK =
  /self\.__next_f\.push\(\s*\[\s*1\s*,\s*("(?:[^"\\]|\\.)*")\s*\]\s*\)/gu
const NULL_PLACEHOLDER = "\u0000"

const NONNEGATIVE_NUMBER = z.number().finite().nonnegative()
const DATE_STRING = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)))

const RAW_MODEL_USAGE_SCHEMA = z.object({
  tokens: NONNEGATIVE_NUMBER,
  cost: NONNEGATIVE_NUMBER,
})

const TOKSCALE_MODEL_USAGE_SCHEMA = RAW_MODEL_USAGE_SCHEMA.extend({
  model: z.string().min(1),
  percentage: NONNEGATIVE_NUMBER,
})

const RAW_CLIENT_SCHEMA = z.object({
  client: z.string().min(1),
  cost: NONNEGATIVE_NUMBER,
  models: z.record(z.string(), RAW_MODEL_USAGE_SCHEMA),
})

const RAW_INITIAL_DATA_SCHEMA = z.object({
  stats: z.object({
    totalTokens: NONNEGATIVE_NUMBER,
    totalCost: NONNEGATIVE_NUMBER,
    inputTokens: NONNEGATIVE_NUMBER,
    outputTokens: NONNEGATIVE_NUMBER,
    cacheReadTokens: NONNEGATIVE_NUMBER,
    cacheWriteTokens: NONNEGATIVE_NUMBER,
    reasoningTokens: NONNEGATIVE_NUMBER,
    activeDays: NONNEGATIVE_NUMBER,
    sessionCount: NONNEGATIVE_NUMBER,
  }),
  dateRange: z.object({ start: DATE_STRING, end: DATE_STRING }),
  modelUsage: z.array(TOKSCALE_MODEL_USAGE_SCHEMA),
  contributions: z.array(
    z.object({
      date: DATE_STRING,
      totals: z.object({
        tokens: NONNEGATIVE_NUMBER,
        cost: NONNEGATIVE_NUMBER,
        messages: NONNEGATIVE_NUMBER,
      }),
      clients: z.array(RAW_CLIENT_SCHEMA),
    })
  ),
})

function parseChunk(raw: string): string | null {
  try {
    return JSON.parse(raw) as string
  } catch {
    return null
  }
}

function rebuildFlightPayload(html: string): string {
  const chunks: string[] = []

  for (const match of html.matchAll(PUSH_CHUNK)) {
    const chunk = parseChunk(match[1])
    if (chunk) chunks.push(chunk)
  }

  return chunks.join("")
}

function unescapeOnce(value: string): string {
  return value
    .replaceAll("\\\\", NULL_PLACEHOLDER)
    .replaceAll('\\"', '"')
    .replaceAll("\\n", "\n")
    .replaceAll("\\r", "\r")
    .replaceAll("\\t", "\t")
    .replaceAll("\\/", "/")
    .replaceAll(NULL_PLACEHOLDER, "\\")
}

function sliceBalancedObject(source: string): string | null {
  let depth = 0
  let inString = false
  let isEscaped = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]

    if (inString) {
      if (isEscaped) {
        isEscaped = false
      } else if (character === "\\") {
        isEscaped = true
      } else if (character === '"') {
        inString = false
      }
      continue
    }

    if (character === '"') {
      inString = true
    } else if (character === "{") {
      depth += 1
    } else if (character === "}") {
      depth -= 1
      if (depth === 0) return source.slice(0, index + 1)
    }
  }

  return null
}

export function extractTokscaleInitialData(
  html: string
): RawInitialData | null {
  const payload = unescapeOnce(rebuildFlightPayload(html))
  let searchFrom = 0

  while (searchFrom < payload.length) {
    const anchor = payload.indexOf('"initialData"', searchFrom)
    if (anchor === -1) return null

    const objectStart = payload.lastIndexOf("{", anchor)
    searchFrom = anchor + 1
    if (objectStart === -1) continue

    const balanced = sliceBalancedObject(payload.slice(objectStart))
    if (!balanced) continue

    try {
      const parsed = JSON.parse(balanced) as { initialData?: unknown }
      const result = RAW_INITIAL_DATA_SCHEMA.safeParse(parsed.initialData)
      if (result.success) return result.data
    } catch {
      continue
    }
  }

  return null
}

function sortByTokensDescending(
  first: TokscaleUsageEntry,
  second: TokscaleUsageEntry
) {
  return second.tokens - first.tokens
}

function sumClientTokens(models: Record<string, RawModelUsage>): number {
  return Object.entries(models).reduce(
    (total, [name, usage]) =>
      name === SYNTHETIC_MODEL ? total : total + usage.tokens,
    0
  )
}

function buildAgentBreakdown(clients: RawClient[]): TokscaleUsageEntry[] {
  return clients
    .map((client) => ({
      name: client.client,
      tokens: sumClientTokens(client.models),
      cost: client.cost,
    }))
    .toSorted(sortByTokensDescending)
}

function buildModelBreakdown(clients: RawClient[]): TokscaleUsageEntry[] {
  const totals = new Map<string, { tokens: number; cost: number }>()

  for (const client of clients) {
    for (const [name, usage] of Object.entries(client.models)) {
      if (name === SYNTHETIC_MODEL) continue

      const current = totals.get(name) ?? { tokens: 0, cost: 0 }
      totals.set(name, {
        tokens: current.tokens + usage.tokens,
        cost: current.cost + usage.cost,
      })
    }
  }

  return [...totals.entries()]
    .map(([name, usage]) => ({ name, ...usage }))
    .toSorted(sortByTokensDescending)
}

function fillInactiveDays(
  points: TokscaleDailyPoint[],
  startDate: string,
  endDate: string
): TokscaleDailyPoint[] {
  const pointsByDate = new Map(
    points.map((point) => [point.date.slice(0, 10), point])
  )
  const start = new Date(`${startDate.slice(0, 10)}T00:00:00.000Z`)
  const end = new Date(`${endDate.slice(0, 10)}T00:00:00.000Z`)
  const dayCount = Math.floor((end.getTime() - start.getTime()) / 86_400_000)

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    dayCount < 0 ||
    dayCount > 3_650
  ) {
    return points
  }

  return Array.from({ length: dayCount + 1 }, (_, offset) => {
    const date = new Date(start.getTime() + offset * 86_400_000)
    const dateKey = date.toISOString().slice(0, 10)

    return (
      pointsByDate.get(dateKey) ?? {
        date: date.toISOString(),
        tokens: 0,
        cost: 0,
        agents: [],
        models: [],
      }
    )
  })
}

export function getActiveTokscaleSeries(
  series: TokscaleDailyPoint[]
): TokscaleDailyPoint[] {
  return series.filter((point) => point.tokens > 0 || point.cost > 0)
}

export function buildTokscaleInsights(data: RawInitialData): TokscaleInsights {
  const models = data.modelUsage
    .filter((entry) => entry.model !== SYNTHETIC_MODEL)
    .toSorted((first, second) => second.tokens - first.tokens)
    .slice(0, TOP_MODELS_LIMIT)

  const activeSeries = data.contributions
    .map((point) => ({
      date: new Date(point.date).toISOString(),
      tokens: point.totals.tokens,
      cost: point.totals.cost,
      agents: buildAgentBreakdown(point.clients),
      models: buildModelBreakdown(point.clients),
    }))
    .toSorted(
      (first, second) =>
        new Date(first.date).getTime() - new Date(second.date).getTime()
    )

  const series = fillInactiveDays(
    activeSeries,
    data.dateRange.start,
    data.dateRange.end
  )

  const biggestDay = activeSeries.reduce<TokscaleBiggestDay | null>(
    (biggest, point) =>
      biggest === null || point.cost > biggest.cost
        ? { date: point.date, tokens: point.tokens, cost: point.cost }
        : biggest,
    null
  )

  return {
    stats: data.stats,
    models,
    series,
    biggestDay,
    startDate: data.dateRange.start,
    endDate: data.dateRange.end,
  }
}
