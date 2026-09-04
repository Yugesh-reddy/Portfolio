import assert from "node:assert/strict"
import test from "node:test"

const modulePath = new URL(
  "../src/features/stats/lib/tokscale-parser.ts",
  import.meta.url
)
const providerModulePath = new URL(
  "../src/features/stats/lib/provider-logo.ts",
  import.meta.url
)

const rawData = {
  stats: {
    totalTokens: 625,
    totalCost: 4.25,
    inputTokens: 500,
    outputTokens: 125,
    cacheReadTokens: 80,
    cacheWriteTokens: 20,
    reasoningTokens: 50,
    activeDays: 2,
    sessionCount: 7,
  },
  dateRange: {
    start: "2026-02-01T00:00:00.000Z",
    end: "2026-02-02T00:00:00.000Z",
  },
  modelUsage: [
    { model: "claude-opus-4", tokens: 200, cost: 2, percentage: 32 },
    { model: "gpt-5", tokens: 425, cost: 2.25, percentage: 68 },
    { model: "<synthetic>", tokens: 9999, cost: 0, percentage: 0 },
  ],
  contributions: [
    {
      date: "2026-02-02T00:00:00.000Z",
      totals: { tokens: 300, cost: 3.25, messages: 4 },
      clients: [
        {
          client: "codex",
          cost: 1.25,
          models: {
            "gpt-5": { tokens: 100, cost: 1.25 },
            "<synthetic>": { tokens: 4000, cost: 0 },
          },
        },
        {
          client: "claude",
          cost: 2,
          models: { "claude-opus-4": { tokens: 200, cost: 2 } },
        },
      ],
    },
    {
      date: "2026-02-01T00:00:00.000Z",
      totals: { tokens: 325, cost: 1, messages: 3 },
      clients: [
        {
          client: "codex",
          cost: 1,
          models: { "gpt-5": { tokens: 325, cost: 1 } },
        },
      ],
    },
  ],
}

function flightHtml(data) {
  const payload = JSON.stringify({ initialData: data })
  return flightHtmlFromPayload(payload)
}

function flightHtmlFromPayload(payload, whitespace = false) {
  const midpoint = Math.floor(payload.length / 2)
  const chunks = [payload.slice(0, midpoint), payload.slice(midpoint)]

  return chunks
    .map((chunk) =>
      whitespace
        ? `<script>self.__next_f.push( [ 1, ${JSON.stringify(chunk)} ] )</script>`
        : `<script>self.__next_f.push([1,${JSON.stringify(chunk)}])</script>`
    )
    .join("")
}

test("exports the Tokscale parsing API", async () => {
  const parser = await import(modulePath.href)

  assert.equal(typeof parser.extractTokscaleInitialData, "function")
  assert.equal(typeof parser.buildTokscaleInsights, "function")
})

test("extracts initial data from a chunked Next.js flight payload", async () => {
  const { extractTokscaleInitialData } = await import(modulePath.href)

  assert.deepEqual(extractTokscaleInitialData(flightHtml(rawData)), rawData)
})

test("returns null when a Tokscale payload is missing or malformed", async () => {
  const { extractTokscaleInitialData } = await import(modulePath.href)

  assert.equal(extractTokscaleInitialData("<html />"), null)
  assert.equal(
    extractTokscaleInitialData(
      '<script>self.__next_f.push([1,"{\\"initialData\\":{"])</script>'
    ),
    null
  )
})

test("skips decoy anchors and accepts whitespace around Flight chunks", async () => {
  const { extractTokscaleInitialData } = await import(modulePath.href)
  const payload = [
    JSON.stringify({ copy: "initialData is loading" }),
    JSON.stringify({ initialData: rawData }),
  ].join("")

  assert.deepEqual(
    extractTokscaleInitialData(flightHtmlFromPayload(payload, true)),
    rawData
  )
})

test("rejects partial external payloads before they reach the UI", async () => {
  const { extractTokscaleInitialData } = await import(modulePath.href)
  const partialData = {
    dateRange: rawData.dateRange,
    modelUsage: rawData.modelUsage,
    contributions: rawData.contributions,
  }

  assert.equal(extractTokscaleInitialData(flightHtml(partialData)), null)
})

test("builds sorted daily, agent, and model insights", async () => {
  const { buildTokscaleInsights } = await import(modulePath.href)

  const insights = buildTokscaleInsights(rawData)

  assert.equal(insights.models.length, 2)
  assert.equal(insights.models[0].model, "gpt-5")
  assert.equal(insights.series[0].date, "2026-02-01T00:00:00.000Z")
  assert.deepEqual(insights.series[1].agents, [
    { name: "claude", tokens: 200, cost: 2 },
    { name: "codex", tokens: 100, cost: 1.25 },
  ])
  assert.deepEqual(insights.series[1].models, [
    { name: "claude-opus-4", tokens: 200, cost: 2 },
    { name: "gpt-5", tokens: 100, cost: 1.25 },
  ])
  assert.deepEqual(insights.biggestDay, {
    date: "2026-02-02T00:00:00.000Z",
    tokens: 300,
    cost: 3.25,
  })
})

test("fills inactive calendar days with zero-usage chart points", async () => {
  const { buildTokscaleInsights } = await import(modulePath.href)
  const insights = buildTokscaleInsights({
    ...rawData,
    dateRange: {
      start: "2026-02-01",
      end: "2026-02-03",
    },
  })

  assert.equal(insights.series.length, 3)
  assert.deepEqual(insights.series[2], {
    date: "2026-02-03T00:00:00.000Z",
    tokens: 0,
    cost: 0,
    agents: [],
    models: [],
  })
})

test("selects only recorded usage days for the visual chart", async () => {
  const { buildTokscaleInsights, getActiveTokscaleSeries } = await import(
    modulePath.href
  )
  const insights = buildTokscaleInsights({
    ...rawData,
    dateRange: {
      start: "2026-02-01",
      end: "2026-02-03",
    },
  })

  assert.deepEqual(
    getActiveTokscaleSeries(insights.series).map((point) => point.date),
    ["2026-02-01T00:00:00.000Z", "2026-02-02T00:00:00.000Z"]
  )
})

test("does not select an inactive date as the highest cost day", async () => {
  const { buildTokscaleInsights } = await import(modulePath.href)
  const insights = buildTokscaleInsights({
    ...rawData,
    stats: {
      ...rawData.stats,
      totalTokens: 0,
      totalCost: 0,
      activeDays: 0,
    },
    modelUsage: [],
    contributions: [],
  })

  assert.equal(insights.series.length, 2)
  assert.equal(insights.biggestDay, null)
})

test("resolves Tokscale model and agent names to provider logos", async () => {
  const { getAgentLogoUrl, getModelLogoUrl } = await import(
    providerModulePath.href
  )

  assert.equal(
    getModelLogoUrl("cursor-grok-4.6-xhigh"),
    "https://models.dev/logos/xai.svg"
  )
  assert.equal(
    getModelLogoUrl("composer-2.5-fast"),
    "https://models.dev/logos/cursor.svg"
  )
  assert.equal(
    getModelLogoUrl("claude-opus-5"),
    "https://models.dev/logos/anthropic.svg"
  )
  assert.equal(getAgentLogoUrl("codex"), "https://models.dev/logos/openai.svg")
  assert.equal(getAgentLogoUrl("cursor"), "https://models.dev/logos/cursor.svg")
})
